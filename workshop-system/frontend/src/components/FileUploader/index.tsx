import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { uploadOrderFiles } from '../../api/order';

const { Dragger } = Upload;

interface FileUploaderProps {
  orderId: number;
  onUploaded?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ orderId, onUploaded }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择文件');
      return;
    }
    setUploading(true);
    try {
      const files = fileList.map((f) => f.originFileObj as RcFile).filter(Boolean);
      await uploadOrderFiles(orderId, files);
      message.success('上传成功');
      setFileList([]);
      onUploaded?.();
    } catch {
      // error handled by interceptor
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Dragger
        multiple
        fileList={fileList}
        onChange={({ fileList: newList }) => setFileList(newList)}
        beforeUpload={() => false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持单次或批量上传</p>
      </Dragger>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        icon={<UploadOutlined />}
        style={{ marginTop: 16 }}
      >
        {uploading ? '上传中...' : '开始上传'}
      </Button>
    </div>
  );
};

export default FileUploader;
