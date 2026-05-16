import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDeptTree, createDept, updateDept, deleteDept } from '../../api/user';
import type { DeptItem } from '../../types/user';

interface FlatDept extends DeptItem {
  parentName: string;
  level: number;
  key: number;
}

/** 将树形部门数据拍平成列表，同时记录上级名称和层级 */
const flattenTree = (nodes: DeptItem[], parentName: string = '-', level: number = 0): FlatDept[] => {
  const result: FlatDept[] = [];
  for (const node of nodes) {
    result.push({
      ...node,
      key: node.id,
      parentName,
      level,
      children: undefined, // 清理 children 避免干扰表格
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, node.deptName, level + 1));
    }
  }
  return result;
};

const DeptPage: React.FC = () => {
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DeptItem | null>(null);
  const [parentId, setParentId] = useState<number>(0);
  const [form] = Form.useForm();

  const flatDepts = useMemo(() => flattenTree(depts), [depts]);

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

  const handleEdit = (dept: FlatDept) => {
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
        message.success('更新成功');
      } else {
        await createDept({ ...data, parentId });
        message.success('创建成功');
      }
      setModalOpen(false);
      loadDepts();
    } catch {
      // handled
    }
  };

  const columns = [
    {
      title: '部门编码',
      dataIndex: 'deptCode',
      key: 'deptCode',
      width: 120,
    },
    {
      title: '部门名称',
      key: 'deptName',
      render: (_: any, record: FlatDept) => (
        <span style={{ paddingLeft: record.level * 24, display: 'inline-block' }}>
          {record.level > 0 && <span style={{ color: '#94A3B8', marginRight: 4 }}>└ </span>}
          {record.deptName}
        </span>
      ),
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 140,
      render: (v: string) => v || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (v: number) =>
        v === 1 ? <Tag color="#059669">启用</Tag> : <Tag color="default">禁用</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: any, record: FlatDept) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddChild(record.id)}
          >
            添加子部门
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该部门吗？子部门也会被删除。"
            onConfirm={() => handleDelete(record.id)}
          >
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
      title="部门管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoot}>
          新增部门
        </Button>
      }
    >
      <Table
        dataSource={flatDepts}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
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
            <Input placeholder="如：管理部" />
          </Form.Item>
          <Form.Item name="deptCode" label="部门编码" rules={[{ required: true, message: '请输入部门编码' }]}>
            <Input placeholder="如：DEPT_ADMIN" />
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
