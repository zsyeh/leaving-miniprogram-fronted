Page({
  data: {
      name: '',           // 姓名
      className: '',      // 班级
      startDate: '',      // 开始日期
      startTime: '',      // 开始时间
      endDate: '',        // 结束日期
      endTime: '',        // 结束时间
      reason: ''          // 请假理由
  },

  // 处理输入框变化
  handleInputChange: function (e) {
      const { field } = e.currentTarget.dataset;
      this.setData({
          [field]: e.detail.value
      });
  },

  // 选择开始日期
  chooseStartDate: function (e) {
      this.setData({
          startDate: e.detail.value
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
      });
  },

  // 选择结束时间
  chooseEndTime: function (e) {
      this.setData({
          endTime: e.detail.value
      });
  },

  // 格式化日期和时间为 "YYYY-MM-DDTHH"
  formatDateTime: function (date, time) {
      return `${date}T${time.slice(0, 2)}`; // 仅获取时间的小时部分
  },

  // 提交请假申请
  submitLeaveRequest: function () {
      const { name, className, startDate, startTime, endDate, endTime, reason } = this.data;

      // 检查输入是否完整
      if (!name || !className || !startDate || !startTime || !endDate || !endTime || !reason) {
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
          name,
          class_name: className,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          reason
      };

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
                      name: '',
                      className: '',
                      startDate: '',
                      startTime: '',
                      endDate: '',
                      endTime: '',
                      reason: ''
                  });
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
          }
      });
  },
  navigateToMyLeaves: function () {
    wx.navigateTo({
        url: '../my_leaves/my_leaves'
    });
  }
});
