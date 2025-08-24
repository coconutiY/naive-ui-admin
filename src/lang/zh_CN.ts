import bpmn from './zh_CN/bpmn';
import panel from './zh_CN/bpmn/elements/panel';
import events from './zh_CN/bpmn/elements/events';
import gateway from './zh_CN/bpmn/elements/gateway';
import tasks from './zh_CN/bpmn/elements/tasks';
import contextPad from './zh_CN/bpmn/elements/context';
import other from './zh_CN/bpmn/elements/other';
import lint from './zh_CN/bpmn/lint';
import cron from './zh_CN/cron';
import dept from './zh_CN/selector/dept';

export default {
  global: {
    userSelect: {
      title: '用户选择',
      avatar: '头像',
      nickname: '昵称',
      username: '账号',
      placeholder: '请输入关键字',
      filterData: '筛选',
    },
    success: '成功',
    fail: '失败',
    error: '错误',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    cancel: '取消',
    ok: '确定',
    no: '否',
    yes: '是',
    close: '关闭',
    save: '保存',
    submit: '提交',
    reset: '重置',
    search: '搜索',
    select: '选择',
    remove: '移除',
    operation: '操作',
    dataEmpty: '暂无数据',
  },
  // 路由国际化
  route: {
    dashboard: '首页',
    document: '项目文档',
  },
  // 登录页面国际化
  login: {
    username: '用户名',
    password: '密码',
    login: '登 录',
    code: '请输入验证码',
    copyright: '',
  },
  navbar: {
    full: '全屏',
    language: '语言',
    dashboard: '首页',
    document: '项目文档',
    message: '消息',
    layoutSize: '布局大小',
    selectTenant: '选择租户',
    layoutSetting: '布局设置',
    personalCenter: '个人中心',
    logout: '退出登录',
  },
  bpmn: bpmn,
  elements: {
    ...panel,
    ...events,
    ...gateway,
    ...tasks,
    ...lint,
    ...contextPad,
    ...other,
  },
  cron: cron,
  selector: {
    dept:dept,
  },
};
