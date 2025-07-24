import PaletteProvider, { Translate } from 'bpmn-js/lib/features/palette/PaletteProvider';
import ElementFactory from 'diagram-js/lib/core/ElementFactory';
import { assign } from 'min-dash';
import { createAction } from '../utils';
import Create from 'diagram-js/lib/features/create/Create';
import SpaceTool from 'bpmn-js/lib/features/space-tool/BpmnSpaceTool';
import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
import HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect';
import Palette from 'diagram-js/lib/features/palette/Palette';

class RewritePaletteProvider extends PaletteProvider {
  // private readonly _palette: Palette;
  private readonly _create: Create;
  private readonly _elementFactory: ElementFactory;
  // private readonly _spaceTool: SpaceTool;
  private readonly _lassoTool: LassoTool;
  private readonly _handTool: HandTool;
  private readonly _globalConnect: GlobalConnect;
  // private readonly _translate: Translate;
  // private readonly _moddle: any;
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
    this._lassoTool = lassoTool;
    this._handTool = handTool;
    this._globalConnect = globalConnect;
    // this._translate = translate;
  }
  getPaletteEntries() {
    const actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      globalConnect = this._globalConnect;

    function createSqlTask(event: Event) {
      const sqlTask = elementFactory.createShape({ type: 'miyue:SqlTask' });

      create.start(event, sqlTask);
    }

    function createSubprocess(event: Event) {
      const subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        x: 0,
        y: 0,
        isExpanded: true,
      });

      const startEvent = elementFactory.createShape({
        type: 'bpmn:StartEvent',
        x: 40,
        y: 82,
        parent: subProcess,
      });

      create.start(event, [subProcess, startEvent], {
        hints: {
          autoSelect: [startEvent],
        },
      });
    }

    assign(actions, {
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: '手型工具',
        action: {
          click: function (event: Event) {
            handTool.activateHand(event, true);
          },
        },
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: '套索工具',
        action: {
          click: function (event: Event) {
            lassoTool.activateSelection(event);
          },
        },
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: '全局连线',
        action: {
          click: function () {
            globalConnect.toggle();
          },
        },
      },
      'tool-separator': {
        group: 'tools',
        separator: true,
      },
      'create.start-event': createAction(
        elementFactory,
        create,
        'bpmn:StartEvent',
        'events',
        'bpmn-icon-start-event-none',
        '开始事件'
      ),
      'create.end-event': createAction(
        elementFactory,
        create,
        'bpmn:EndEvent',
        'events',
        'bpmn-icon-end-event-none',
        '结束事件'
      ),
      'events-separator': {
        group: 'events',
        separator: true,
      },
      'create.exclusive-gateway': createAction(
        elementFactory,
        create,
        'bpmn:ExclusiveGateway',
        'gateway',
        'bpmn-icon-gateway-none',
        '网关'
      ),
      'create.parallel-gateway': createAction(
        elementFactory,
        create,
        'bpmn:ParallelGateway',
        'gateway',
        'bpmn-icon-gateway-parallel',
        '并行网关'
      ),
      'create.event-base-gateway': createAction(
        elementFactory,
        create,
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
        elementFactory,
        create,
        'bpmn:UserTask',
        'activity',
        'bpmn-icon-user-task',
        '用户任务'
      ),
      'create.script-task': createAction(
        elementFactory,
        create,
        'bpmn:ScriptTask',
        'activity',
        'bpmn-icon-script-task',
        '脚本任务'
      ),
      'create.service-task': createAction(
        elementFactory,
        create,
        'bpmn:ServiceTask',
        'activity',
        'bpmn-icon-service-task',
        '服务任务'
      ),
      'create.sql-task': {
        group: 'activity',
        className: 'miyue-sql-task',
        title: '数据库任务',
        action: {
          click: createSqlTask,
          dragstart: createSqlTask,
        },
      },
      'create.subprocess-expanded': {
        group: 'activity',
        className: 'bpmn-icon-subprocess-expanded',
        title: '子流程',
        action: {
          dragstart: createSubprocess,
          click: createSubprocess,
        },
      },
    });

    return actions;
  }
}

RewritePaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
];

export default RewritePaletteProvider;
