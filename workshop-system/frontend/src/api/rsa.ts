import request from './request';
import JSEncrypt from 'jsencrypt';

interface CachedKey {
  key: string;
  timestamp: number;
}

let cachedKey: CachedKey | null = null;
const KEY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

function toPemFormat(rawBase64: string): string {
  if (rawBase64.includes('-----BEGIN')) {
    return rawBase64;
  }
  return '-----BEGIN PUBLIC KEY-----\n' + rawBase64 + '\n-----END PUBLIC KEY-----';
}

export async function getPublicKey(): Promise<string> {
  const now = Date.now();

  if (cachedKey && (now - cachedKey.timestamp) < KEY_CACHE_DURATION) {
    return cachedKey.key;
  }

  const res = await request.get('/auth/public-key');
  cachedKey = {
    key: toPemFormat(res.data.data.publicKey),
    timestamp: now,
  };

  return cachedKey.key;
}

export function encryptPassword(password: string, publicKey: string): string {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) {
    throw new Error('密码加密失败');
  }
  return encrypted;
}

export async function encryptPasswordAsync(password: string): Promise<string> {
  const publicKey = await getPublicKey();
  return encryptPassword(password, publicKey);
}

