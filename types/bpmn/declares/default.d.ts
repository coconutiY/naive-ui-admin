import { Connection, Root, Shape, Label, Parent, ModdleElement } from 'bpmn-js/lib/model/Types';
import { CanvasViewbox } from 'diagram-js/lib/core/Canvas';

declare global {
  type BpmnModdleEl = ModdleElement & ElementLike;
  type BpmnRoot = BpmnModdleEl & Root;
  type BpmnShape = BpmnModdleEl & Shape;
  type BpmnConnection = BpmnModdleEl & Connection;
  type BpmnLabel = BpmnModdleEl & Label;
  type BpmnParent = BpmnModdleEl & Parent;

  type BpmnElement = BpmnRoot | BpmnShape | BpmnConnection | BpmnLabel | BpmnParent;

  type CommandContextGetter = () => Record<string, unknown>;
  type CommandContext = {
    cmd: string;
    context: Record<string, unknown> | CommandContextGetter;
  };

  type OptionItem = {
    name: string;
    value: string;
  };

  type PropertyOptions = OptionItem[];

  interface InternalEvent {
    type: string; // 发生的事件名称，但是很快会被置为undefined
    element: BpmnElement;
    elements: BpmnElement[];
    shape: Shape;
    originalEvent: MouseEvent;
    context: object; // 有点复杂，有兴趣的朋友可以研究
    gfx?: SVGElement;
    svg?: SVGElement;
    viewport?: SVGElement;
    viewbox?: CanvasViewbox;
    pad?: object; // 见 Element.pad
  }

  /**
   * 元素改变（内部属性更新等）事件（modbus回调）
   */
  type ElementChanged = {
    element: BpmnElement;
    gfx: HTMLElement | object;
    type: string | undefined;
  };

  /**
   * 选中元素改变事件（modbus回调）
   */
  type SelectionChanged = {
    /**
     * 新选中的所有元素
     */
    newSelection: BpmnElement[];
    /**
     * 之前选中的所有元素
     */
    oldSelection: BpmnElement[];
    /**
     * 事件类型
     */
    type: string;
  };

  /**
   * palette元素类型
   */
  type PaletteElement = {
    group: string;
    type: string;
    className: string;
    title: string | undefined;
    visible: boolean;
  };
}

declare module 'bpmn-js-properties-panel';

declare module 'diagram-js-minimap';
