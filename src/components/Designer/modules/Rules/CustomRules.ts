import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import EventBus from 'diagram-js/lib/core/EventBus';

class CustomRules extends RuleProvider {
  constructor(eventBus: EventBus) {
    super(eventBus);
    this.init();
  }

  init() {}
}

CustomRules.$inject = ['eventBus'];

export default CustomRules;
