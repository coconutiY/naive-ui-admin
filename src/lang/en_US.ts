import bpmn from './en_US/bpmn';
import other from './en_US/bpmn/elements/other';
import events from './en_US/bpmn/elements/events';
import gateway from './en_US/bpmn/elements/gateway';
import tasks from './en_US/bpmn/elements/tasks';
import context from './en_US/bpmn/elements/context';
import lint from './en_US/bpmn/lint';
import cron from './en_US/cron';

export default {
  global: {
    userSelect: {
      title: 'Select User',
      avatar: 'Avatar',
      nickname: 'Nickname',
      username: 'Acconut',
      placeholder: 'Please enter a keyword',
      filterData: 'Filter Data',
    },
    success: 'success',
    fail: 'fail',
    error: 'error',
    warning: 'warning',
    info: 'info',
    confirm: 'confirm',
    cancel: 'cancel',
    ok: 'ok',
    no: 'no',
    yes: 'yes',
    close: 'close',
    save: 'save',
    submit: 'submit',
    reset: 'reset',
    search: 'search',
    select: 'Select',
    remove: 'Remove',
    operation: 'Operation',
    dataEmpty: 'Empty',
  },
  // 路由国际化
  route: {
    dashboard: 'Dashboard',
    document: 'Document',
  },
  // 登录页面国际化
  login: {
    username: 'Username',
    password: 'Password',
    login: 'Login',
    code: 'Verification Code',
    copyright: '',
  },
  // 导航栏国际化
  navbar: {
    full: 'Full Screen',
    language: 'Language',
    dashboard: 'Dashboard',
    document: 'Document',
    message: 'Message',
    layoutSize: 'Layout Size',
    selectTenant: 'Select Tenant',
    layoutSetting: 'Layout Setting',
    personalCenter: 'Personal Center',
    logout: 'Logout',
  },
  bpmn: bpmn,
  elements: {
    ...other,
    ...events,
    ...gateway,
    ...tasks,
    ...context,
    ...lint,
  },
  cron: cron,
};
