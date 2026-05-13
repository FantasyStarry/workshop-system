import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Checkbox, message, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, updateUser, getUserDetail, getDeptTree, getRoleList } from '../../api/user';
import type { DeptItem, RoleItem } from '../../types/user';

const UserFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  useEffect(() => {
    loadDepts();
    loadRoles();
    if (id) loadUser(Number(id));
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      const res = await getUserDetail(userId);
      form.setFieldsValue({
        ...res.data,
        roleIds: res.data.roleIds ? res.data.roleIds.split(',').map(Number) : [],
      });
    } catch {
      // handled
    }
  };

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

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        roleIds: values.roleIds ? values.roleIds.join(',') : '',
      };
      if (isEdit) {
        await updateUser({ ...data, id: Number(id) });
      } else {
        await createUser(data);
      }
      message.success(isEdit ? '更新成功' : '创建成功');
      navigate('/users');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑用户' : '新增用户'}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 560 }}>
        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="请输入用户名" disabled={isEdit} />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={isEdit ? [] : [{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder={isEdit ? '留空则不修改' : '请输入密码'} />
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            {isEdit ? '更新' : '创建'}
          </Button>
          <Button onClick={() => navigate('/users')}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserFormPage;
