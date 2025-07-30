import { Base } from 'diagram-js/lib/model';
import { ModdleElement } from 'moddle';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import Modeler from 'bpmn-js/lib/Modeler';
import { getProcessPrefix } from '@/components/Designer/src/utils/implType';
import { getModeling } from '@/components/Designer/src/utils/tools';
import { BpmnExtensionProperty } from '/#/bpmn/bpmn-moddle/bpmn-instance';
import {
  createModdleElement,
  getExtensionElementsList,
} from '@/components/Designer/src/utils/baseInfo';
import { without } from 'min-dash';

/**
 * 获取扩展属性
 * @param modeler
 * @param element
 */
export function getExtensionProperties(modeler: Modeler, element: Base): ModdleElement[] {
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
  element: Base,
  property: BpmnExtensionProperty
) {
  try {
    const modeling = getModeling(modeler);
    const prefix = getProcessPrefix(modeler);
    const businessObject = getRelevantBusinessObject(element);
    let extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createModdleElement(
        modeler,
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject
      );
      modeling.updateModdleProperties(element, businessObject, { extensionElements });
    }
    let properties = getProperties(modeler, businessObject);
    if (!properties) {
      properties = createModdleElement(
        modeler,
        `${prefix}:Properties`,
        { values: [] },
        extensionElements
      );
      modeling.updateModdleProperties(element, extensionElements, {
        values: [...extensionElements.get('values'), properties],
      });
    }
    const newProperty = createModdleElement(modeler, `${prefix}:Property`, property, properties);
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
  element: Base,
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
  element: Base,
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
function getRelevantBusinessObject(element: Base) {
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

/**
 * 获取扩展属性
 * @param modeler
 * @param bo business
 */
function getProperties(modeler: Modeler, bo: ModdleElement): ModdleElement | null {
  const prefix = getProcessPrefix(modeler);
  return getExtensionElementsList(bo, `${prefix}:Properties`)[0];
}
