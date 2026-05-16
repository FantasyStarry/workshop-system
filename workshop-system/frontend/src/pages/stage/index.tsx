import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, InputNumber, Switch, message, Popconfirm, Spin, Tag, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CameraOutlined, LinkOutlined } from '@ant-design/icons';
import { getStageList, createStage, updateStage, deleteStage, getStagePositions, updateStagePositions } from '../../api/stage';
import { getPositionList } from '../../api/position';
import type { ProductionStage } from '../../types/production';
import type { PositionItem } from '../../types/position';

const StagePage: React.FC = () => {
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProductionStage | null>(null);
  const [bindingStage, setBindingStage] = useState<ProductionStage | null>(null);
  const [selectedPositionIds, setSelectedPositionIds] = useState<number[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStages();
    loadPositions();
  }, []);

  const loadStages = async () => {
    setLoading(true);
    try {
      const res = await getStageList();
      setStages(res.data.sort((a, b) => a.stageSeq - b.stageSeq));
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const res = await getPositionList();
      setPositions(res.data.filter((p) => p.status === 1));
    } catch {
      // handled
    }
  };

  const handleAdd = () => {
    setEditingStage(null);
    form.resetFields();
    form.setFieldsValue({ stageSeq: stages.length + 1, needQc: false, needPhoto: false, status: true, estimatedHours: 0 });
    setModalOpen(true);
  };

  const handleEdit = (stage: ProductionStage) => {
    setEditingStage(stage);
    form.setFieldsValue({
      ...stage,
      needQc: stage.needQc === 1,
      needPhoto: stage.needPhoto === 1,
      status: stage.status === 1,
    });
    setModalOpen(true);
  };

  const handleBindPositions = async (stage: ProductionStage) => {
    setBindingStage(stage);
    try {
      const res = await getStagePositions(stage.id);
      setSelectedPositionIds(res.data);
    } catch {
      setSelectedPositionIds([]);
    }
    setBindModalOpen(true);
  };

  const handleSaveBindings = async () => {
    if (!bindingStage) return;
    try {
      await updateStagePositions(bindingStage.id, selectedPositionIds);
      message.success('岗位绑定已更新');
      setBindModalOpen(false);
    } catch {
      // handled
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStage(id);
      message.success('删除成功');
      loadStages();
    } catch {
      // handled
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data = {
      ...values,
      needQc: values.needQc ? 1 : 0,
      needPhoto: values.needPhoto ? 1 : 0,
      status: values.status ? 1 : 0,
    };
    try {
      if (editingStage) {
        await updateStage({ ...data, id: editingStage.id });
      } else {
        await createStage(data);
      }
      message.success(editingStage ? '更新成功' : '创建成功');
      setModalOpen(false);
      loadStages();
    } catch {
      // handled
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card
      title={<span style={{ color: '#0F172A', fontWeight: 600 }}>生产环节管理</span>}
      style={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#4F46E5', borderColor: '#4F46E5' }}>
          新增环节
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {stages.map((stage) => (
          <Col key={stage.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              hoverable
              style={{ opacity: stage.status === 0 ? 0.6 : 1, borderRadius: 8, border: '1px solid #F1F5F9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
              actions={[
                <LinkOutlined key="bind" onClick={() => handleBindPositions(stage)} title="绑定岗位" />,
                <EditOutlined key="edit" onClick={() => handleEdit(stage)} />,
                <Popconfirm
                  key="delete"
                  title="确定删除该环节吗？"
                  onConfirm={() => handleDelete(stage.id)}
                >
                  <DeleteOutlined style={{ color: '#DC2626' }} />
                </Popconfirm>,
              ]}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: stage.status === 0 ? '#94A3B8' : '#4F46E5',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    margin: '0 auto 12px',
                  }}
                >
                  {stage.stageSeq}
                </div>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#0F172A' }}>
                  {stage.stageName}
                  {stage.status === 0 && <Tag color="default" style={{ marginLeft: 4, fontSize: 10 }}>已禁用</Tag>}
                </div>
                <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }}>编码：{stage.stageCode}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {stage.needQc === 1 && (
                    <span style={{ color: '#4F46E5', fontSize: 12 }}>
                      <CheckCircleOutlined /> 需质检
                    </span>
                  )}
                  {stage.needPhoto === 1 && (
                    <span style={{ color: '#059669', fontSize: 12 }}>
                      <CameraOutlined /> 需拍照
                    </span>
                  )}
                  {stage.needQc !== 1 && stage.needPhoto !== 1 && (
                    <span style={{ color: '#94A3B8', fontSize: 12 }}>无需质检/拍照</span>
                  )}
                </div>
                {stage.estimatedHours > 0 && (
                  <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>预估工时：{stage.estimatedHours}h</div>
                )}
                {stage.description && (
                  <div style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>{stage.description}</div>
                )}
              </div>
            </Card>
          </Col>
        ))}
        {stages.length === 0 && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>暂无环节，请点击右上角新增</div>
          </Col>
        )}
      </Row>

      <Modal
        title={editingStage ? '编辑环节' : '新增环节'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stageName" label="环节名称" rules={[{ required: true, message: '请输入环节名称' }]}>
            <Input placeholder="如：钢筋绑扎" />
          </Form.Item>
          <Form.Item name="stageCode" label="环节编码" rules={[{ required: true, message: '请输入环节编码' }]}>
            <Input placeholder="如：STEEL_BINDING" />
          </Form.Item>
          <Form.Item name="stageSeq" label="排序序号" rules={[{ required: true, message: '请输入排序序号' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="estimatedHours" label="预估工时(h)">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="needQc" label="是否需要质检" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="needPhoto" label="是否需要拍照" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入环节描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`绑定岗位 - ${bindingStage?.stageName || ''}`}
        open={bindModalOpen}
        onOk={handleSaveBindings}
        onCancel={() => setBindModalOpen(false)}
        width={520}
      >
        <div style={{ marginBottom: 12, color: '#475569' }}>选择该环节需要由哪些岗位来执行：</div>
        <Select
          mode="multiple"
          placeholder="请选择岗位"
          style={{ width: '100%' }}
          value={selectedPositionIds}
          onChange={setSelectedPositionIds}
          options={positions.map((p) => ({
            label: `${p.positionName}${p.deptName ? ` (${p.deptName})` : ''}`,
            value: p.id,
          }))}
          optionFilterProp="label"
        />
      </Modal>
    </Card>
  );
};

export default StagePage;
