import { useState, useEffect } from 'react';
import { Layout, Menu, Spin, Avatar, Dropdown, Card, PageHeader } from 'antd';
import { Link, history, connect } from 'umi';
import request from '@/utils/request';
import Cookies from 'js-cookie';
import { CopyrightOutlined, UserOutlined } from '@ant-design/icons';
import { AppState } from '@/utils/interfaces';
import styles from './index.less';
const { Header, Footer, Sider, Content } = Layout;

function BaseLayout(props: any) {
  const {
    dispatch,
    app: { userInfo },
  } = props;
  useEffect(() => {
    request('/api/Login/GetLoginModel').then((res) => {
      dispatch({
        type: 'app/userInfo',
        payload: res,
      });
    });
  }, []);
  const [collapsed, toggleCollapsed] = useState(false);
  const {
    app: { loading },
  } = props;
  const userMenu = () => {
    return (
      <Menu>
        <Menu.Item>
          <a onClick={() => logout()}>退出登录</a>
        </Menu.Item>
      </Menu>
    );
  };
  const logout = () => {
    request('/api/sys/outlongin', {
      method: 'POST',
    }).then((res) => {
      if (res.info === '退出成功') {
        Cookies.remove('Authorization');
        history.replace('/login');
      }
    });
  };
  return (
    <Layout className={styles.base}>
      <Header className={styles.header}>
        <div className={styles.logo}>
          <img src={require('@/assets/xxzx.png')} alt="" />
          <p className={styles.title}>牛逼克拉斯后台管理系统</p>
        </div>
        <Dropdown overlay={userMenu} placement="bottomCenter" arrow>
          <div className={styles.userIcon}>
            <Avatar
              className={styles.avatar}
              size="default"
              icon={<UserOutlined />}
            />
            <span style={{ color: '#fff', marginLeft: 8 }}>
              {userInfo.UserName}
            </span>
          </div>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          breakpoint="md"
          collapsible
          collapsed={collapsed}
          onCollapse={() => toggleCollapsed(!collapsed)}
        >
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to="/index/userlist">用户管理</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/index/loglist">操作日志</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <PageHeader
            style={{ background: '#fff' }}
            className="site-page-header"
            title="首页"
          />
          <Content className={styles.content}>
            <Spin style={{ height: '100%' }} size="large" spinning={loading}>
              {props.children}
            </Spin>
          </Content>
          <Footer className={styles.footer}>
            <p>
              Copyright <CopyrightOutlined />
              2021 牛逼科拉斯工作组荣誉出品
            </p>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
export default connect(({ app }: AppState) => ({ app }))(BaseLayout);
