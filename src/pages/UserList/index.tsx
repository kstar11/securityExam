import React, { useState, useEffect } from 'react';
import { connect, history } from 'umi';
import request from '@/utils/request';
import axios from 'axios';
import {
  AppState,
  PageModel,
  UserModel,
  UserQueryModel,
  PasswordModel,
} from '@/utils/interfaces';
import {
  Layout,
  Table,
  Dropdown,
  Spin,
  Form,
  Input,
  Tooltip,
  Modal,
  Card,
  Row,
  Col,
  Space,
  Button,
  Upload,
  Select,
  message,
  notification,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { toMD5, encryptByDES, DES_KEY } from '@/utils/desCrypto';
import styles from './index.less';
import {
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
  DownOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import Cookies from 'js-cookie';
const { Option } = Select;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const defaultUser = {
  UserNum: '',
  UserName: '',
  MobilePhone: '',
  LastVisit: '',
  RoleId: '',
  RoleName: '',
  DataRights: '',
  OrganizationId: '',
  OrganizationLink: '',
  OrganizationName: '',
};

const UserList: React.FC = (props: any) => {
  const {
    dispatch,
    app: { loading, userInfo },
  } = props;
  const [userFrom] = Form.useForm<UserModel>();
  const [queryForm] = Form.useForm<UserQueryModel>();
  const [passwordForm] = Form.useForm<PasswordModel>();
  const [dataSource, setDataSource] = useState<Array<UserModel>>([]);
  const [modalShow, toggleVisible] = useState<boolean>(false);
  const [pwdModal, togglePWDVisible] = useState<boolean>(false);
  const [upLoading, toggleUpLoading] = useState<boolean>(false);
  const [pwdLoading, togglepwdLoading] = useState<boolean>(false);
  const [activeItem, setActive] = useState<UserModel | any>(defaultUser);
  const [departs, setDeparts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState<UserQueryModel>({
    UserName: '',
  });
  const [password, setPassword] = useState<PasswordModel>({
    userNum: 0,
    pwd: '',
    copyNewpwd: '',
    newpwd: '',
  });
  const fetchData = (page?: number) => {
    dispatch({
      type: 'app/toggleLoading',
      payload: true,
    });
    const pages = { ...pagation };
    if (page) {
      setPage({ ...pagation, pageIndex: page });
      pages.pageIndex = page;
    }
    request('/api/user/getpagelist', {
      method: 'POST',
      data: { ...pages, ...query },
    }).then((res) => {
      if (res.code === 200) {
        setDataSource(res.data.data);
        setPage({ ...pagation, total: res.data.total });
        dispatch({
          type: 'app/toggleLoading',
          payload: false,
        });
      }
    });
  };
  useEffect(() => {
    fetchData();
    request('/api/user/getRoleList').then((res) => {
      if (!res) return;
      if (res.code === 200) {
        const result: any = [];
        Object.keys(res.data).map((item) => {
          result.push({
            name: res.data[item],
            value: parseInt(item),
          });
        });
        setRoles(result);
      }
    });
    request('/api/user/getOrganizationList').then((res) => {
      if (!res) return;
      if (res.code === 200) {
        setDeparts(res.data);
      }
    });
  }, []);
  const [pagation, setPage] = useState<PageModel>({
    pageIndex: 1,
    pageSize: 15,
    total: 0,
  });
  const columns: ColumnsType<UserModel> = [
    {
      title: '用户账号',
      dataIndex: 'UserAccount',
      key: 'UserAccount',
    },
    {
      title: '用户名',
      dataIndex: 'UserName',
      key: 'UserName',
    },
    {
      title: '联系方式',
      dataIndex: 'MobilePhone',
      key: 'MobilePhone',
      render: (text: string, record: UserModel, index: number) => {
        const reg = /^(\d{3})\d{4}(\d{4})$/;
        return text.replace(reg, '$1****$2');
      },
    },
    {
      title: '所在部门',
      dataIndex: 'OrganizationName',
      key: 'OrganizationName',
    },
    {
      title: '用户角色',
      dataIndex: 'RoleName',
      key: 'RoleName',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (text: string, record: UserModel, index: number) => {
        const userActions = (
          <ul className={styles.userActions}>
            <Space direction="vertical">
              <li onClick={() => editUser(record)}>
                <a>修改基本信息</a>
              </li>
              {(userInfo && userInfo.RoleId === 202103021127001) ||
              userInfo.RoleId === 202103021127002 ||
              userInfo.UserNum === record.UserNum ? (
                <li
                  onClick={() =>
                    changePwd({
                      userNum: record.UserNum,
                      pwd: '',
                      copyNewpwd: '',
                      newpwd: '',
                    })
                  }
                >
                  <a>修改密码</a>
                </li>
              ) : null}
              {userInfo &&
              (userInfo.RoleId === 202103021127001 ||
                userInfo.RoleId === 202103021127002) &&
              userInfo.UserNum !== record.UserNum ? (
                <li
                  onClick={() =>
                    Modal.confirm({
                      title: '确认删除此用户?',
                      icon: <QuestionCircleOutlined />,
                      onOk: () => deleteUser(record),
                      content: '请谨慎删除用户!',
                    })
                  }
                >
                  <a>删除</a>
                </li>
              ) : null}
            </Space>
          </ul>
        );
        if (userInfo && userInfo.RoleId === 202103021127003) {
          return (
            <a
              onClick={() =>
                changePwd({
                  userNum: record.UserNum,
                  pwd: '',
                  copyNewpwd: '',
                  newpwd: '',
                })
              }
            >
              修改密码
            </a>
          );
        } else {
          return (
            <Dropdown overlay={userActions} trigger={['click']}>
              <Space>
                <a>操作</a>
                <DownOutlined style={{ color: '#1890ff' }} />
              </Space>
            </Dropdown>
          );
        }
      },
    },
  ];

  const renderAction = () => {
    if (!userInfo) return;
    if (
      userInfo.RoleId === 202103021127001 ||
      userInfo.RoleId === 202103021127002
    ) {
      return (
        <React.Fragment>
          <Button type="primary" icon={<DownloadOutlined />}>
            <a
              style={{ color: '#fff' }}
              href="http://10.14.3.145:12300/Content/ModelFile/用户导入模板.xlsx"
              download
            >
              下载模板
            </a>
          </Button>
          <Upload {...uploader}>
            <Button
              type="primary"
              loading={upLoading}
              icon={<UploadOutlined />}
            >
              导入
            </Button>
          </Upload>
        </React.Fragment>
      );
    }
  };

  const updateUser = () => {
    userFrom.validateFields().then((values) => {
      if (pwdLoading) {
        return;
      }
      togglepwdLoading(true);
      request('/api/user/updateTbSysUser', {
        method: 'POST',
        data: activeItem,
      }).then((res) => {
        if (res.code === 200) {
          togglepwdLoading(false);
          notification.success({
            message: '修改成功!',
            description: res.info,
          });
          toggleVisible(false);
          if (activeItem.UserNum === userInfo.UserNum) {
            request('/api/Login/GetLoginModel').then((res) => {
              dispatch({
                type: 'app/userInfo',
                payload: res,
              });
            });
            fetchData();
          }
        } else {
          toggleVisible(false);
          notification.error({
            message: '修改失败!',
            description: res.info,
          });
        }
      });
    });
  };

  const uploader: any = {
    accept:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,',
    showUploadList: false,
    customRequest: (info: any) => {
      const formData = new FormData();
      formData.append('file', info.file);
      axios({
        method: 'post',
        url: 'http://10.14.3.77:12336/api/user/importUser',
        data: formData,
        headers: {
          Authorization: Cookies.get('Authorization'),
        },
      }).then((res) => {
        const { data } = res;
        toggleUpLoading(false);
        if (data.code !== 200) {
          notification.warning({
            message: '上传失败!',
            description: data.info,
          });
        } else if (data.code === 404) {
          notification.error({
            message: `用户验证出错!`,
            description: data.info,
          });
          Cookies.remove('Authorization');
          history.replace('/login');
        } else {
          notification.success({
            message: '上传成功!',
            description: '已成功导入用户数据!',
          });
          fetchData();
        }
      });
    },
    beforeUpload: (file: any) => {
      const extName = file.name.substr(
        file.name.lastIndexOf('.') + 1,
        file.name.length,
      );
      if (
        extName === 'exe' ||
        extName === 'php' ||
        extName === 'java' ||
        extName === 'bat' ||
        extName === 'sql'
      ) {
        message.error('再玩我就报警了!');
        return false;
      }
      if (file) toggleUpLoading(true);
    },
  };

  const changePwd = (record: any) => {
    setPassword({ ...password, ...record });
    togglePWDVisible(true);
  };

  const updatePassword = () => {
    if (pwdLoading) {
      return;
    }
    const { pwd, newpwd, copyNewpwd } = password;
    if (
      !pwd &&
      userInfo.RoleId !== 202103021127001 &&
      userInfo.RoleId !== 202103021127002
    ) {
      message.warning('请填写原密码!');
      return;
    }
    if (!newpwd || !copyNewpwd) {
      message.warning('请填写新密码!');
      return;
    }
    togglepwdLoading(true);
    const params = {
      ...password,
      pwd: toMD5(pwd),
      newpwd: encryptByDES(newpwd, DES_KEY),
      copyNewpwd: encryptByDES(copyNewpwd, DES_KEY),
    };
    request('/api/user/updatePwd', {
      method: 'POST',
      data: params,
    })
      .then((res) => {
        if (res.code === 200) {
          notification.success({
            message: '操作成功!',
            description: '已成功修改密码!',
          });
        } else {
          notification.error({
            message: '操作失败!',
            description: res.info,
          });
        }
      })
      .finally(() => {
        passwordForm.resetFields();
        togglePWDVisible(false);
        togglepwdLoading(false);
        setPassword({
          userNum: 0,
          pwd: '',
          copyNewpwd: '',
          newpwd: '',
        });
      });
  };

  const editUser = (record: UserModel) => {
    const reg = /^(\d{3})\d{4}(\d{4})$/;
    setActive({
      ...record,
      EncryptMobilePhone: record.MobilePhone.replace(reg, '$1****$2'),
    });
    userFrom.setFieldsValue({
      ...record,
      EncryptMobilePhone: record.MobilePhone.replace(reg, '$1****$2'),
    });
    toggleVisible(true);
  };

  const deleteUser = (record: UserModel) => {
    dispatch({
      type: 'app/toggleLoading',
      payload: true,
    });
    request('/api/user/deletetbsysuser', {
      method: 'POST',
      params: { key: record.UserNum },
    }).then((res) => {
      if (res.code === 200) {
        notification.success({
          message: `${res.info}!`,
          description: '已成功删除用户!',
        });
        fetchData();
      } else {
        notification.error({
          message: `删除是吧!`,
          description: `${res.info}`,
        });
      }
    });
  };

  const changeDepart = (val: any) => {
    if (!val) return;
    const selected: any = departs.filter(
      (item: any) => item.OrganizationId === val,
    )[0];
    const newInfo = {
      ...activeItem,
      OrganizationName: selected.OrganizationName,
      OrganizationId: val,
    };
    setActive(newInfo);
  };
  const changeRole = (val: any) => {
    if (!val) return;
    const selected: any = roles.filter((item: any) => item.value === val)[0];
    const newInfo = {
      ...activeItem,
      RoleName: selected.name,
      RoleId: parseInt(val),
    };
    setActive(newInfo);
  };

  console.log(userInfo);

  return (
    <Layout className={styles.main}>
      <Space direction="vertical" className={styles.content}>
        <Card className={styles.query}>
          <Form
            name="query"
            {...layout}
            form={queryForm}
            initialValues={query}
            onValuesChange={(_, allValue) =>
              setQuery({ ...query, ...allValue })
            }
          >
            <Row gutter={8}>
              <Col md={{ span: 8 }}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  name="UserName"
                  label="用户名"
                >
                  <Input placeholder="用户名" />
                </Form.Item>
              </Col>
              <Col offset={8} style={{ textAlign: 'right' }} md={{ span: 8 }}>
                <Space>
                  <Button
                    onClick={() => {
                      setQuery({
                        UserName: '',
                      });
                      queryForm.setFieldsValue({
                        UserName: '',
                      });
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    onClick={() => fetchData()}
                    type="primary"
                    loading={loading}
                    icon={<SearchOutlined />}
                  >
                    查询
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card className={styles.table}>
          <Layout className={styles.actions}>
            <h3>用户信息列表</h3>
            <Space>
              {renderAction()}
              <Tooltip title="刷新">
                <Button
                  type="primary"
                  onClick={() => fetchData()}
                  icon={<ReloadOutlined />}
                  loading={loading}
                ></Button>
              </Tooltip>
            </Space>
          </Layout>
          <Table<UserModel>
            bordered
            key="UserNum"
            size="middle"
            rowKey="UserNum"
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: true, y: 420 }}
            pagination={{
              pageSize: pagation.pageSize,
              total: pagation.total,
              onChange: (page) => {
                fetchData(page);
              },
            }}
          />
        </Card>
      </Space>
      <Modal
        title="修改用户信息"
        visible={modalShow}
        destroyOnClose
        onCancel={() => {
          userFrom.resetFields();
          setActive(defaultUser);
          toggleVisible(false);
        }}
        // onOk={() => updateUser()}
        bodyStyle={{ padding: styles.modalBody }}
        footer={
          <Space>
            <Button
              onClick={() => {
                userFrom.resetFields();
                setActive(defaultUser);
                toggleVisible(false);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={updateUser}
              loading={pwdLoading}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Spin style={{ height: '100%' }} size="large" spinning={pwdLoading}>
          <Form
            name="userModal"
            {...layout}
            form={userFrom}
            initialValues={activeItem}
            style={{ marginTop: 24 }}
            onValuesChange={(changedValues, allValue) => {
              setActive({ ...activeItem, ...allValue });
            }}
          >
            <Form.Item
              name="UserAccount"
              label="用户账号"
              rules={[{ required: true, message: '请输入用户账号!' }]}
            >
              <Input disabled placeholder="用户账号" />
            </Form.Item>
            <Form.Item
              name="UserName"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input
                disabled={userInfo && userInfo.RoleId === 202103021127003}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              label="联系方式"
              name="EncryptMobilePhone"
              rules={[
                {
                  required: true,
                  message: '请输入联系方式!',
                  pattern: /(^1[3|4|5|6|7|8][0-9]\d{8}$)|(^1[3|4|5|6|7|8][0-9]\*{4}\d{4}$)/,
                  validator: (rule, value) => {
                    if (!value) {
                      rule.message = '请输入联系方式!';
                      return Promise.reject();
                    }
                    if (!rule.pattern?.exec(value)) {
                      rule.message = '不是一个有效的手机号码!';
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                disabled={userInfo && userInfo.RoleId === 202103021127003}
                placeholder="联系方式"
              />
            </Form.Item>
            <Form.Item
              name="OrganizationId"
              label="所在部门"
              rules={[{ required: true, message: '请选择所在部门!' }]}
            >
              <Select
                disabled={userInfo && userInfo.RoleId === 202103021127003}
                allowClear
                onChange={(val) => changeDepart(val)}
              >
                {departs
                  ? departs.map((item: any, key: number) => {
                      return (
                        <Option
                          key={item.OrganizationId}
                          value={item.OrganizationId}
                        >
                          {item.OrganizationName}
                        </Option>
                      );
                    })
                  : null}
              </Select>
            </Form.Item>
            <Form.Item
              name="RoleId"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色!' }]}
            >
              <Select
                disabled={userInfo && userInfo.RoleId === 202103021127003}
                allowClear
                onChange={(val) => changeRole(val)}
              >
                {roles.map((item: any) => {
                  return (
                    <Option value={item.value} key={item.value}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal
        title="修改密码"
        destroyOnClose
        visible={pwdModal}
        maskClosable={false}
        onCancel={() => {
          passwordForm.resetFields();
          setPassword({
            userNum: 0,
            pwd: '',
            copyNewpwd: '',
            newpwd: '',
          });
          togglePWDVisible(false);
        }}
        bodyStyle={{ padding: styles.modalBody }}
        footer={
          <Space>
            <Button
              onClick={() => {
                passwordForm.resetFields();
                setPassword({
                  userNum: 0,
                  pwd: '',
                  copyNewpwd: '',
                  newpwd: '',
                });
                togglePWDVisible(false);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={updatePassword}
              loading={pwdLoading}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Spin style={{ height: '100%' }} size="large" spinning={pwdLoading}>
          <Form
            form={passwordForm}
            name="paddwordModal"
            {...layout}
            style={{ marginTop: 24 }}
            onValuesChange={(_, allValue) =>
              setPassword({ ...password, ...allValue })
            }
          >
            {(userInfo &&
              userInfo.RoleId !== 202103021127001 &&
              userInfo.RoleId !== 202103021127002) ||
            userInfo.UserNum === password.userNum ? (
              <Form.Item
                name="pwd"
                label="原密码"
                rules={[
                  {
                    required: true,
                    message: '请输入原密码!',
                    pattern: /(?=.*[A-Za-z].*[A-Za-z])(?=.*[0-9].*[0-9])(?=.*[\W_].*[\W_]).{8,}/,
                  },
                ]}
              >
                <Input type="password" placeholder="原密码" />
              </Form.Item>
            ) : null}
            <Form.Item
              name="newpwd"
              label="新密码"
              rules={[
                {
                  required: true,
                  message: '请输入新密码!',
                  pattern: /(?=.*[A-Za-z].*[A-Za-z])(?=.*[0-9].*[0-9])(?=.*[\W_].*[\W_]).{8,}/,
                  validator: (rule, value) => {
                    if (!value) {
                      rule.message = '请输入新密码!';
                      return Promise.reject();
                    }
                    if (!rule.pattern?.exec(value)) {
                      rule.message = '密码强度不符合!';
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="password" placeholder="新密码" />
            </Form.Item>
            <Form.Item
              name="copyNewpwd"
              label="确认密码"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: '请确认新密码!',
                  pattern: /(?=.*[A-Za-z].*[A-Za-z])(?=.*[0-9].*[0-9])(?=.*[\W_].*[\W_]).{8,}/,
                  validator: (rule, value) => {
                    if (!value) {
                      rule.message = '请输入新密码!';
                      return Promise.reject();
                    }
                    if (!rule.pattern?.exec(value)) {
                      rule.message = '密码强度不符合!';
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newpwd') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的新密码不一致!'));
                  },
                }),
              ]}
            >
              <Input type="password" placeholder="确认密码" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Layout>
  );
};
export default connect(({ app }: AppState) => ({ app }))(UserList);
