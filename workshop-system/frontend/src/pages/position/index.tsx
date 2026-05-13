import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Switch, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPositionList, createPosition, updatePosition, deletePosition } from '../../api/position';
import { getDeptTree } from '../../api/user';
import type { PositionItem } from '../../types/position';
import type { DeptItem } from '../../types/user';

const PositionPage: React.FC = () => {
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [depts, setDepts] = useState<DeptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [filterDeptId, setFilterDeptId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPositions();
    loadDepts();
  }, []);

  const loadPositions = async () => {
    setLoading(true);
    try {
      const res = await getPositionList(filterDeptId);
      setPositions(res.data);
    } catch {
      // handled
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadPositions();
  }, [filterDeptId]);

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
    setEditingPosition(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: positions.length + 1, status: true });
    setModalOpen(true);
  };

  const handleEdit = (position: PositionItem) => {
    setEditingPosition(position);
    form.setFieldsValue({
      ...position,
      status: position.status === 1,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePosition(id);
      message.success('删除成功');
      loadPositions();
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
      if (editingPosition) {
        await updatePosition({ ...data, id: editingPosition.id });
      } else {
        await createPosition(data);
      }
      message.success(editingPosition ? '更新成功' : '创建成功');
      setModalOpen(false);
      loadPositions();
    } catch {
      // handled
    }
  };

  const columns = [
    { title: '岗位编码', dataIndex: 'positionCode', key: 'positionCode', width: 120 },
    { title: '岗位名称', dataIndex: 'positionName', key: 'positionName', width: 150 },
    { title: '所属部门', dataIndex: 'deptName', key: 'deptName', width: 120 },
    { title: '描述', dataIndex: 'description', key: 'description', width: 200 },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
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
      render: (_: any, record: PositionItem) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该岗位吗？" onConfirm={() => handleDelete(record.id)}>
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
      title="岗位管理"
      extra={
        <Space>
          <Select
            placeholder="按部门筛选"
            allowClear
            style={{ width: 180 }}
            options={flattenDepts(depts)}
            onChange={(val) => setFilterDeptId(val)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增岗位
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={positions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title={editingPosition ? '编辑岗位' : '新增岗位'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="positionName" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
            <Input placeholder="如：钢筋工" />
          </Form.Item>
          <Form.Item name="positionCode" label="岗位编码" rules={[{ required: true, message: '请输入岗位编码' }]}>
            <Input placeholder="如：POS_STEEL" />
          </Form.Item>
          <Form.Item name="deptId" label="所属部门" rules={[{ required: true, message: '请选择所属部门' }]}>
            <Select placeholder="请选择部门" options={flattenDepts(depts)} allowClear />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序序号">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="status" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入岗位描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PositionPage;
