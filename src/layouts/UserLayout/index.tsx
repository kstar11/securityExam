import { Layout, Form, Input, Button, Col, Row, notification } from 'antd';
import { history } from 'umi';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import crypto from 'crypto';
import request from '@/utils/request';
import {
  CopyrightOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import styles from './index.less';
const { Footer } = Layout;

const LoginForm = () => {
  const [verifyToken, setToken] = useState<any>(btoa(Math.random().toString()));
  const [captcha, setCode] = useState(
    `http://10.14.3.206:12336/api/sys/verifyCode?verifyToken=${verifyToken}`,
  );
  useEffect(() => {
    if (Cookies.get('Authorization')) {
      history.push('/index/userlist');
    }
  }, []);
  const [loading, toggleLoading] = useState(false);
  const onFinish = (values: any) => {
    toggleLoading(true);
    const params = {
      ...values,
      userPwd: crypto.createHash('md5').update(values.userPwd).digest('hex'),
      verifyToken,
    };
    console.log(params);
    request('/api/sys/login', {
      method: 'POST',
      params: params,
    }).then((res) => {
      toggleLoading(false);
      if (!res.data) {
        notification.error({
          message: '登录失败',
          description: res.info,
        });
        reFreshCode();
      } else if (res.code === 200) {
        Cookies.set('Authorization', res.data.token, { expires: 24 * 60 * 60 });
        history.push('/index/userlist');
        notification.success({
          message: '登录成功!',
          description: '欢迎回来!',
        });
      }
    });
  };
  const reFreshCode = () => {
    setToken((pre: string) => {
      const newCaptch = btoa(Math.random().toString());
      setCode(
        `http://10.14.3.206:12336/api/sys/verifyCode?verifyToken=${newCaptch}`,
      );
      return newCaptch;
    });
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      onFinish={onFinish}
      style={{ marginTop: 24 }}
    >
      <Form.Item
        name="userName"
        rules={[{ required: true, message: '请输入用户名!' }]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="用户名"
        />
      </Form.Item>
      <Form.Item
        name="userPwd"
        rules={[{ required: true, message: '请输入用户密码!' }]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="用户密码"
        />
      </Form.Item>
      <Form.Item>
        <Row gutter={8}>
          <Col span={16}>
            <Form.Item
              name="verifycode"
              noStyle
              rules={[
                {
                  required: true,
                  message: '必须填写验证码!',
                },
              ]}
            >
              <Input placeholder="验证码" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <img
              onClick={() => reFreshCode()}
              style={{ height: 32 }}
              src={captcha}
              alt="验证码"
              title="验证码"
            />
          </Col>
        </Row>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          loading={loading}
          style={{ width: '100%' }}
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};

export default function UserLayout(props: any) {
  return (
    <Layout className={styles.userlayout}>
      <img src={require('@/assets/logo.png')} alt="" className={styles.logo} />
      <Layout className={styles.userWrap}>
        <div className={styles.typeTab}>
          <div className={styles.tab}>用户登录</div>
        </div>
        <div className={styles.centerContainer}>
          <LoginForm />
        </div>
      </Layout>
      <Footer>
        <p>
          Copyright <CopyrightOutlined />
          2021 牛逼科拉斯工作组荣誉出品
        </p>
      </Footer>
    </Layout>
  );
}
