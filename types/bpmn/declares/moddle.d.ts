declare module 'moddle' {
  /**
   * moddle 配置
   */
  export interface ModdleConfig {
    /**
     * 严格模式：访问未知属性时抛错（true）或仅告警（false）
     */
    strict?: boolean;
  }

  /**
   * 包内名称（含命名空间）
   */
  export interface NameNS {
    /** 完整名：prefix:localName 或仅 localName */
    name: string;
    /** 可选前缀 */
    prefix?: string;
    /** 本地名 */
    localName: string;
    /** 命名空间 URI（在 createAny 的描述符上会存在） */
    uri?: string;
  }

  /**
   * 属性定义（输入 schema）
   */
  export interface ModdleProperty {
    name: string;
    type: string;
    isAttr?: boolean;
    isBody?: boolean;
    isId?: boolean;
    isMany?: boolean;
    isReference?: boolean;
    /** 重定义目标："Type#property" */
    redefines?: string;
    /** 替换目标："Type#property" */
    replaces?: string;
    /** 默认值 */
    default?: unknown;
    /** 额外元信息（例如 XML 对齐数据） */
    xml?: Record<string, unknown>;
    /** 其他元信息 */
    meta?: Record<string, unknown>;
  }

  /**
   * 类型定义（输入 schema）
   */
  export interface ModdleType {
    name: string;
    /** 直接父类（单继承或多继承均以数组表示） */
    superClass?: string[];
    /** 作为 trait 引入的扩展（被并入属性集） */
    extends?: string[];
    properties?: ModdleProperty[];
    /** 元信息 */
    meta?: Record<string, unknown>;
  }

  /**
   * 包（输入 schema）
   */
  export interface ModdlePackage {
    name: string;
    uri: string;
    prefix: string;
    types: ModdleType[];
    /** 可选额外字段（与生态中的自定义扩展兼容） */
    [key: string]: unknown;
  }

  /**
   * 运行时属性描述符（构建后）
   */
  export interface PropertyDescriptor {
    /** 规范化后的完整名（含前缀） */
    name: string;
    /** 标准类型名（内建或规范化后的自定义类型） */
    type: string;
    isAttr?: boolean;
    isBody?: boolean;
    isId?: boolean;
    isMany?: boolean;
    isReference?: boolean;
    /** 该属性是否来自父类（继承） */
    inherited?: boolean;
    /** 命名信息 */
    ns: NameNS;
    /** 定义此属性的类型描述符（内部引用） */
    definedBy?: TypeDescriptor;
    /** 重定义/替换信息（若存在） */
    redefines?: string;
    replaces?: string;
    /** 默认值 */
    default?: unknown;
    /** 元信息 */
    meta?: Record<string, unknown>;
  }

  /**
   * 运行时类型描述符（构建后）
   */
  export interface TypeDescriptor {
    /** 命名信息 */
    ns: NameNS;
    /** 规范化后的完整名（含前缀） */
    name: string;
    /** 父类列表（已标准化） */
    superClass?: string[];
    /** trait 列表（由其他类型的 extends 反向收集） */
    traits?: string[];
    /** 当前类型直接/聚合后的属性 */
    properties?: PropertyDescriptor[];
    /** 通过属性名索引的属性表 */
    propertiesByName?: Record<string, PropertyDescriptor>;
    /** 元信息 */
    meta?: Record<string, unknown>;
    /** 该类型所属包（内部挂载） */
    $pkg?: ModdlePackage;
    /** 标识是否为通用 any 元素（仅 createAny） */
    isGeneric?: boolean;
  }

  /**
   * 聚合后的元素描述符（一个具体元素的完整属性/类型视图）
   */
  export interface Descriptor {
    ns: NameNS;
    name: string;
    allTypes: TypeDescriptor[];
    allTypesByName: Record<string, TypeDescriptor>;
    properties: PropertyDescriptor[];
    propertiesByName: Record<string, PropertyDescriptor>;
    bodyProperty?: PropertyDescriptor;
    idProperty?: PropertyDescriptor;
    /** 挂载该描述符的包 */
    $pkg?: ModdlePackage;
  }

  /**
   * 基础元素接口（所有由 Moddle 创建的元素都符合）
   */
  export interface ModdleElement {
    /** 完整类型名，例如 "bpmn:Process" */
    $type: string;
    /** 未在属性描述符中出现的扩展属性容器 */
    $attrs: Record<string, unknown>;
    /** 父元素（若存在） */
    $parent?: ModdleElement;
    /** 所属模型实例 */
    $model: Moddle;
    /** 元素描述符（聚合后的） */
    $descriptor: Descriptor;

    /** 读取属性（优先命名属性，其次 $attrs） */
    get(name: string): unknown;
    /** 设置属性（命名属性或 $attrs） */
    set(name: string, value: unknown): void;

    /** 判断当前实例是否为给定类型（绑定到实例原型） */
    $instanceOf?(typeName: string): boolean;
  }

  /** any 元素接口（通过 createAny 创建） */
  export interface AnyElement extends ModdleElement {
    $attrs?: Record<string, unknown>;
  }

  /** 运行时构造器类型 */
  export type ModdleElementConstructor<T extends ModdleElement = ModdleElement> = new (
    attrs?: Record<string, unknown>
  ) => T;

  /**
   * Moddle 主类
   */
  export class Moddle {
    constructor(packages: ModdlePackage[], config?: ModdleConfig);

    /** 创建给定类型的元素实例 */
    create<T extends ModdleElement = ModdleElement>(
      descriptor: string | TypeDescriptor,
      attrs?: Record<string, unknown>
    ): T;

    /** 获取给定描述符对应的运行时构造器 */
    getType<T extends ModdleElement = ModdleElement>(
      descriptor: string | TypeDescriptor
    ): ModdleElementConstructor<T>;

    /** 创建任意（超出模型的）元素 */
    createAny(
      name: string,
      nsUri: string,
      properties?: Record<string, unknown>
    ): AnyElement;

    /** 通过 URI 或前缀获取已注册包 */
    getPackage(uriOrPrefix: string): ModdlePackage | undefined;

    /** 获取所有已注册包的快照 */
    getPackages(): ModdlePackage[];

    /** 获取元素的聚合描述符 */
    getElementDescriptor(element: ModdleElement): Descriptor;

    /**
     * 判断元素/描述符是否表示给定类型。
     * 通常以实例方法绑定在元素原型上（作为 $instanceOf）。
     */
    hasType(element: ModdleElement, type: string): boolean;

    /** 获取元素上命名属性的属性描述符 */
    getPropertyDescriptor(
      element: ModdleElement,
      property: string
    ): PropertyDescriptor | undefined;

    /** 获取类型名对应的类型描述符 */
    getTypeDescriptor(type: string): TypeDescriptor | undefined;
  }

  /** 将字符串值强制转换为内建简单类型 */
  export function coerceType(type: 'String', value: unknown): string;
  export function coerceType(type: 'Boolean', value: unknown): boolean;
  export function coerceType(type: 'Integer', value: unknown): number;
  export function coerceType(type: 'Real', value: unknown): number;
  export function coerceType(type: string, value: unknown): unknown;

  /** 是否为内建类型（String/Boolean/Integer/Real/Element） */
  export function isBuiltInType(type: string): boolean;

  /** 是否为简单类型（可由字符串直接转换：String/Boolean/Integer/Real） */
  export function isSimpleType(type: string): boolean;

  /** 解析名称为命名空间三元组 */
  export function parseNameNS(name: string, defaultPrefix?: string): {
    name: string;
    prefix?: string;
    localName: string;
  };
}
