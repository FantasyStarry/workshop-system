import React from 'react';
import { Image } from 'antd';

interface ImagePreviewProps {
  images: string[];
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return <div style={{ color: '#999' }}>暂无图片</div>;
  }

  return (
    <Image.PreviewGroup>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {images.map((src, index) => (
          <Image key={index} src={src} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ))}
      </div>
    </Image.PreviewGroup>
  );
};

export default ImagePreview;
