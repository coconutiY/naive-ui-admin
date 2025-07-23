declare module 'bpmn-js-create-append-anything' {
  const index = {
    __depends__: [AppendElementTemplatesModule, CreateElementTemplatesModule, ReplaceElementTemplatesModule, RemoveTemplatesModule]
  };

  const index$1 = {
    __depends__: [AppendMenuModule, CreateMenuModule, EditorActionsModule, KeyboardBindingsModule]
  };
  const RemoveTemplatesModule = {
    __init__: ['removeTemplateReplaceProvider'],
    removeTemplateReplaceProvider: ['type', RemoveTemplateReplaceProvider]
  };
  export { index$1 as CreateAppendAnythingModule, index as CreateAppendElementTemplatesModule, RemoveTemplatesModule };
}
