import React, { useEffect, useState } from 'react';
import { Card, Tree, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDeptTree, createDept, updateDept, deleteDept } from '../../api/user';
import type { DeptItem } from '../../types/user';
import type { DataNode } from 'antd/es/tree';

const DeptPage: React.FC = () => {
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DeptItem | null>(null);
  const [parentId, setParentId] = useState<number>(0);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDepts();
  }, []);

  const loadDepts = async () => {
    setLoading(true);
    try {
      const res = await getDeptTree();
      setDepts(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const convertToTreeData = (list: DeptItem[]): DataNode[] => {
    return list.map((item) => ({
      key: item.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>
            {item.deptName}
            {item.deptCode && <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>({item.deptCode})</span>}
            <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>排序: {item.sortOrder}</span>
            {item.status === 0 && <Tag color="default" style={{ marginLeft: 8 }}>已禁用</Tag>}
          </span>
          <Space style={{ marginLeft: 16 }} onClick={(e) => e.stopPropagation()}>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleAddChild(item.id)}
            >
              添加子部门
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(item)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除该部门吗？子部门也会被删除。"
              onConfirm={() => handleDelete(item.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      ),
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  const handleAddRoot = () => {
    setEditingDept(null);
    setParentId(0);
    form.resetFields();
    form.setFieldsValue({ sortOrder: 1, status: true });
    setModalOpen(true);
  };

  const handleAddChild = (pid: number) => {
    setEditingDept(null);
    setParentId(pid);
    form.resetFields();
    form.setFieldsValue({ sortOrder: 1, status: true });
    setModalOpen(true);
  };

  const handleEdit = (dept: DeptItem) => {
    setEditingDept(dept);
    setParentId(dept.parentId);
    form.setFieldsValue({
      deptName: dept.deptName,
      deptCode: dept.deptCode,
      sortOrder: dept.sortOrder,
      status: dept.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDept(id);
      message.success('删除成功');
      loadDepts();
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
      if (editingDept) {
        await updateDept({ id: editingDept.id, ...data });
      } else {
        await createDept({ ...data, parentId });
      }
      message.success(editingDept ? '更新成功' : '创建成功');
      setModalOpen(false);
      loadDepts();
    } catch {
      // handled
    }
  };

  return (
    <Card
      title="部门管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoot}>
          新增部门
        </Button>
      }
    >
      <Tree
        treeData={convertToTreeData(depts)}
        defaultExpandAll
        blockNode
        style={{ maxWidth: 700 }}
      />

      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="deptName" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="deptCode" label="部门编码">
            <Input placeholder="请输入部门编码，如：DEPT_PROD" />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="status" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DeptPage;
