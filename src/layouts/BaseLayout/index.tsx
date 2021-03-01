import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'umi';
import { CopyrightOutlined } from '@ant-design/icons';
import styles from './index.less';
const { Header, Footer, Sider, Content } = Layout;

export default function BaseLayout(props: any) {
  const [collapsed, toggleCollapsed] = useState(false);
  return (
    <Layout className={styles.base}>
      <Sider
        breakpoint="md"
        collapsible
        collapsed={collapsed}
        onCollapse={() => toggleCollapsed(!collapsed)}
      >
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
            <Link to="/userlist">用户管理</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/loglist">操作日志</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header>Header</Header>
        <Content>{props.children}</Content>
        <Footer className={styles.footer}>
          <p>
            Copyright <CopyrightOutlined />
            2021 牛逼科拉斯工作组荣誉出品
          </p>
        </Footer>
      </Layout>
    </Layout>
  );
}
