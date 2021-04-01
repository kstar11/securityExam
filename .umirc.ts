import { defineConfig } from 'umi';

export default defineConfig({
  history: {
    type: 'browser',
  },
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  title: '信息中心安全考试',
  favicon: '/assets/favicon.ico',
  metas: [
    {
      name: 'keywords',
      content: '中心研发竞赛16组,规划信息中心,事业一部,安全考试',
    },
    {
      name: 'description',
      content:
        '长沙市规划信息服务中心事业一部一季度安全知识考试,中心研发竞赛16组参赛作品',
    },
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  // layout: {},
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/index',
      component: '@/layouts/BaseLayout/index',
      routes: [
        {
          path: '/index/userlist',
          exact: true,
          component: 'UserList',
          title: '信息中心安全考试-用户数据列表',
        },
      ],
    },
    {
      path: '/login',
      exact: true,
      component: '@/layouts/UserLayout/index',
      title: '信息中心安全考试-用户登录',
    },
  ],
  fastRefresh: {},
});
