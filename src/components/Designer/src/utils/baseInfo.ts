import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { ModdleElement } from 'moddle';
import { add as collectionAdd } from 'diagram-js/lib/util/Collections';
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import { Canvas } from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import {
  getBpmnFactory,
  getBusinessObject,
  getModeling,
  isIdValid,
} from '@/components/Designer/src/utils/tools';
import Modeler from 'bpmn-js/lib/Modeler';
import { without } from 'min-dash';

// 文档格式
const DOCUMENTATION_TEXT_FORMAT = 'text/plain';

//--- ID-----//
/**
 * 获取ID的值
 * @param element
 */
export function getId(element: BpmnElement): string {
  return element.businessObject.id;
}

/**
 * 设置ID的值
 * @param modeler
 * @param element
 * @param value
 */
export function setId(modeler: Modeler, element: BpmnElement, value: string) {
  const errorMsg = isIdValid(element.businessObject, value);
  if (errorMsg && errorMsg.length) {
    throw new Error(errorMsg);
  }
  const modeling = getModeling(modeler);
  modeling.updateProperties(element, {
    id: value,
  });
}

//--- Name -----//
/**
 * 获取元素的 Name属性的值
 * @param element
 */
export function getName(element: BpmnElement): string | undefined {
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
  element: BpmnElement,
  value: string
) {
  if (isAny(element, ['bpmn:Collaboration', 'bpmn:DataAssociation', 'bpmn:Association'])) {
    return undefined;
  }
  const modeling = getModeling(modeler);
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
export function getProcessExecutable(element: BpmnElement) {
  return !!element.businessObject.isExecutable;
}

/**
 * 设置流程是否可执行
 * @param modeler
 * @param element
 * @param value
 */
export function setProcessExecutable(modeler: Modeler, element: BpmnElement, value: boolean) {
  const modeling = getModeling(modeler);
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
export function getProcessVersionTag(element: BpmnElement, prefix = 'camunda'): string | undefined {
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
  element: BpmnElement,
  value: string,
  prefix = 'camunda'
) {
  const modeling = getModeling(modeler);
  modeling.updateProperties(element, {
    [`${prefix}:versionTag`]: value,
  });
}

//--- document 元素文档 -----//

/**
 * 获取文档的值
 * @param element
 */
export function getDocument(element: BpmnElement): string {
  const businessObject = element?.businessObject;
  const documentation = businessObject && findDocumentation(businessObject.get('documentation'));
  return documentation && documentation.text;
}

/**
 * 设置文档的值
 * @param modeler
 * @param element
 * @param value
 */
export function setDocument(modeler: Modeler, element: BpmnElement, value: string | undefined) {
  const modeling = getModeling(modeler);
  const bpmnFactory = getBpmnFactory(modeler);

  const businessObject = element.businessObject;
  const documentation = findDocumentation(businessObject && businessObject.get('documentation'));
  // (1) 更新或者移除 原有 documentation
  if (documentation) {
    if (value) {
      return modeling.updateModdleProperties(element, documentation, { text: value });
    } else {
      return modeling.updateModdleProperties(element, businessObject, {
        documentation: without(businessObject.get('documentation'), documentation),
      });
    }
  }
  // (2) 创建新的 documentation
  if (value) {
    const newDocumentation = bpmnFactory?.create('bpmn:Documentation', {
      text: value,
    });
    return modeling?.updateModdleProperties(element, businessObject, {
      documentation: [...businessObject.get('documentation'), newDocumentation],
    });
  }
}

/**
 * 寻找文档
 * @param docs
 */
function findDocumentation(docs: any[]) {
  return docs.find((d) => {
    return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT;
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
  rootElement: BpmnElement,
  bpmnFactory: BpmnFactory
) {
  const definitions = getBusinessObject(rootElement).$parent;
  businessObject.categoryValueRef = createCategory(definitions, bpmnFactory as BpmnFactory);
}
