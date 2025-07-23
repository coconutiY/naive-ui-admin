/**
 * 源代码地址：https://codesandbox.io/s/5nj1t?file=/src/index.js
 * @author felix.mueller
 */
import rule_0 from 'bpmnlint/rules/conditional-flows';
import rule_1 from 'bpmnlint/rules/end-event-required';
import rule_2 from 'bpmnlint/rules/event-sub-process-typed-start-event';
import rule_3 from 'bpmnlint/rules/fake-join';
import rule_4 from 'bpmnlint/rules/label-required';
import rule_5 from 'bpmnlint/rules/no-bpmndi';
import rule_6 from 'bpmnlint/rules/no-complex-gateway';
import rule_7 from 'bpmnlint/rules/no-disconnected';
import rule_8 from 'bpmnlint/rules/no-duplicate-sequence-flows';
import rule_9 from 'bpmnlint/rules/no-gateway-join-fork';
import rule_10 from 'bpmnlint/rules/no-implicit-split';
import rule_11 from 'bpmnlint/rules/no-inclusive-gateway';
import rule_12 from 'bpmnlint/rules/single-blank-start-event';
import rule_13 from 'bpmnlint/rules/single-event-definition';
import rule_14 from 'bpmnlint/rules/start-event-required';
import rule_15 from 'bpmnlint/rules/sub-process-blank-start-event';
import rule_16 from 'bpmnlint/rules/superfluous-gateway';

class Resolver {
  private readonly cache: Map<string, any>;
  constructor() {
    this.cache = new Map();
  }
  resolveRule(pkg: string, ruleName: string) {
    const key = `${pkg}/${ruleName}`;
    const rule = this.cache.get(key);

    if (!rule) {
      // console.error(`无法解析规则 <${pkg}/${ruleName}>`);
      throw new Error(`无法解析规则 <${pkg}/${ruleName}>`);
    }

    // console.log(`成功解析规则 <${pkg}/${ruleName}>`);
    return rule;
  }
  resolveConfig(pkg: string, configName: string) {
    // console.error(`无法解析配置 <${configName}> 在 <${pkg}> 中`);
    throw new Error(`无法解析配置 <${configName}> 在 <${pkg}> 中`);
  }
  getCache() {
    return this.cache;
  }
}

const resolver = new Resolver();
resolver.getCache().set('bpmnlint/conditional-flows', rule_0);
resolver.getCache().set('bpmnlint/end-event-required', rule_1);
resolver.getCache().set('bpmnlint/event-sub-process-typed-start-event', rule_2);
resolver.getCache().set('bpmnlint/fake-join', rule_3);
resolver.getCache().set('bpmnlint/label-required', rule_4);
resolver.getCache().set('bpmnlint/no-bpmndi', rule_5);
resolver.getCache().set('bpmnlint/no-complex-gateway', rule_6);
resolver.getCache().set('bpmnlint/no-disconnected', rule_7);
resolver.getCache().set('bpmnlint/no-duplicate-sequence-flows', rule_8);
resolver.getCache().set('bpmnlint/no-gateway-join-fork', rule_9);
resolver.getCache().set('bpmnlint/no-implicit-split', rule_10);
resolver.getCache().set('bpmnlint/no-inclusive-gateway', rule_11);
resolver.getCache().set('bpmnlint/single-blank-start-event', rule_12);
resolver.getCache().set('bpmnlint/single-event-definition', rule_13);
resolver.getCache().set('bpmnlint/start-event-required', rule_14);
resolver.getCache().set('bpmnlint/sub-process-blank-start-event', rule_15);
resolver.getCache().set('bpmnlint/superfluous-gateway', rule_16);

const rules = {
  'conditional-flows': 'error',
  'end-event-required': 'error',
  'event-sub-process-typed-start-event': 'error',
  'fake-join': 'warn',
  'label-required': 'off',
  'no-bpmndi': 'error',
  'no-complex-gateway': 'error',
  'no-disconnected': 'error',
  'no-duplicate-sequence-flows': 'error',
  'no-gateway-join-fork': 'error',
  'no-implicit-split': 'error',
  'no-inclusive-gateway': 'error',
  'single-blank-start-event': 'error',
  'single-event-definition': 'error',
  'start-event-required': 'error',
  'sub-process-blank-start-event': 'error',
  'superfluous-gateway': 'warning',
};

const config = {
  rules: rules,
};

const bundle = {
  resolver: resolver,
  config: config,
};
export default bundle;

export { config, resolver };
