import {
  BpmnEventListener,
  BpmnExecutionListener,
  BpmnScript,
  BpmnTaskListener,
  BpmnThrowEvent,
} from '@/types/bpmn/bpmn-moddle/bpmn-instance';

export declare interface ScriptForm extends BpmnScript {
  scriptType?: string;
}

export declare interface ExecutionListenerForm extends BpmnExecutionListener {
  type: string;
  script?: ScriptForm;
}
export declare interface TaskListenerForm extends BpmnTaskListener {
  type: string;
  script?: ScriptForm;
}

export declare interface EventListenerForm extends BpmnEventListener {
  type: string;
  eventName?: string;
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
