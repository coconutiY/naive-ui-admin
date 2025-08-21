declare module 'bpmn-moddle' {
  import { Moddle } from 'moddle';

  /**
   * BPMN-Moddle类 - 扩展自Moddle，专门用于BPMN 2.0模型
   */
  export class BpmnModdle extends Moddle {
    /**
     * 创建BPMN-Moddle实例
     * @param packages BPMN包配置
     * @param options 选项配置
     */
    constructor(packages?: BpmnPackages, options?: BpmnModdleOptions);

    /**
     * 创建BPMN元素
     * @param type BPMN元素类型
     * @param attrs 元素属性
     * @param options 创建选项
     */
    create(type: BpmnElementType, attrs?: any, options?: BpmnCreateOptions): BpmnElement;

    /**
     * 从XML创建BPMN模型
     * @param xml XML字符串
     * @param options 选项
     */
    fromXML(xml: string, options?: FromXMLOptions): Promise<BpmnParseResult>;

    /**
     * 将BPMN模型转换为XML
     * @param definitions BPMN定义对象
     * @param options 选项
     */
    toXML(definitions: BpmnDefinitions, options?: ToXMLOptions): Promise<string>;

    /**
     * 获取BPMN类型描述符
     * @param type BPMN类型名称
     */
    getBpmnTypeDescriptor(type: string): BpmnTypeDescriptor;

    /**
     * 获取所有BPMN类型
     */
    getBpmnTypes(): BpmnTypeDescriptor[];
  }

  /**
   * BPMN包配置接口
   */
  export interface BpmnPackages {
    /** BPMN核心包 */
    bpmn?: BpmnPackage;
    /** BPMN扩展包 */
    bpmndi?: BpmnDiPackage;
    /** DC包（图形元素） */
    dc?: DcPackage;
    /** DI包（图表交换） */
    di?: DiPackage;
    /** 自定义包 */
    [key: string]: any;
  }

  /**
   * BPMN包接口
   */
  export interface BpmnPackage {
    /** 包名 */
    name: string;
    /** 包URI */
    uri: string;
    /** 包前缀 */
    prefix: string;
    /** 类型定义 */
    types: BpmnTypeDescriptor[];
    /** 属性定义 */
    properties: BpmnPropertyDescriptor[];
  }

  /**
   * BPMN类型描述符接口
   */
  export interface BpmnTypeDescriptor {
    /** 类型名 */
    name: string;
    /** 类型描述 */
    description?: string;
    /** 父类型 */
    extends?: string;
    /** 属性定义 */
    properties: BpmnPropertyDescriptor[];
    /** 是否抽象 */
    abstract?: boolean;
    /** 是否根类型 */
    root?: boolean;
  }

  /**
   * BPMN属性描述符接口
   */
  export interface BpmnPropertyDescriptor {
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
    /** 是否引用 */
    isReference?: boolean;
    /** 是否ID */
    isId?: boolean;
  }

  /**
   * BPMN元素类型联合类型
   */
  export type BpmnElementType = 
    | 'bpmn:Definitions'
    | 'bpmn:Process'
    | 'bpmn:Task'
    | 'bpmn:UserTask'
    | 'bpmn:ServiceTask'
    | 'bpmn:ScriptTask'
    | 'bpmn:StartEvent'
    | 'bpmn:EndEvent'
    | 'bpmn:IntermediateThrowEvent'
    | 'bpmn:IntermediateCatchEvent'
    | 'bpmn:BoundaryEvent'
    | 'bpmn:ExclusiveGateway'
    | 'bpmn:ParallelGateway'
    | 'bpmn:InclusiveGateway'
    | 'bpmn:EventBasedGateway'
    | 'bpmn:SequenceFlow'
    | 'bpmn:DataObject'
    | 'bpmn:DataStore'
    | 'bpmn:DataInput'
    | 'bpmn:DataOutput'
    | 'bpmn:Participant'
    | 'bpmn:Lane'
    | 'bpmn:SubProcess'
    | 'bpmn:CallActivity'
    | 'bpmn:Transaction'
    | 'bpmn:AdHocSubProcess'
    | 'bpmn:EventSubProcess'
    | 'bpmn:TextAnnotation'
    | 'bpmn:Association'
    | 'bpmn:Group'
    | 'bpmn:Category'
    | 'bpmn:Collaboration'
    | 'bpmn:Choreography'
    | 'bpmn:ChoreographyTask'
    | 'bpmn:ChoreographySubProcess'
    | 'bpmn:GlobalTask'
    | string;

  /**
   * BPMN元素基础接口
   */
  export interface BpmnElement {
    /** 元素ID */
    id?: string;
    /** 元素类型 */
    $type: string;
    /** 父元素 */
    $parent?: BpmnElement;
    /** 子元素 */
    $children?: BpmnElement[];
    /** 元素属性 */
    [key: string]: any;
  }

  /**
   * BPMN定义接口
   */
  export interface BpmnDefinitions extends BpmnElement {
    /** 目标命名空间 */
    targetNamespace: string;
    /** 根元素 */
    rootElements: BpmnElement[];
    /** 图表信息 */
    diagrams?: BpmnDiagram[];
    /** 导入 */
    imports?: BpmnImport[];
    /** 扩展 */
    extensions?: BpmnExtension[];
  }

  /**
   * BPMN流程接口
   */
  export interface BpmnProcess extends BpmnElement {
    /** 流程名称 */
    name?: string;
    /** 是否可执行 */
    isExecutable?: boolean;
    /** 流程元素 */
    flowElements?: BpmnElement[];
    /** 参与者 */
    participants?: BpmnParticipant[];
    /** 泳道 */
    lanes?: BpmnLane[];
  }

  /**
   * BPMN活动接口
   */
  export interface BpmnActivity extends BpmnElement {
    /** 活动名称 */
    name?: string;
    /** 输入流 */
    incoming?: BpmnSequenceFlow[];
    /** 输出流 */
    outgoing?: BpmnSequenceFlow[];
    /** 边界事件 */
    boundaryEventRefs?: BpmnBoundaryEvent[];
  }

  /**
   * BPMN事件接口
   */
  export interface BpmnEvent extends BpmnElement {
    /** 事件名称 */
    name?: string;
    /** 输入流 */
    incoming?: BpmnSequenceFlow[];
    /** 输出流 */
    outgoing?: BpmnSequenceFlow[];
    /** 事件定义 */
    eventDefinitions?: BpmnEventDefinition[];
  }

  /**
   * BPMN网关接口
   */
  export interface BpmnGateway extends BpmnElement {
    /** 网关名称 */
    name?: string;
    /** 输入流 */
    incoming?: BpmnSequenceFlow[];
    /** 输出流 */
    outgoing?: BpmnSequenceFlow[];
    /** 网关方向 */
    gatewayDirection?: 'Unspecified' | 'Converging' | 'Diverging' | 'Mixed';
  }

  /**
   * BPMN序列流接口
   */
  export interface BpmnSequenceFlow extends BpmnElement {
    /** 序列流名称 */
    name?: string;
    /** 源元素 */
    sourceRef: BpmnElement;
    /** 目标元素 */
    targetRef: BpmnElement;
    /** 条件表达式 */
    conditionExpression?: BpmnExpression;
  }

  /**
   * BPMN表达式接口
   */
  export interface BpmnExpression extends BpmnElement {
    /** 表达式内容 */
    body?: string;
    /** 表达式语言 */
    language?: string;
  }

  /**
   * BPMN事件定义接口
   */
  export interface BpmnEventDefinition extends BpmnElement {
    /** 事件定义类型 */
    $type: string;
  }

  /**
   * BPMN参与者接口
   */
  export interface BpmnParticipant extends BpmnElement {
    /** 参与者名称 */
    name?: string;
    /** 关联流程 */
    processRef?: BpmnProcess;
  }

  /**
   * BPMN泳道接口
   */
  export interface BpmnLane extends BpmnElement {
    /** 泳道名称 */
    name?: string;
    /** 流程元素引用 */
    flowNodeRefs?: BpmnElement[];
  }

  /**
   * BPMN边界事件接口
   */
  export interface BpmnBoundaryEvent extends BpmnEvent {
    /** 附加到的活动 */
    attachedToRef: BpmnActivity;
    /** 是否取消活动 */
    cancelActivity?: boolean;
  }

  /**
   * BPMN图表接口
   */
  export interface BpmnDiagram extends BpmnElement {
    /** 图表名称 */
    name?: string;
    /** 图表元素 */
    plane?: BpmnPlane;
  }

  /**
   * BPMN平面接口
   */
  export interface BpmnPlane extends BpmnElement {
    /** 业务元素引用 */
    bpmnElement?: BpmnElement;
    /** 图形元素 */
    planeElement?: BpmnDiElement[];
  }

  /**
   * BPMN图形元素接口
   */
  export interface BpmnDiElement extends BpmnElement {
    /** 业务元素引用 */
    bpmnElement?: BpmnElement;
  }

  /**
   * BPMN导入接口
   */
  export interface BpmnImport extends BpmnElement {
    /** 导入类型 */
    importType: string;
    /** 位置 */
    location: string;
    /** 命名空间 */
    namespace: string;
  }

  /**
   * BPMN扩展接口
   */
  export interface BpmnExtension extends BpmnElement {
    /** 扩展定义 */
    definition?: string;
    /** 扩展元素 */
    values?: BpmnElement[];
  }

  // 其他接口类型别名
  export type BpmnDiPackage = any;
  export type DcPackage = any;
  export type DiPackage = any;
  export type BpmnModdleOptions = any;
  export type BpmnCreateOptions = any;
  export type FromXMLOptions = any;
  export type ToXMLOptions = any;
  export type BpmnParseResult = any;
  export type BpmnValidationResult = any;

  /**
   * 默认导出BpmnModdle类
   */
  export default BpmnModdle;
}
