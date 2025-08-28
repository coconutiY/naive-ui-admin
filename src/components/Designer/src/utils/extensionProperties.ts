import { ModdleElement } from 'moddle';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import Modeler from 'bpmn-js/lib/Modeler';
import {
  createElement,
  getBusinessObject,
  getModeling,
  getProcessPrefix,
} from '@/components/Designer/src/utils/tools';
import { BpmnExtensionProperty } from '/#/bpmn/bpmn-moddle/bpmn-instance';
import { isArray, without } from 'min-dash';

/**
 * 获取扩展属性
 * @param modeler
 * @param element
 */
export function getExtensionProperties(modeler: Modeler, element: BpmnElement): ModdleElement[] {
  const businessObject = getRelevantBusinessObject(element);
  if (!businessObject) {
    return [];
  } else {
    return getPropertiesList(modeler, businessObject) || [];
  }
}

/**
 * 添加扩展属性
 * @param modeler 画布对象
 * @param element 需要添加扩展属性的元素
 * @param property 扩展属性的值
 */
export function addExtensionProperty(
  modeler: Modeler,
  element: BpmnElement,
  property: BpmnExtensionProperty
) {
  try {
    const modeling = getModeling(modeler);
    const prefix = getProcessPrefix(modeler);
    const businessObject = getRelevantBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createElement(
        modeler,
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject
      );
      modeling.updateModdleProperties(element, businessObject, { extensionElements });
    }
    let properties = getProperties(modeler, businessObject);
    if (!properties) {
      properties = createElement(
        modeler,
        `${prefix}:Properties`,
        { values: [] },
        extensionElements
      );
      modeling.updateModdleProperties(element, extensionElements, {
        values: [...extensionElements.get('values'), properties],
      });
    }
    const newProperty = createElement(modeler, `${prefix}:Property`, property, properties);
    modeling.updateModdleProperties(element, properties, {
      values: [...properties.get('values'), newProperty],
    });
  } catch (e) {
    throw e;
  }
}

/**
 * 编辑扩展属性. 若 bpmn:ExtensionElements不存在则创建一个.
 * @param modeler
 * @param element
 * @param property
 * @param index
 */
export function editExtensionProperty(
  modeler: Modeler,
  element: BpmnElement,
  property: BpmnExtensionProperty,
  index: number
) {
  const businessObject = getRelevantBusinessObject(element);
  const properties = getProperties(modeler, businessObject);
  if (!properties) {
    return;
  }
  const modeling = getModeling(modeler);
  const values = properties.get('values');
  modeling.updateModdleProperties(element, values[index], property);
}

/**
 * 移除扩展属性
 * @param modeler
 * @param element
 * @param property
 */
export function removeExtensionProperty(
  modeler: Modeler,
  element: BpmnElement,
  property: ModdleElement
) {
  const businessObject = getRelevantBusinessObject(element);
  const extensionElements = businessObject.get('extensionElements');
  const properties = getProperties(modeler, businessObject);
  if (!properties) {
    return;
  }
  const modeling = getModeling(modeler);
  const values = without(properties.get('values'), property);
  modeling.updateModdleProperties(element, properties, { values });
  if (!values || !values.length) {
    modeling.updateModdleProperties(element, extensionElements, {
      values: without(extensionElements.get('values'), properties),
    });
  }
}

/**
 * 获取相关businessObject
 * @param element
 */
function getRelevantBusinessObject(element: BpmnElement) {
  const businessObject = getBusinessObject(element);
  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  } else {
    return businessObject;
  }
}

/**
 * 获取扩展属性列表
 * @param modeler
 * @param bo
 */
function getPropertiesList(modeler: Modeler, bo: ModdleElement): [] {
  const properties = getProperties(modeler, bo);
  return properties && properties.get('values');
}

//--- 扩展元素 extensionElement -----//
/**
 * 获取扩展元素集合 Get extension elements of business object. Optionally filter by type.
 * @param businessObject 业务对象
 * @param type
 */
export function getExtensionElements(
  businessObject: ModdleElement,
  type?: string
): ModdleElement[] {
  const extensionElements = businessObject.get('extensionElements');
  if (!extensionElements) {
    return [];
  }
  const values = extensionElements.get('values');
  if (!values || !values.length) {
    return [];
  }
  if (type) {
    return values.filter((value: ModdleElement) => is(value, type));
  }
  return values;
}

/**
 * 添加扩展元素 Add one or more extension elements. Create bpmn:ExtensionElements if it doesn't exist.
 * @param modeler
 * @param element
 * @param businessObject
 * @param extensionElementToAdd 扩展元素
 */
export function addExtensionElements(
  modeler: Modeler,
  element: BpmnElement,
  businessObject: ModdleElement,
  extensionElementToAdd: ModdleElement
) {
  const modeling = getModeling(modeler);
  let extensionElements = businessObject.get('extensionElements');

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createElement(
      modeler,
      'bpmn:ExtensionElements',
      { values: [] },
      businessObject
    );
    modeling?.updateModdleProperties(element, businessObject, { extensionElements });
  }
  extensionElementToAdd.$parent = extensionElements;

  // (2) add extension element to list
  modeling?.updateModdleProperties(element, extensionElements, {
    values: [...extensionElements.get('values'), extensionElementToAdd],
  });
}

/**
 * 移除扩展元素 Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 * @param modeler
 * @param element
 * @param businessObject
 * @param extensionElementsToRemove
 */
export function removeExtensionElements(
  modeler: Modeler,
  element: BpmnElement,
  businessObject: ModdleElement,
  extensionElementsToRemove: ModdleElement | ModdleElement[]
) {
  if (!isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [extensionElementsToRemove];
  }

  const extensionElements = businessObject.get('extensionElements'),
    values = extensionElements
      .get('values')
      .filter((value: any) => !extensionElementsToRemove.includes(value));

  const modeling = getModeling(modeler);
  modeling.updateModdleProperties(element, extensionElements, { values });
}

/**
 * 获取扩展属性
 * @param modeler
 * @param bo business
 */
function getProperties(modeler: Modeler, bo: ModdleElement): ModdleElement {
  const prefix = getProcessPrefix(modeler);
  return getExtensionElements(bo, `${prefix}:Properties`)[0];
}
