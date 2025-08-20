import { Connection, Label, Shape } from 'diagram-js/lib/model/Types';

export type ElementChangeParams = {
  element: Shape | Element | Connection | Label | any;
  gfx: HTMLElement | object;
  type: string | undefined;
};

export type SelectionChangeParams = {
  /**
   * 新选中的所有元素
   */
  newSelection: any[];
  /**
   * 之前选中的所有元素
   */
  oldSelection: any[];
  /**
   * 事件类型
   */
  type: string;
};

export type PaletteElement = {
  group: string;
  type: string;
  className: string;
  title: string | undefined;
  visible: boolean;
};
