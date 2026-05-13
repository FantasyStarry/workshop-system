export function miniLogin(): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        // 简化版：使用固定账号登录
        wx.request({
          url: 'http://localhost:8080/api/auth/login',
          method: 'POST',
          data: { username: 'prod01', password: 'admin123' },
          success(result: any) {
            if (result.data.code === 200) {
              const token = result.data.data.token;
              wx.setStorageSync('token', token);
              const app = getApp();
              app.globalData.token = token;
              resolve();
            } else {
              reject(result.data.message);
            }
          },
          fail: reject
        });
      },
      fail: reject
    });
  });
}
