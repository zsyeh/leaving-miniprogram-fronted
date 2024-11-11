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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json' // 确保请求头包含内容类型
        },
        success: (res) => {
            if (res.statusCode === 200) {
                const formattedData = res.data.map((item) => ({
                    id: item.id,
                    name: item.student_name,          // 重命名为 name
                    class_name: item.student_class,   // 重命名为 class_name
                    start_date: this.formatDate(item.start_date),
                    end_date: this.formatDate(item.end_date),
                    reason: item.reason,
                    leave_time: item.leave_time,
                    status: item.status,
                    approver: item.approver,
                    student_number: item.student_number,
                    student_email: item.student_email
                })).reverse(); // 将数据倒序排列
                
                this.setData({
                    leaveRequests: formattedData
                });
            } else {
                wx.showToast({ title: '获取请假条失败', icon: 'none' });
            }
        },
        fail: () => {
            wx.showToast({ title: '请求失败，请稍后再试', icon: 'none' });
        }
    });
}
,
  completeLeave: function (e) {
    const accessToken = wx.getStorageSync('accessToken');
    const leaveId = e.currentTarget.dataset.id;

    wx.request({
        url: `http://127.0.0.1:8000/api/CompleteLeavingView/${leaveId}/`,
        method: 'PATCH',
        header: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: (res) => {
            if (res.statusCode === 200) {
                wx.showToast({
                    title: '销假成功',
                    icon: 'success'
                });
                // 更新列表中该假条的批准状态
                const updatedRequests = this.data.leaveRequests.map((leave) => {
                    if (leave.id === leaveId) {
                        return { ...leave, status: 3 };
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
