import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu';
import { Base } from 'diagram-js/lib/model';
import Canvas, { Position } from 'diagram-js/lib/core/Canvas';
import Emitter from '@/components/Designer/src/utils/event-emitter';
import { InternalEvent } from 'diagram-js/lib/core/EventBus';
import Modeler from 'bpmn-js/lib/Modeler';
import { isAppendAction } from '@/components/Designer/src/utils/tools';

export default function enhancementContextmenu(modeler: Modeler) {
  const config: any = {
    contextmenu: true,
    customContextmenu: false,
    templateChooser: true,
  };
  /**
   * 是否开启快捷创建
   */
  if (!config.contextmenu) {
    return;
  }
  modeler.on('element.contextmenu', 1000, (event: InternalEvent) => {
    const { element, originalEvent } = event;
    // 自定义右键菜单
    if (config.customContextmenu) {
      return Emitter.emit('show-contextmenu', originalEvent, element);
    }
    // 官方面板右键扩展
    if (config.templateChooser) {
      // 1. 更改元素类型
      //2. 创建新元素 (仅开启模板扩展时可以)
      if (!isAppendAction(element)) {
        openPopupMenu(modeler, element, originalEvent, 'replace');
      } else {
        openPopupMenu(modeler, element, originalEvent, 'create');
      }
    }
  });
}

const openPopupMenu = (modeler: Modeler, element: Base, event: MouseEvent, type: string) => {
  const popupMenu: PopupMenu = modeler.get('popupMenu');
  const canvas: Canvas = modeler.get('canvas');
  if (type === 'replace') {
    if (popupMenu && !popupMenu.isEmpty(element, 'bpmn-replace')) {
      popupMenu.open(
        element,
        'bpmn-replace',
        {
          x: event.clientX + 10,
          y: event.clientY + 10,
        },
        {
          title: '更换元素',
          width: 300,
          search: true,
        }
      );
    }
  } else {
    const rootElement = canvas.getRootElement();
    const position: Position = getContextMenuPosition(event);
    popupMenu.open(rootElement as Base, 'bpmn-create', position, {
      title: '创建元素',
      width: 300,
      search: true,
    });
  }
  const container = canvas.getContainer();
  const closePopupMenu = () => {
    if (popupMenu && popupMenu.isOpen()) {
      popupMenu.close();
      container.removeEventListener('click', closePopupMenu);
    }
  };
  container.addEventListener('click', closePopupMenu);
};

///// utils
/**
 * 获取弹出面板的位置
 * @param event
 * @param offset
 */
const getContextMenuPosition = (event: MouseEvent, offset?: boolean): Position => {
  return {
    x: event.clientX + (offset ? 10 : 0),
    y: event.clientY + (offset ? 25 : 0),
  };
};
