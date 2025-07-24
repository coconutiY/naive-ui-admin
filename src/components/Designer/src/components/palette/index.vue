<script setup name="Palette" lang="ts">
  import { Canvas } from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
  import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
  import Create from 'diagram-js/lib/features/create/Create';
  import SpaceTool from 'bpmn-js/lib/features/space-tool/BpmnSpaceTool';
  import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
  import HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
  import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect';
  import Modeler from 'bpmn-js/lib/Modeler';
  import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu';
  import { getCurrentInstance, inject, reactive, Ref } from 'vue';
  import { ComponentInternalInstance } from 'vue-demi';
  import { PaletteElement } from '/#/bpmn/designer/settings';
  import { MODELER } from '@/components/Designer/src/config/bpmnEnums';
  import BpmnIcon from '@/components/Designer/src/components/common/BpmnIcon.vue';

  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

  const modelerRef = inject<Ref<Modeler>>(MODELER);

  const palettesList = reactive<PaletteElement[]>([
    {
      group: 'tools',
      type: 'bpmn:HandTool',
      className: 'bpmn-icon-hand-tool',
      title: proxy?.$t('bpmn.palette.activateHandTool'),
      visible: true,
    },
    {
      group: 'tools',
      type: 'bpmn:LassoTool',
      className: 'bpmn-icon-lasso-tool',
      title: proxy?.$t('bpmn.palette.activateLassoTool'),
      visible: true,
    },
    {
      group: 'tools',
      type: 'bpmn:SpaceTool',
      className: 'bpmn-icon-space-tool',
      title: proxy?.$t('bpmn.palette.activateSpaceTool'),
      visible: true,
    },
    {
      group: 'tools',
      type: 'bpmn:GlobalConnectTool',
      className: 'bpmn-icon-connection-multi',
      title: proxy?.$t('bpmn.palette.activateGlobalConnectTool'),
      visible: true,
    },
    {
      group: 'event',
      type: 'bpmn:StartEvent',
      className: 'bpmn-icon-start-event-none',
      title: proxy?.$t('bpmn.palette.createStartEvent'),
      visible: true,
    },
    {
      group: 'event',
      type: 'bpmn:IntermediateThrowEvent',
      className: 'bpmn-icon-intermediate-event-none',
      title: proxy?.$t('bpmn.palette.createIntermediateThrowEvent'),
      visible: true,
    },
    {
      group: 'event',
      type: 'bpmn:EndEvent',
      className: 'bpmn-icon-end-event-none',
      title: proxy?.$t('bpmn.palette.createEndEvent'),
      visible: true,
    },
    {
      group: 'gateway',
      type: 'bpmn:ExclusiveGateway',
      className: 'bpmn-icon-gateway-none',
      title: proxy?.$t('bpmn.palette.createGateway'),
      visible: true,
    },
    {
      group: 'activity',
      type: 'bpmn:Task',
      className: 'bpmn-icon-task',
      title: proxy?.$t('bpmn.palette.createTask'),
      visible: true,
    },
    {
      group: 'data-object',
      type: 'bpmn:DataObjectReference',
      className: 'bpmn-icon-data-object',
      title: proxy?.$t('bpmn.palette.createDataObjectReference'),
      visible: true,
    },
    {
      group: 'data-store',
      type: 'bpmn:DataStoreReference',
      className: 'bpmn-icon-data-store',
      title: proxy?.$t('bpmn.palette.createDataStoreReference'),
      visible: true,
    },
    {
      group: 'activity',
      type: 'bpmn:SubprocessExpanded',
      className: 'bpmn-icon-subprocess-expanded',
      title: proxy?.$t('bpmn.palette.createSubprocessExpanded'),
      visible: true,
    },
    {
      group: 'collaboration',
      type: 'bpmn:Participant',
      className: 'bpmn-icon-participant',
      title: proxy?.$t('bpmn.palette.createParticipant'),
      visible: true,
    },
    {
      group: 'artifact',
      type: 'bpmn:Group',
      className: 'bpmn-icon-group',
      title: proxy?.$t('bpmn.palette.createGroup'),
      visible: true,
    },
    {
      group: 'create',
      type: 'bpmn:Create',
      className: 'bpmn-icon-more',
      title: proxy?.$t('bpmn.palette.createElement'),
      visible: true,
    },
  ]);

  function bpmnCreate(event: MouseEvent, modeler: Modeler) {
    const popupMenu: PopupMenu = modeler.get('popupMenu');
    const canvas: Canvas = modeler.get('canvas');
    const element = canvas.getRootElement();
    const position = { x: event.x + 20, y: event.y + 20 };
    popupMenu.open(element, 'bpmn-create', position, {
      title: proxy?.$t('bpmn.palette.createElement'),
      width: 300,
      search: true,
    });
  }

  function bpmnDefault(
    create: Create,
    event: MouseEvent,
    ElementFactory: ElementFactory,
    type: string,
    options: any = {}
  ) {
    const shape = (ElementFactory as Canvas).createShape({ type: type, ...options });
    if (Object.keys(options).length > 0) {
      shape.businessObject.di.isExpanded = options.isExpanded;
    }
    create.start(event, shape);
  }

  /**
   * 创建子流程
   * @param create
   * @param ElementFactory
   * @param event
   */
  function bpmnSubprocessExpanded(
    create: Create,
    ElementFactory: ElementFactory,
    event: MouseEvent
  ) {
    const subProcess = (ElementFactory as Canvas).createShape({
      type: 'bpmn:SubProcess',
      x: 0,
      y: 0,
      isExpanded: true,
    });

    const startEvent = (ElementFactory as Canvas).createShape({
      type: 'bpmn:StartEvent',
      x: 40,
      y: 82,
      parent: subProcess,
    });
    create.start(event, [subProcess, startEvent], {
      hints: {
        autoSelect: [subProcess],
      },
    });
  }

  /**
   * 创建画布元素
   * @param event
   * @param type
   * @param options
   */
  function createElement(event: MouseEvent, type: string, options: any = {}) {
    const modeler = modelerRef?.value;
    if (!modeler) {
      return;
    }
    const ElementFactory: ElementFactory = modeler.get('elementFactory');
    const create: Create = modeler.get('create');
    const HandTool: HandTool = modeler.get('handTool');
    const SpaceTool: SpaceTool = modeler.get('spaceTool');
    const LassoTool: LassoTool = modeler.get('lassoTool');
    const GlobalConnect: GlobalConnect = modeler.get('globalConnect');
    switch (type) {
      case 'bpmn:HandTool':
        HandTool.activateHand(event, false);
        break;
      case 'bpmn:LassoTool':
        LassoTool.activateSelection(event, false);
        break;
      case 'bpmn:SpaceTool':
        SpaceTool.activateSelection(event, false);
        break;
      case 'bpmn:GlobalConnectTool':
        GlobalConnect.start(event);
        break;
      case 'bpmn:SubprocessExpanded':
        bpmnSubprocessExpanded(create, ElementFactory, event);
        break;
      case 'bpmn:Participant':
        create.start(event, ElementFactory.createParticipantShape());
        break;
      case 'bpmn:Create':
        bpmnCreate(event, modeler);
        break;
      default:
        bpmnDefault(create, event, ElementFactory, type, options);
        break;
    }
  }

  function elementClick(e: MouseEvent, type: string) {
    createElement(e, type);
  }

  function elementMouseDown(e: MouseEvent, type: string) {
    e.stopPropagation();
    createElement(e, type);
  }
</script>

<template>
  <div class="designer_palette">
    <n-scrollbar class="palette_main">
      <div
        class="item-palette"
        v-for="(item, idx) in palettesList"
        :key="idx"
        @click="(e) => elementClick(e, item.type)"
        @mousedown="(e) => elementMouseDown(e, item.type)"
      >
        <n-tooltip v-if="item.visible" placement="right-start" effect="light" :content="item.title">
          <BpmnIcon :name="item.className" />
        </n-tooltip>
      </div>
    </n-scrollbar>
  </div>
</template>

<style scoped lang="scss"></style>
