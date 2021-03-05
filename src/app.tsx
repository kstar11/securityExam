import React from 'react';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.css';
import './index.less';

export function rootContainer(container: any) {
  const ThemeProvider: React.FC = () => (
    <ConfigProvider locale={zhCN}>{container}</ConfigProvider>
  );

  return React.createElement(ThemeProvider, null, container);
}
