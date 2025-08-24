import {
  BpmnExecutionListener,
  BpmnField,
  BpmnScript,
  BpmnTaskListener,
  BpmnThrowEvent,
} from '/#/bpmn/bpmn-moddle/bpmn-instance';

export declare interface ScriptForm extends BpmnScript {
  scriptType?: string;
}

export interface ListenersForm {
  event: string;
  type: 'expression' | 'class' | 'delegateExpression';
  value: string | undefined;
  fields: BpmnField[];
}

export declare interface ExecutionListenerForm {
  event: string;
  type: string;
  fields: BpmnField[];
}

export declare interface TaskListenerForm extends BpmnTaskListener {
  type: string;
  script?: ScriptForm;
}

export declare interface ThrowEventForm extends BpmnThrowEvent {
  type: 'Signal' | 'Escalation' | 'Error' | 'Message';
  scope?: 'processInstance' | 'global' | '';
  escalationCode?: string;
  errorCode?: string;
}

declare interface FormItemVisible {
  listenerType: string;
  scriptType: string;
}

export declare interface ConditionalForm {
  conditionType?: string;
  expression?: string;
  scriptType?: string;
  language?: string;
  body?: string;
  resource?: string;
}
