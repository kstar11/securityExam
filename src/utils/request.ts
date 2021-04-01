import { extend } from 'umi-request';
import { notification } from 'antd';
import { history } from 'umi';
import Cookies from 'js-cookie';
import errorHandler from './errorHandle';
import { OptionModel } from '@/utils/interfaces';

const request = extend({
  prefix: 'http://10.14.3.77:12336', //相当于baseurl
  timeout: 30000,
  errorHandler,
});

request.interceptors.request.use((url: string, options: OptionModel) => {
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
  if (response.url.includes('getUserTemplete')) {
    const data = await response.clone().blob();
    if (!data) {
      notification.error({
        message: `服务器错误!`,
        description: `下载错误,请联系管理员`,
      });
    }
  } else {
    const data = await response.clone().json();
    if (data.code === 404) {
      notification.error({
        message: `用户验证出错!`,
        description: data.info,
      });
      Cookies.remove('Authorization');
      history.replace('/login');
    }
  }
  return response;
});

export default request;
