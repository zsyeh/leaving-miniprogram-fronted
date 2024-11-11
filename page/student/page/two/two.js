// leave_request.js
Page({
  data: {
      startDate: '',      // 开始日期
      startTime: '',      // 开始时间
      endDate: '',        // 结束日期
      endTime: '',        // 结束时间
      reason: '',         // 请假理由
      leaveDuration: 0,   // 请假时长（天数）
      leaveMessage: '',   // 提示信息
      leaveMessageColor: '' // 提示信息颜色
  },

  onLoad: function() {
      this.setDefaultStartDateTime();
  },

  // 设置默认的开始日期和时间为当前时间
  setDefaultStartDateTime: function() {
      const now = new Date();
      const year = now.getFullYear();
      const month = ('0' + (now.getMonth() + 1)).slice(-2);
      const day = ('0' + now.getDate()).slice(-2);
      const hours = ('0' + now.getHours()).slice(-2);
      const minutes = ('0' + now.getMinutes()).slice(-2);
      const formattedDate = `${year}-${month}-${day}`;
      const formattedTime = `${hours}:${minutes}`;
      this.setData({
          startDate: formattedDate,
          startTime: formattedTime
      }, () => {
          // 计算请假时长
          this.updateLeaveStatus();
      });
  },

  // 处理输入框变化
  handleInputChange: function (e) {
      const field = e.currentTarget.dataset.field;
      this.setData({
          [field]: e.detail.value
      }, () => {
          // 如果修改的是开始日期或结束日期，重新计算请假时长
          if (field === 'startDate' || field === 'endDate') {
              this.updateLeaveStatus();
          }
      });
  },

  // 选择开始日期
  chooseStartDate: function (e) {
      this.setData({
          startDate: e.detail.value
      }, () => {
          this.updateLeaveStatus();
      });
  },

  // 选择开始时间
  chooseStartTime: function (e) {
      this.setData({
          startTime: e.detail.value
      });
  },

  // 选择结束日期
  chooseEndDate: function (e) {
      this.setData({
          endDate: e.detail.value
      }, () => {
          this.updateLeaveStatus();
      });
  },

  // 选择结束时间
  chooseEndTime: function (e) {
      this.setData({
          endTime: e.detail.value
      });
  },

  // 格式化日期和时间为 "YYYY-MM-DDTHH:MM:SSZ"
  formatDateTime: function (date, time) {
      return `${date}T${time}:00Z`; // 包含小时和分钟
  },

  // 计算请假时长并设置提示信息
  updateLeaveStatus: function() {
      const { startDate, endDate } = this.data;
      if (!startDate || !endDate) {
          this.setData({
              leaveDuration: 0,
              leaveMessage: '',
              leaveMessageColor: ''
          });
          return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // 计算天数差（包含开始和结束日期）
      const timeDiff = end - start;
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

      if (dayDiff < 1) {
          // 结束日期早于开始日期
          this.setData({
              leaveDuration: dayDiff,
              leaveMessage: '结束日期不能早于开始日期',
              leaveMessageColor: 'red'
          });
          return;
      }

      this.setData({
          leaveDuration: dayDiff
      });

      // 根据请假时长设置提示信息和颜色
      if (dayDiff <= 2) { // 少于三天
          this.setData({
              leaveMessage: '请假时间少于三天，可快速审核',
              leaveMessageColor: 'green'
          });
      } else if (dayDiff >=3 && dayDiff <=6) { // 3-6天
          this.setData({
              leaveMessage: '请假时间较长，请和老师协商好',
              leaveMessageColor: 'orange' // 使用橙色代替黄色，颜色更显眼
          });
      } else { // 7天以上
          this.setData({
              leaveMessage: '时间多于7天，需要二重审批，请确认输入的时间无误',
              leaveMessageColor: 'red'
          });
      }
  },

  // 提交请假申请
  submitLeaveRequest: function () {
      const {startDate, startTime, endDate, endTime, reason } = this.data;

      // 检查输入是否完整
      if (!startDate || !startTime || !endDate || !endTime || !reason) {
          wx.showToast({
              title: '请填写所有字段',
              icon: 'none'
          });
          return;
      }

      // 获取 access token
      const accessToken = wx.getStorageSync('accessToken');

      // 格式化开始和结束日期时间
      const formattedStartDate = this.formatDateTime(startDate, startTime);
      const formattedEndDate = this.formatDateTime(endDate, endTime);

      // 构建请假请求数据
      const leaveRequest = {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          reason
      };

      // 显示加载提示
      wx.showLoading({
          title: '提交中...',
      });

      // 发送请求
      wx.request({
          url: 'http://127.0.0.1:8000/api/request-leave/',
          method: 'POST',
          header: {
              'Authorization': `Bearer ${accessToken}`, // 使用 access token
              'Content-Type': 'application/json'        // 设置请求头
          },
          data: leaveRequest,
          success: (res) => {
              if (res.statusCode === 201) {
                  wx.showToast({
                      title: '申请成功',
                      icon: 'success'
                  });
                  // 清空输入框
                  this.setData({
                      startDate: '',
                      startTime: '',
                      endDate: '',
                      endTime: '',
                      reason: '',
                      leaveDuration: 0,
                      leaveMessage: '',
                      leaveMessageColor: ''
                  });
                  // 重新设置默认开始日期和时间
                  this.setDefaultStartDateTime();
              } else {
                  wx.showToast({
                      title: '申请失败',
                      icon: 'none'
                  });
              }
          },
          fail: () => {
              wx.showToast({
                  title: '请求失败，请稍后再试',
                  icon: 'none'
              });
          },
          complete: () => {
              // 隐藏加载提示
              wx.hideLoading();
          }
      });
  },

  // 跳转到“我的假条”页面
  navigateToMyLeaves: function () {
      wx.navigateTo({
          url: '../my_leaves/my_leaves'
      });
  }
});
