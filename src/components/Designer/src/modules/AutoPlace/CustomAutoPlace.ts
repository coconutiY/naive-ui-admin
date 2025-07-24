import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getMid, asTRBL, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance,
} from 'diagram-js/lib/features/auto-place/AutoPlaceUtil';
import EventBus from 'diagram-js/lib/core/EventBus';
import { Shape } from 'diagram-js/lib/model';

class CustomAutoPlace {
  static $inject: string[];
  constructor(config: any, eventBus: EventBus) {
    const { minDistance = 100 } = config || {};
    eventBus.on('autoPlace', 3000, function (context: any) {
      const shape = context.shape,
        source = context.source;

      return getNewShapePosition(source, shape, minDistance);
    });
  }
}
const getVerticalDistance = (orientation: string, minDistance: number) => {
  if (orientation.indexOf('top') != -1) {
    return -1 * minDistance;
  } else if (orientation.indexOf('bottom') != -1) {
    return minDistance;
  } else {
    return 0;
  }
};

const getNewShapePosition = (source: any, element: Shape, minDistance: number) => {
  if (is(element, 'bpmn:FlowNode')) {
    const sourceTrbl = asTRBL(source);
    const sourceMid = getMid(source);
    const horizontalDistance = getConnectedDistance(source, {
      defaultDistance: minDistance,
      filter: (connection: any) => {
        return is(connection, 'bpmn:SequenceFlow');
      },
    });
    let margin = 30,
      orientation = 'left';
    if (is(source, 'bpmn:BoundaryEvent')) {
      orientation = getOrientation(source, source.host, -25);
      if (orientation.indexOf('top') !== -1) {
        margin *= -1;
      }
    }
    const position = {
      x: sourceTrbl.right + horizontalDistance + (element && element.width ? element.width / 2 : 0),
      y: sourceMid.y + getVerticalDistance(orientation, minDistance),
    };
    const nextPositionDirection = {
      y: {
        margin: margin,
        minDistance: minDistance,
      },
    };
    return findFreePosition(
      source,
      element,
      position,
      generateGetNextPosition(nextPositionDirection)
    );
  }
};

CustomAutoPlace.$inject = ['config.autoPlace', 'eventBus'];

export default CustomAutoPlace;
