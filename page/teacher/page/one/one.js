
// 引入coolsite360交互配置设定
require('coolsite.config.js');

// 获取全局应用程序实例对象
var app = getApp();

// 创建页面实例对象
Page({
  data: {
      leaveRequests: [],   // 存储所有的请假条数据
  },

  onLoad: function () {
      this.fetchLeaveRequests(); // 页面加载时请求所有请假条
  },

  // 请求所有请假条
  fetchLeaveRequests: function () {
    const accessToken = wx.getStorageSync('accessToken');
    
    wx.request({
        url: 'http://127.0.0.1:8000/api/admin/leaves/',
        method: 'GET',
        header: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: (res) => {
            if (res.statusCode === 200) {
                // 格式化并倒序排列数据
                const formattedData = res.data.map((item) => ({
                    ...item,
                    start_date: this.formatDate(item.start_date),
                    end_date: this.formatDate(item.end_date)
                })).reverse(); // 将数据倒序排列
                
                this.setData({
                    leaveRequests: formattedData
                });
            } else if (res.statusCode === 401) {
                // access token 失效，使用 refresh token 刷新
                this.refreshAccessToken(() => {
                    this.fetchLeaveRequests(); // 再次请求数据
                });
            } else {
                wx.showToast({
                    title: '无法获取数据',
                    icon: 'none'
                });
            }
        },
        fail: () => {
            wx.showToast({
                title: '请求失败，请稍后再试',
                icon: 'none'
            });
        }
    });
},


  // 刷新 access token
  refreshAccessToken: function (callback) {
      const refreshToken = wx.getStorageSync('refreshToken');

      wx.request({
          url: 'http://127.0.0.1:8000/api/token/refresh/',
          method: 'POST',
          data: {
              refresh: refreshToken
          },
          success: (res) => {
              if (res.statusCode === 200) {
                  wx.setStorageSync('accessToken', res.data.access);
                  callback(); // 刷新成功后执行回调
              } else {
                  wx.showToast({
                      title: '请重新登录',
                      icon: 'none'
                  });
                  wx.redirectTo({
                      url: '/pages/login/login' // 重定向到登录页面
                  });
              }
          },
          fail: () => {
              wx.showToast({
                  title: '刷新令牌失败',
                  icon: 'none'
              });
          }
      });
  },

  // 批准请假
  approveLeave: function (e) {
      const accessToken = wx.getStorageSync('accessToken');
      const leaveId = e.currentTarget.dataset.id;

      wx.request({
          url: `http://127.0.0.1:8000/api/admin/approve-leave/${leaveId}/`,
          method: 'PATCH',
          header: {
              'Authorization': `Bearer ${accessToken}`
          },
          success: (res) => {
              if (res.statusCode === 200) {
                  wx.showToast({
                      title: '批准成功',
                      icon: 'success'
                  });
                  // 更新列表中该假条的批准状态
                  const updatedRequests = this.data.leaveRequests.map((leave) => {
                      if (leave.id === leaveId) {
                          return { ...leave, status: 1 };
                      }
                      return leave;
                  });
                  this.setData({
                      leaveRequests: updatedRequests
                  });
              } else if (res.statusCode === 401) {
                  // access token 失效，刷新并重试批准
                  this.refreshAccessToken(() => {
                      this.approveLeave(e); // 重试批准操作
                  });
              } else {
                  wx.showToast({
                      title: '批准失败',
                      icon: 'none'
                  });
              }
          },
          fail: () => {
              wx.showToast({
                  title: '请求失败，请稍后再试',
                  icon: 'none'
              });
          }
      });
  },
  rejectLeave: function (e) {
    const accessToken = wx.getStorageSync('accessToken');
    const leaveId = e.currentTarget.dataset.id;

    wx.request({
        url: `http://127.0.0.1:8000/api/admin/reject-leave/${leaveId}/`,
        method: 'PATCH',
        header: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: (res) => {
            if (res.statusCode === 200) {
                wx.showToast({
                    title: '拒绝成功',
                    icon: 'success'
                });
                // 更新列表中该假条的批准状态
                const updatedRequests = this.data.leaveRequests.map((leave) => {
                    if (leave.id === leaveId) {
                        return { ...leave, status: 2 };
                    }
                    return leave;
                });
                this.setData({
                    leaveRequests: updatedRequests
                });
            } else if (res.statusCode === 401) {
                // access token 失效，刷新并重试拒绝
                this.refreshAccessToken(() => {
                    this.rejectLeave(e); // 重试拒绝操作
                });
            } else {
                wx.showToast({
                    title: '拒绝失败',
                    icon: 'none'
                });
            }
        },
        fail: () => {
            wx.showToast({
                title: '请求失败，请稍后再试',
                icon: 'none'
            });
        }
    });
},
formatDate: function (dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // 格式化成 "2024年12月21日 12:00" 的格式
  return `${year}年${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


});


