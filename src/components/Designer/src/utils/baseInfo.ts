import { Base } from 'diagram-js/lib/model';
import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { ModdleElement } from 'moddle';
import { add as collectionAdd } from 'diagram-js/lib/util/Collections';
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import { Canvas } from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { isIdValid } from '@/components/Designer/src/utils/tools';
import { Process } from 'bpmn-moddle';
import Modeler from 'bpmn-js/lib/Modeler';
import { MODELER_MODELING } from '@/components/Designer/src/config/bpmnEnums';

//--- ID-----//
/**
 * 获取ID的值
 * @param element
 */
export function getId(element: Base): string {
  return element.businessObject.id;
}

/**
 * 设置ID的值
 * @param modeler
 * @param element
 * @param value
 */
export function setId(modeler: Modeler, element: Base, value: string) {
  const errorMsg = isIdValid(element.businessObject, value);
  if (errorMsg && errorMsg.length) {
    throw new Error(errorMsg);
  }
  const modeling = modeler.get<Modeling>(MODELER_MODELING);
  modeling.updateProperties(element, {
    id: value,
  });
}

//--- Name -----//
/**
 * 获取元素的 Name属性的值
 * @param element
 */
export function getName(element: Base): string | undefined {
  if (isAny(element, ['bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association'])) {
    return undefined;
  }
  if (is(element, 'bpmn:TextAnnotation')) {
    return element.businessObject.text;
  }
  if (is(element, 'bpmn:Group')) {
    const businessObject: ModdleElement = getBusinessObject(element),
      categoryValueRef = businessObject?.categoryValueRef;
    return categoryValueRef?.value;
  }
  return element?.businessObject.name;
}

/**
 * 设置元素Name属性的值
 * @param modeler
 * @param canvas
 * @param bpmnFactory
 * @param element
 * @param value
 */
export function setName(
  modeler: Modeler,
  canvas: Canvas,
  bpmnFactory: BpmnFactory,
  element: Base,
  value: string
): void {
  if (isAny(element, ['bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association'])) {
    return undefined;
  }
  const modeling = modeler.get<Modeling>(MODELER_MODELING);
  if (is(element, 'bpmn:TextAnnotation')) {
    return modeling.updateModdleProperties(element, element.businessObject, { text: value });
  }
  if (is(element, 'bpmn:Group')) {
    const businessObject = getBusinessObject(element),
      categoryValueRef = businessObject.categoryValueRef;
    if (!categoryValueRef) {
      initializeCategory(businessObject, canvas.getRootElement(), bpmnFactory);
    }
    return modeling.updateLabel(element, value);
  }
  modeling.updateModdleProperties(element, element.businessObject, { name: value });
}

//--- Executable -----//

/**
 * 获取流程是否可执行属性值
 * @param element
 */
export function getProcessExecutable(element: Base) {
  return !!element.businessObject.isExecutable;
}

/**
 * 设置流程是否可执行
 * @param modeler
 * @param element
 * @param value
 */
export function setProcessExecutable(modeler: Modeler, element: Base, value: boolean) {
  const modeling = modeler.get<Modeling>(MODELER_MODELING);
  modeling.updateProperties(element, {
    isExecutable: value,
  });
}

//--- VersionTag -----//
/**
 * 获取流程流程版本
 * @param element
 * @param prefix
 */
export function getProcessVersionTag(element: Base, prefix = 'camunda'): string | undefined {
  return element.businessObject.get(`${prefix}:versionTag`);
}

/**
 * 设置流程流程版本
 * @param modeler
 * @param element
 * @param value
 * @param prefix
 */
export function setProcessVersionTag(
  modeler: Modeler,
  element: Base,
  value: string,
  prefix = 'camunda'
) {
  const modeling = modeler.get<Modeling>(MODELER_MODELING);
  modeling.updateProperties(element, {
    [`${prefix}:versionTag`]: value,
  });
}

/**
 * 创建分类标签并设置分类的值
 * @param definitions
 * @param bpmnFactory
 */
function createCategory(definitions: ModdleElement, bpmnFactory: BpmnFactory): ModdleElement {
  const categoryValue = bpmnFactory.create('bpmn:CategoryValue');
  const category = bpmnFactory.create('bpmn:Category', {
    categoryValue: [categoryValue],
  });
  collectionAdd(definitions.get('rootElements'), category);
  getBusinessObject(category).$parent = definitions;
  getBusinessObject(categoryValue).$parent = category;
  return category;
}

/**
 * 初始化流程分类
 * @param businessObject
 * @param rootElement
 * @param bpmnFactory
 */
function initializeCategory(
  businessObject: ModdleElement,
  rootElement: Process,
  bpmnFactory: BpmnFactory
) {
  const definitions = getBusinessObject(rootElement).$parent;
  businessObject.categoryValueRef = createCategory(definitions, bpmnFactory as BpmnFactory);
}
