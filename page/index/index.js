
// 引入coolsite360交互配置设定
require('coolsite.config.js');

// 获取全局应用程序实例对象
var app = getApp();

// 创建页面实例对象
Page({
  name: "index", // 页面名称

  data: {
    modalHidden: true,
    id: '',
    pwd: '',
    txt: ''
  },

  // 弹窗显示
  show: function () {
    var showtxt = this.data.id + " " + this.data.pwd;
    this.setData({
      txt: showtxt,
      modalHidden: !this.data.modalHidden
    });
  },

  // 弹窗确认
  modalBindaconfirm: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    });
  },

  // 弹窗取消
  modalBindcancel: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    });
  },

  // 获取密码输入
  getPwd: function (e) {
    this.setData({ pwd: e.detail.value });
  },

  // 获取学号输入
  getId: function (e) {
    this.setData({ id: e.detail.value });
  },

  // 忘记密码页面跳转
  gobackpwd: function () {
    wx.navigateTo({
      url: '../getbackpwd/getbackpwd',
    });
  },

  // 页面加载
  onLoad() {
    app.coolsite360.register(this);
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#F9686C',
    });
  },

  // 学生页面跳转
  goStudent: function () {
    wx.redirectTo({
      url: '../student/page/two/two',
    });
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 3000
    });
  },

  // 教师页面跳转
  goTeacher: function () {
    wx.redirectTo({
      url: '../teacher/page/one/one',
    });
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 3000
    });
  },

  // 登录提交请求
  submit: function () {
    var that = this;

    if (this.data.id === "" || this.data.pwd === "") {
      this.setData({
        txt: "学号或密码不能为空",
        modalHidden: !this.data.modalHidden
      });
      return;
    }

    // 使用POST请求登录API获取access token
    wx.request({
      url: 'http://127.0.0.1:8000/api/token/', // 开发阶段可以使用HTTP
      method: "POST",
      data: {
        username: this.data.id, // 学号
        password: this.data.pwd  // 密码
      },
      header: {
        'content-type': 'application/json' // 指定 JSON 格式
      },
      success: function (res) {
        if (res.data.access) {
          const accessToken = res.data.access;
          wx.setStorageSync('accessToken', accessToken); // 保存 access token
          that.getUserInfo(accessToken); // 调用获取用户信息的函数
        } else {
          that.setData({
            txt: "登录失败，请检查学号和密码",
            modalHidden: !that.data.modalHidden
          });
        }
      },
      fail: function () {
        that.setData({
          txt: "请求失败，请检查网络连接",
          modalHidden: !that.data.modalHidden
        });
      }
    });
  },

  // 获取用户信息
  getUserInfo: function (token) {
    var that = this;

    wx.request({
      url: 'http://127.0.0.1:8000/api/UserInfoView/', // 获取用户信息API
      method: "GET",
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token // 使用获取到的 access token
      },
      success: function (res) {
        const { is_superuser, name, student_id } = res.data;

        wx.setStorageSync('name', name);
        wx.setStorageSync('student_id', student_id);

        // 根据is_superuser字段判断权限并跳转
        if (is_superuser) {
          that.goTeacher();
        } else {
          that.goStudent();
        }
      },
      fail: function () {
        that.setData({
          txt: "用户信息查询失败",
          modalHidden: !that.data.modalHidden
        });
      }
    });
  }
});
