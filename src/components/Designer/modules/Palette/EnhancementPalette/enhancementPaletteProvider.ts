import { assign } from 'min-dash';
import PaletteProvider, { Translate } from 'bpmn-js/lib/features/palette/PaletteProvider';
import Create from 'diagram-js/lib/features/create/Create';
import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
import HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect';
import Palette from 'diagram-js/lib/features/palette/Palette';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import SpaceTool from 'bpmn-js/lib/features/space-tool/BpmnSpaceTool';

class EnhancementPaletteProvider extends PaletteProvider {
  // private readonly _palette: Palette;
  private readonly _create: Create;
  private readonly _elementFactory: ElementFactory;
  // private readonly _spaceTool: SpaceTool;
  // private readonly _lassoTool: LassoTool;
  // private readonly _handTool: HandTool;
  // private readonly _globalConnect: GlobalConnect;
  private readonly _translate: Translate;
  constructor(
    palette: Palette,
    create: Create,
    elementFactory: ElementFactory,
    spaceTool: SpaceTool,
    lassoTool: LassoTool,
    handTool: HandTool,
    globalConnect: GlobalConnect,
    translate: Translate
  ) {
    super(
      palette,
      create,
      elementFactory,
      spaceTool,
      lassoTool,
      handTool,
      globalConnect,
      translate
    );
    // this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
    // this._spaceTool = spaceTool;
    // this._lassoTool = lassoTool;
    // this._handTool = handTool;
    // this._globalConnect = globalConnect;
    this._translate = translate;
  }
  getPaletteEntries() {
    const actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      translate = this._translate;

    function createAction(
      type: string,
      group: string,
      className: string,
      title: string,
      options?: object
    ) {
      function createListener(event: any) {
        const shape = elementFactory.createShape(assign({ type: type }, options));
        if (options) {
          !shape.businessObject.di && (shape.businessObject.di = {});
          shape.businessObject.di.isExpanded = (options as { [key: string]: any }).isExpanded;
        }
        create.start(event, shape, {});
      }

      const shortType = type.replace(/^bpmn:/, '');

      return {
        group: group,
        className: className,
        title: title || translate('Create {type}', { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener,
        },
      };
    }
    assign(actions, {
      'create.exclusive-gateway': createAction(
        'bpmn:ExclusiveGateway',
        'gateway',
        'bpmn-icon-gateway-none',
        '网关'
      ),
      'create.parallel-gateway': createAction(
        'bpmn:ParallelGateway',
        'gateway',
        'bpmn-icon-gateway-parallel',
        '并行网关'
      ),
      'create.event-base-gateway': createAction(
        'bpmn:EventBasedGateway',
        'gateway',
        'bpmn-icon-gateway-eventbased',
        '事件网关'
      ),
      'gateway-separator': {
        group: 'gateway',
        separator: true,
      },
      'create.user-task': createAction(
        'bpmn:UserTask',
        'activity',
        'bpmn-icon-user-task',
        translate('Create User Task')
      ),
      'task-separator': {
        group: 'activity',
        separator: true,
      },
    });

    return actions;
  }
}

EnhancementPaletteProvider['$inject'] = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate',
];

export default EnhancementPaletteProvider;
