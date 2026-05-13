import React, { useState, useEffect } from 'react';
import { Tag, Button, Popconfirm, message, Space, Modal, Form, Input, Select, Checkbox, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import ProTable from '../../components/ProTable';
import type { SearchColumn } from '../../components/ProTable';
import { getUserPage, createUser, updateUser, updateUserStatus, deleteUser } from '../../api/user';
import { getDeptTree, getRoleList } from '../../api/user';
import type { UserItem, DeptItem, RoleItem } from '../../types/user';
import type { PageResult } from '../../types/api';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '禁用', color: 'default' },
  1: { label: '启用', color: 'success' },
};

const searchColumns: SearchColumn[] = [
  { name: 'username', label: '用户名', type: 'input' },
  { name: 'realName', label: '姓名', type: 'input' },
];

const UserListPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form] = Form.useForm();
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  useEffect(() => {
    loadDepts();
    loadRoles();
  }, []);

  const loadDepts = async () => {
    try {
      const res = await getDeptTree();
      setDepts(res.data);
    } catch {
      // handled
    }
  };

  const loadRoles = async () => {
    try {
      const res = await getRoleList();
      setRoles(res.data);
    } catch {
      // handled
    }
  };

  const flattenDepts = (list: DeptItem[]): { label: string; value: number }[] => {
    const result: { label: string; value: number }[] = [];
    const walk = (items: DeptItem[], prefix = '') => {
      items.forEach((item) => {
        result.push({ label: prefix + item.deptName, value: item.id });
        if (item.children) walk(item.children, prefix + '  ');
      });
    };
    walk(list);
    return result;
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      password: undefined,
      roleIds: user.roleIds ? user.roleIds.split(',').map(Number) : [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      setTableRefreshKey((k) => k + 1);
    } catch {
      // handled
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    try {
      await updateUserStatus(id, currentStatus === 1 ? 0 : 1);
      message.success('状态已更新');
      setTableRefreshKey((k) => k + 1);
    } catch {
      // handled
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = {
      ...values,
      roleIds: values.roleIds ? values.roleIds.join(',') : '',
    };
    try {
      if (editingUser) {
        await updateUser({ ...data, id: editingUser.id });
      } else {
        await createUser(data);
      }
      message.success(editingUser ? '更新成功' : '创建成功');
      setModalOpen(false);
      setTableRefreshKey((k) => k + 1);
    } catch {
      // handled
    }
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
    { title: '姓名', dataIndex: 'realName', key: 'realName', width: 120 },
    { title: '部门', dataIndex: 'deptName', key: 'deptName', width: 120 },
    { title: '手机', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: number) => {
        const s = statusMap[val] || { label: '未知', color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: UserItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 1 ? (
            <Popconfirm
              title="确定停用该用户吗？"
              onConfirm={() => handleToggleStatus(record.id, 1)}
            >
              <Button type="link" size="small" icon={<StopOutlined />}>
                停用
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定启用该用户吗？"
              onConfirm={() => handleToggleStatus(record.id, 0)}
            >
              <Button type="link" size="small" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }}>
                启用
              </Button>
            </Popconfirm>
          )}
          <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchUsers = async (page: number, pageSize: number, params: any): Promise<PageResult<UserItem>> => {
    const res = await getUserPage({ page, pageSize, ...params });
    return res.data;
  };

  return (
    <>
      <ProTable<UserItem>
        key={tableRefreshKey}
        columns={columns}
        fetchData={fetchUsers}
        searchColumns={searchColumns}
        rowKey="id"
        extraButtons={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingUser ? '留空则不修改' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="realName" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="deptId" label="部门">
            <Select placeholder="请选择部门" options={flattenDepts(depts)} allowClear />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Checkbox.Group
              options={roles.map((r) => ({ label: r.roleName, value: r.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserListPage;
