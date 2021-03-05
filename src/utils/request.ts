import { extend } from 'umi-request';
import { notification } from 'antd';
import { history } from 'umi';
import Cookies from 'js-cookie';
import errorHandler from './errorHandle';
import { OptionModel, ResopnseModel } from '@/utils/interfaces';

const request = extend({
  prefix: 'http://10.14.3.206:12336', //相当于baseurl
  timeout: 10000,
  // errorHandler,
});

request.interceptors.request.use((url, options: OptionModel) => {
  options.headers = {
    'Content-Type': 'application/json;charset=utf-8',
  };
  if (Cookies.get('Authorization')) {
    options.headers = {
      ...options.headers,
      Authorization: Cookies.get('Authorization'),
    };
  }
  return {
    url,
    options: { ...options, interceptors: true },
  };
});
request.interceptors.response.use(async (response, options) => {
  const data = await response.clone().json();
  if (data.code === 404) {
    notification.error({
      message: `用户验证出错!`,
      description: data.info,
    });
    Cookies.remove('Authorization');
    history.replace('/login');
  }
  return response;
});

export default request;
