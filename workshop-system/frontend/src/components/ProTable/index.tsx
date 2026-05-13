import React, { useState, useEffect, useCallback } from 'react';
import { Table, Form, Row, Col, Button, Input, Select, DatePicker, Space, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { PageResult } from '../../types/api';

const { RangePicker } = DatePicker;

export interface SearchColumn {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange';
  options?: { label: string; value: any }[];
  placeholder?: string;
}

interface ProTableProps<T> {
  columns: ColumnsType<T>;
  fetchData: (page: number, pageSize: number, params: any) => Promise<PageResult<T>>;
  searchColumns?: SearchColumn[];
  rowKey?: string;
  extraButtons?: React.ReactNode;
  onRow?: (record: T) => any;
  expandable?: any;
}

function ProTable<T extends Record<string, any>>({
  columns,
  fetchData,
  searchColumns = [],
  rowKey = 'id',
  extraButtons,
  onRow,
  expandable,
}: ProTableProps<T>) {
  const [form] = Form.useForm();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  const loadData = useCallback(
    async (page = pagination.page, pageSize = pagination.pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: any = {};
        searchColumns.forEach((col) => {
          const val = values[col.name];
          if (val !== undefined && val !== null && val !== '') {
            if (col.type === 'dateRange' && Array.isArray(val)) {
              params.startDate = val[0]?.format('YYYY-MM-DD');
              params.endDate = val[1]?.format('YYYY-MM-DD');
            } else {
              params[col.name] = val;
            }
          }
        });
        const result = await fetchData(page, pageSize, params);
        setData(result.records);
        setPagination({ page: result.page, pageSize: result.pageSize, total: result.total });
      } finally {
        setLoading(false);
      }
    },
    [fetchData, form, pagination.page, pagination.pageSize, searchColumns]
  );

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    loadData(1, pagination.pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    loadData(1, pagination.pageSize);
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    loadData(pag.current || 1, pag.pageSize || 10);
  };

  const renderSearchForm = () => {
    if (searchColumns.length === 0) return null;
    return (
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          {searchColumns.map((col) => (
            <Col key={col.name}>
              <Form.Item name={col.name} label={col.label}>
                {col.type === 'input' && (
                  <Input placeholder={col.placeholder || `请输入${col.label}`} allowClear style={{ width: 180 }} />
                )}
                {col.type === 'select' && (
                  <Select
                    placeholder={col.placeholder || `请选择${col.label}`}
                    allowClear
                    style={{ width: 180 }}
                    options={col.options}
                  />
                )}
                {col.type === 'dateRange' && <RangePicker style={{ width: 260 }} />}
              </Form.Item>
            </Col>
          ))}
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <Card>
      {renderSearchForm()}
      {extraButtons && <div style={{ marginBottom: 16 }}>{extraButtons}</div>}
      <Table<T>
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        loading={loading}
        onRow={onRow}
        expandable={expandable}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />
    </Card>
  );
}

export default ProTable;
