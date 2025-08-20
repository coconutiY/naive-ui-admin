import ContextPadProvider, {
  ContextPadConfig,
  Translate,
} from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { Injector } from 'didi';
import EventBus from 'diagram-js/lib/core/EventBus';
import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad';
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js';
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import Connect from 'diagram-js/lib/features/connect/Connect';
import Create from 'diagram-js/lib/features/create/Create';
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu';
import Canvas from 'diagram-js/lib/core/Canvas';
import Rules from 'diagram-js/lib/features/rules/Rules';
import AppendPreview from 'bpmn-js/lib/features/append-preview/AppendPreview';

class RewriteContextPadProvider extends ContextPadProvider {
  // @ts-ignore
  private _contextPad: ContextPad;
  // @ts-ignore
  private _modeling: Modeling;
  // @ts-ignore
  private _elementFactory: ElementFactory;
  // @ts-ignore
  private _autoPlace: any;
  // @ts-ignore
  private _connect: Connect;
  // @ts-ignore
  private _create: Create;
  // @ts-ignore
  private _popupMenu: PopupMenu;
  // @ts-ignore
  private _canvas: Canvas;
  // @ts-ignore
  private _rules: Rules;
  constructor(
    config: ContextPadConfig,
    injector: Injector,
    eventBus: EventBus,
    contextPad: ContextPad,
    modeling: Modeling,
    elementFactory: ElementFactory,
    connect: Connect,
    create: Create,
    popupMenu: PopupMenu,
    canvas: Canvas,
    rules: Rules,
    translate: Translate,
    appendPreview: AppendPreview
  ) {
    super(
      config,
      injector,
      eventBus,
      contextPad,
      modeling,
      elementFactory,
      connect,
      create,
      popupMenu,
      canvas,
      rules,
      translate,
      appendPreview
    );

    this._contextPad = contextPad;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._connect = connect;
    this._create = create;
    this._popupMenu = popupMenu;
    this._canvas = canvas;
    this._rules = rules;

    this._autoPlace = injector.get('autoPlace', false);
  }

  getContextPadEntries() {
    const actions: Record<string, any> = {};

    // 添加一个与edit一组的按钮
    actions['enhancement-op-1'] = {
      group: 'edit',
      className: 'enhancement-op',
      title: '扩展操作1',
      action: {
        click: function () {
          alert('点击 扩展操作1');
        },
      },
    };

    // 添加一个新分组的自定义按钮
    actions['enhancement-op'] = {
      group: 'enhancement',
      className: 'enhancement-op',
      title: '扩展操作2',
      action: {
        click: function () {
          alert('点击 扩展操作2');
        },
      },
    };

    return actions;
  }
}

export default RewriteContextPadProvider;
