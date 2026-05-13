import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoleList, createRole, updateRole, deleteRole } from '../../api/user';
import type { RoleItem } from '../../types/user';

const RolePage: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoleList();
      setRoles(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setModalOpen(true);
  };

  const handleEdit = (role: RoleItem) => {
    setEditingRole(role);
    form.setFieldsValue({
      ...role,
      status: role.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('删除成功');
      loadRoles();
    } catch {
      // handled
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = {
      ...values,
      status: values.status ? 1 : 0,
    };
    try {
      if (editingRole) {
        await updateRole({ ...data, id: editingRole.id });
      } else {
        await createRole(data);
      }
      message.success(editingRole ? '更新成功' : '创建成功');
      setModalOpen(false);
      loadRoles();
    } catch {
      // handled
    }
  };

  const columns = [
    { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode', width: 120 },
    { title: '角色名称', dataIndex: 'roleName', key: 'roleName', width: 150 },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: number) => <Tag color={val === 1 ? 'green' : 'default'}>{val === 1 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: RoleItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该角色吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="角色管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </Button>
      }
    >
      <Table
        dataSource={roles}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="roleName" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="如：管理员" />
          </Form.Item>
          <Form.Item name="roleCode" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder="如：ADMIN" />
          </Form.Item>
          <Form.Item name="status" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入角色描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RolePage;
