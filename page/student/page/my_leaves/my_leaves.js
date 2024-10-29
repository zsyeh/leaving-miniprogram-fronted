Page({
  data: { leaveRequests: [] },

  onLoad: function () {
      this.fetchMyLeaves();
  },

  fetchMyLeaves: function () {
      const accessToken = wx.getStorageSync('accessToken');
      wx.request({
          url: 'http://127.0.0.1:8000/api/view-leave/',
          method: 'GET',
          header: {
              'Authorization': `Bearer ${accessToken}`
          },
          success: (res) => {
              if (res.statusCode === 200) {
                  this.setData({ leaveRequests: res.data });
              } else {
                  wx.showToast({ title: '获取请假条失败', icon: 'none' });
              }
          },
          fail: () => {
              wx.showToast({ title: '请求失败，请稍后再试', icon: 'none' });
          }
      });
  }
});
