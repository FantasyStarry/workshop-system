import React from 'react';
import { Image } from 'antd';

interface QrCodeImageProps {
  qrCodeId: number;
  size?: number;
}

const QrCodeImage: React.FC<QrCodeImageProps> = ({ qrCodeId, size = 200 }) => {
  const src = `/api/qrcode/${qrCodeId}/image`;
  return <Image src={src} width={size} height={size} alt="二维码" fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f0f0f0'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'>加载中...</text></svg>" />;
};

export default QrCodeImage;
