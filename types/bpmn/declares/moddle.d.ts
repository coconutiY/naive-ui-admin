declare module 'moddle' {
  /**
   * Moddle类 - 用于创建和管理BPMN模型
   */
  export class Moddle {
    /**
     * 创建moddle实例
     * @param packages 包配置对象
     * @param options 选项配置
     */
    constructor(packages?: any, options?: ModdleOptions);

    /**
     * 创建指定类型的元素
     * @param type 元素类型
     * @param attrs 元素属性
     * @param options 创建选项
     */
    create(type: string, attrs?: any, options?: CreateOptions): any;

    /**
     * 创建指定类型的元素（工厂方法）
     * @param type 元素类型
     * @param attrs 元素属性
     */
    createElement(type: string, attrs?: any): any;

    /**
     * 从JSON创建元素
     * @param json JSON对象
     * @param options 选项
     */
    fromJSON(json: any, options?: FromJSONOptions): any;

    /**
     * 将元素转换为JSON
     * @param element 要转换的元素
     * @param options 选项
     */
    toJSON(element: any, options?: ToJSONOptions): any;

    /**
     * 获取元素的类型信息
     * @param element 元素
     */
    getType(element: any): any;

    /**
     * 获取指定类型的描述
     * @param type 类型名称
     */
    getTypeDescriptor(type: string): any;

    /**
     * 获取所有可用的类型
     */
    getTypes(): any[];

    /**
     * 验证元素
     * @param element 要验证的元素
     * @param options 验证选项
     */
    validate(element: any, options?: ValidateOptions): ValidationResult[];

    /**
     * 克隆元素
     * @param element 要克隆的元素
     * @param options 克隆选项
     */
    clone(element: any, options?: CloneOptions): any;

    /**
     * 获取包信息
     */
    getPackages(): any[];

    /**
     * 获取指定包
     * @param name 包名
     */
    getPackage(name: string): any;
  }

  /**
   * Moddle选项接口
   */
  export interface ModdleOptions {
    /** 是否启用严格模式 */
    strict?: boolean;
    /** 是否启用验证 */
    validate?: boolean;
    /** 自定义验证器 */
    validators?: any[];
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 创建选项接口
   */
  export interface CreateOptions {
    /** 是否克隆属性 */
    clone?: boolean;
    /** 父元素 */
    parent?: any;
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 从JSON创建选项接口
   */
  export interface FromJSONOptions {
    /** 是否验证 */
    validate?: boolean;
    /** 是否克隆 */
    clone?: boolean;
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 转换为JSON选项接口
   */
  export interface ToJSONOptions {
    /** 是否包含默认值 */
    defaults?: boolean;
    /** 是否包含计算属性 */
    computed?: boolean;
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 验证选项接口
   */
  export interface ValidateOptions {
    /** 是否严格验证 */
    strict?: boolean;
    /** 自定义验证规则 */
    rules?: any[];
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 验证结果接口
   */
  export interface ValidationResult {
    /** 验证消息 */
    message: string;
    /** 验证类型 */
    type: 'error' | 'warning' | 'info';
    /** 相关元素 */
    element?: any;
    /** 属性名 */
    property?: string;
    /** 其他信息 */
    [key: string]: any;
  }

  /**
   * 克隆选项接口
   */
  export interface CloneOptions {
    /** 是否深度克隆 */
    deep?: boolean;
    /** 是否包含引用 */
    references?: boolean;
    /** 其他选项 */
    [key: string]: any;
  }

  /**
   * 包接口
   */
  export interface Package {
    /** 包名 */
    name: string;
    /** 包版本 */
    version?: string;
    /** 包描述 */
    description?: string;
    /** 包类型 */
    types?: any[];
    /** 包属性 */
    properties?: any[];
    /** 其他信息 */
    [key: string]: any;
  }

  /**
   * 类型描述符接口
   */
  export interface TypeDescriptor {
    /** 类型名 */
    name: string;
    /** 类型描述 */
    description?: string;
    /** 父类型 */
    extends?: string;
    /** 属性定义 */
    properties?: PropertyDescriptor[];
    /** 其他信息 */
    [key: string]: any;
  }

  /**
   * 属性描述符接口
   */
  export interface PropertyDescriptor {
    /** 属性名 */
    name: string;
    /** 属性类型 */
    type: string;
    /** 是否必需 */
    required?: boolean;
    /** 默认值 */
    default?: any;
    /** 是否计算属性 */
    computed?: boolean;
    /** 其他信息 */
    [key: string]: any;
  }

  /**
   * 默认导出Moddle类
   */
  export default Moddle;
}
