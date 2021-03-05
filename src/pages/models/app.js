export default {
  namespace: 'app', // 表示在全局 state 上的 key
  state: {
    loading: true,
    userInfo: {},
  }, // 状态数据
  subscriptions: {}, // 订阅数据源
  effects: {
    *toggleLoading({ payload }, { put }) {
      yield put({
        type: 'loading',
        payload: payload,
      });
    },
    *userInfo({ payload }, { put }) {
      yield put({
        type: 'setUserInfo',
        payload: payload,
      });
    },
  }, // 管理异步操作，采用了 generator 的相关概念
  reducers: {
    loading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    setUserInfo(state, { payload }) {
      return {
        ...state,
        userInfo: payload,
      };
    },
  }, // 管理同步方法，必须是纯函数
};
