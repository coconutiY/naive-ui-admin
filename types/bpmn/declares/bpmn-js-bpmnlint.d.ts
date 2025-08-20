declare module 'bpmn-js-bpmnlint' {
  import { Injector, ModuleDefinition } from 'didi';
  import Modeler from 'bpmn-js/lib/Modeler';
  import Canvas from 'diagram-js/lib/core/Canvas';
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
  import EventBus from 'diagram-js/lib/core/EventBus';
  import Overlays from 'diagram-js/lib/features/overlays/Overlays';
  import { Translate } from 'diagram-js/lib/i18n/translate';
  import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions';

  type EmptyConfig = {
    resolver: {
      resolveRule: () => unknown;
    };
    config: Record<string, any>;
  };

  type State = 'error' | 'warning';

  type ButtonState = State | 'inactive' | 'success';

  type Entry = {
    rule: string;
    message: string;
    actualElementId: string;
  };

  export type Issue = {
    id: string;
    category: string;
    message: string;
    rule: string;
  };

  type Issues = Record<string, Issue[]>[];

  class Linting {
    constructor(
      bpmnjs: Modeler,
      canvas: Canvas,
      config: any,
      elementRegistry: ElementRegistry,
      eventBus: EventBus,
      overlays: Overlays,
      translate: Translate
    );
    protected _bpmnjs: Modeler;
    protected _canvas: Canvas;
    protected _config: any;
    protected _elementRegistry: ElementRegistry;
    protected _eventBus: EventBus;
    protected _overlays: Overlays;
    protected _translate: Translate;

    protected _issues: Record<string, any>;
    protected _active: boolean;
    protected _linterConfig: EmptyConfig;
    protected _overlayIds: Record<string, string>;

    _init(): void;
    _fireComplete(issues: Issues[]): void;
    _createIssues(issues: Issues[]): void;
    _createElementIssues(elementId: string, elementIssues: Issues[]): void;
    _formatIssues(issues: Record<string, Issue>): Issues[];
    _setActive(active: boolean): void;
    _addErrors($ul: Element, errors: Entry[]): void;
    _addWarnings($ul: Element, warnings: Entry[]): void;
    _addEntry($ul: Element, state: State, entry: Entry): void;
    _clearOverlays(): void;
    _clearIssues(): void;
    _setButtonState(state: ButtonState, errors: object, warnings: object): void;
    _updateButton(): void;
    _createButton(): void;

    setLinterConfig(linterConfig: EmptyConfig): void;
    getLinterConfig(): EmptyConfig;
    isActive(): boolean;
    toggle(newActive: boolean): boolean;
    lint(): any;
    update(): void;
  }

  class LintEditorActions extends EditorActions {
    constructor(injector: Injector, linting: Linting);
  }

  const bpmnlint: ModuleDefinition;
  export default bpmnlint;
}

//解决Lint 无 declare.d.ts
declare module 'bpmnlint/rules/conditional-flows';
declare module 'bpmnlint/rules/end-event-required';
declare module 'bpmnlint/rules/event-sub-process-typed-start-event';
declare module 'bpmnlint/rules/fake-join';
declare module 'bpmnlint/rules/label-required';
declare module 'bpmnlint/rules/no-bpmndi';
declare module 'bpmnlint/rules/no-complex-gateway';
declare module 'bpmnlint/rules/no-disconnected';
declare module 'bpmnlint/rules/no-duplicate-sequence-flows';
declare module 'bpmnlint/rules/no-gateway-join-fork';
declare module 'bpmnlint/rules/no-implicit-split';
declare module 'bpmnlint/rules/no-inclusive-gateway';
declare module 'bpmnlint/rules/single-blank-start-event';
declare module 'bpmnlint/rules/single-event-definition';
declare module 'bpmnlint/rules/start-event-required';
declare module 'bpmnlint/rules/sub-process-blank-start-event';
declare module 'bpmnlint/rules/superfluous-gateway';
