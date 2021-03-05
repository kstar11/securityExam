import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import request from '@/utils/request';
import {
  AppState,
  PageModel,
  UserModel,
  UserQueryModel,
} from '@/utils/interfaces';
import {
  Layout,
  Table,
  Popconfirm,
  Form,
  Input,
  Modal,
  message,
  Card,
  Row,
  Col,
  Space,
  Button,
  Upload,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import styles from './index.less';
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
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
    app: { loading },
  } = props;
  const [userFrom] = Form.useForm<UserModel>();
  const [queryForm] = Form.useForm<UserQueryModel>();
  const [dataSource, setDataSource] = useState<Array<UserModel>>([]);
  const [modalShow, toggleVisible] = useState<boolean>(false);
  const [activeItem, setActive] = useState<UserModel | undefined>(defaultUser);
  const [query, setQuery] = useState<UserQueryModel>({
    UserName: '',
    MobilePhone: '',
  });
  const fetchData = () => {
    dispatch({
      type: 'app/toggleLoading',
      payload: true,
    });
    request('/api/user/getpagelist', {
      method: 'POST',
      data: { userDto: { ...pagation, ...query } },
    }).then((res) => {
      if (res.code === 200) {
        setDataSource(res.data.data);
        dispatch({
          type: 'app/toggleLoading',
          payload: false,
        });
      }
    });
  };
  useEffect(() => {
    fetchData();
  }, []);
  let pagation: PageModel = {
    pageIndex: 1,
    pageSize: 15,
  };
  const columns: ColumnsType<UserModel> = [
    {
      title: '用户名',
      dataIndex: 'UserName',
      key: 'UserName',
    },
    {
      title: '用户账号',
      dataIndex: 'UserAccount',
      key: 'UserAccount',
    },
    {
      title: '联系方式',
      dataIndex: 'MobilePhone',
      key: 'MobilePhone',
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
        return (
          <Space>
            <a onClick={() => editUser(record)}>修改</a>
            <Popconfirm
              title="确认删除此用户?"
              onConfirm={() => deleteUser(record)}
            >
              <a>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const updateUser = () => {
    request('/api/user/updateTbSysUser', {
      method: 'POST',
      data: activeItem,
    }).then((res) => {
      if (res.code === 200) {
        message.success(res.info);
        fetchData();
        toggleVisible(false);
      }
    });
  };

  const addUser = () => {
    setActive(defaultUser);
    toggleVisible(true);
    userFrom.setFieldsValue(defaultUser);
  };

  const editUser = (record: UserModel) => {
    userFrom.setFieldsValue(record);
    setActive(record);
    toggleVisible(true);
  };

  const deleteUser = (record: UserModel) => {
    dispatch({
      type: 'app/toggleLoading',
      payload: true,
    });
    request('/api/user/deletetbsysuser', {
      method: 'POST',
      data: { key: record.UserNum },
    }).then((res) => {
      console.log(res);
    });
  };

  return (
    <Layout className={styles.main}>
      <Space direction="vertical">
        <Card bodyStyle={{ paddingBottom: 12 }}>
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
                <Form.Item name="UserName" label="用户名">
                  <Input placeholder="用户名" />
                </Form.Item>
              </Col>
              <Col md={{ span: 8 }}>
                <Form.Item name="MobilePhone" label="联系方式">
                  <Input placeholder="联系方式" />
                </Form.Item>
              </Col>
              <Col style={{ textAlign: 'right' }} md={{ span: 8 }}>
                <Space>
                  <Button
                    onClick={() => {
                      setQuery({
                        UserName: '',
                        MobilePhone: '',
                      });
                      queryForm.setFieldsValue({
                        UserName: '',
                        MobilePhone: '',
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
        <Card>
          <Layout className={styles.actions}>
            <h3>用户信息列表</h3>
            <Space>
              <Upload>
                <Button type="primary" icon={<UploadOutlined />}>
                  导入
                </Button>
              </Upload>
              <Button type="primary" icon={<PlusOutlined />} onClick={addUser}>
                新建
              </Button>
              <Button type="primary" icon={<ReloadOutlined />}></Button>
            </Space>
          </Layout>
          <Table<UserModel>
            bordered
            key="UserNum"
            size="middle"
            rowKey="UserNum"
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: pagation.pageSize,
              onChange: (page) => {
                pagation = { ...pagation, pageIndex: page };
                fetchData();
              },
            }}
          />
        </Card>
        <Modal
          title="修改用户信息"
          visible={modalShow}
          destroyOnClose
          onCancel={() => {
            userFrom.resetFields();
            setActive(defaultUser);
            toggleVisible(false);
          }}
          onOk={() => updateUser()}
          bodyStyle={{ padding: styles.modalBody }}
        >
          <Form
            name="userModal"
            {...layout}
            form={userFrom}
            initialValues={activeItem}
            style={{ marginTop: 24 }}
            onValuesChange={(_, allValue) =>
              setActive({ ...activeItem, ...allValue })
            }
          >
            <Form.Item
              name="UserAccount"
              label="用户账号"
              rules={[{ required: true, message: '请输入用户账号!' }]}
            >
              <Input disabled placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="UserName"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="RoleName"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色!' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="MobilePhone"
              label="联系方式"
              rules={[{ required: true, message: '请输入联系方式!' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="OrganizationName"
              label="所在部门"
              rules={[{ required: true, message: '请选择所在部门!' }]}
            >
              <Input placeholder="用户名" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Layout>
  );
};
export default connect(({ app }: AppState) => ({ app }))(UserList);
