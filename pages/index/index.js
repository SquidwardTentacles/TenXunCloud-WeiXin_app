//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 腾讯云 
  tenxunWould() {
    var CosAuth = require('../../public/cos-auth'); // 这里引用了 cos-auth.js，下载地址为 https://unpkg.com/cos-js-sdk-v5/demo/common/cos-auth.min.js 

    var Bucket = 'zy-98-1302095893';
    var Region = 'ap-shenzhen-fsi';
    var ForcePathStyle = false; // 是否使用后缀式，涉及签名计算和域名白名单配置，后缀式说明看上文

    var uploadFile = function () {

      // 请求用到的参数
      var prefix = 'https://' + Bucket + '.cos.' + Region + '.myqcloud.com/';
      if (ForcePathStyle) {
        // 后缀式请求在签名时域名使用地域域名，而不是存储桶域名，具体说明见本文上述“3.后缀式请求”
        prefix = 'https://cos.' + Region + '.myqcloud.com/' + Bucket + '/';
      }

      // 对更多字符编码的 url encode 格式
      var camSafeUrlEncode = function (str) {
        return encodeURIComponent(str)
          .replace(/!/g, '%21')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/\*/g, '%2A');
      };

      // 获取临时密钥
      var stsCache;
      var getCredentials = function (callback) {
        if (stsCache && Date.now() / 1000 + 30 < stsCache.expiredTime) {
          callback(data.credentials);
          return;
        }
        wx.request({
          method: 'GET',
          url: 'https://example.com/sts.php', // 服务端签名，参考上文说的获取临时密钥
          dataType: 'json',
          success: function (result) {
            var data = result.data;
            var credentials = data.credentials;
            if (credentials) {
              stsCache = data
            } else {
              wx.showModal({
                title: '临时密钥获取失败',
                content: JSON.stringify(data),
                showCancel: false
              });
            }
            callback(stsCache && stsCache.credentials);
          },
          error: function (err) {
            wx.showModal({
              title: '临时密钥获取失败',
              content: JSON.stringify(err),
              showCancel: false
            });
          }
        });
      };

      // 计算签名
      var getAuthorization = function (options, callback) {
        // getCredentials(function (credentials) {
        callback({
          // XCosSecurityToken: credentials.sessionToken,
          Authorization: CosAuth({
            SecretId: '',
            SecretKey: '',
            Method: options.Method,
            Pathname: options.Pathname,
          })
        });
        // });
      };

      // 上传文件
      var uploadFile = function (filePath) {
        var Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
        var signPathname = '/'; // PostObject 接口 Key 是放在 Body 传输，所以请求路径和签名路径是 /
        if (ForcePathStyle) {
          // 后缀式请求在签名时用的路径，要包含存储桶名称，具体说明见本文上述“3.后缀式请求”
          signPathname = '/' + Bucket + '/';
        }
        getAuthorization({
          Method: 'POST',
          Pathname: signPathname
        }, function (AuthData) {
          var requestTask = wx.uploadFile({
            url: prefix,
            name: 'file',
            filePath: filePath,
            formData: {
              'key': Key,
              'success_action_status': 200,
              'Signature': AuthData.Authorization,
              'x-cos-security-token': AuthData.XCosSecurityToken,
              'Content-Type': '',
            },
            success: function (res) {
              var url = prefix + camSafeUrlEncode(Key).replace(/%2F/g, '/');
              console.log(res.statusCode);
              console.log(url);
              if (/^2\d\d$/.test('' + res.statusCode)) {
                wx.showModal({
                  title: '上传成功',
                  content: url,
                  showCancel: false
                });
              } else {
                wx.showModal({
                  title: '上传失败',
                  content: JSON.stringify(res),
                  showCancel: false
                });
              }
            },
            fail: function (res) {
              wx.showModal({
                title: '上传失败',
                content: JSON.stringify(res),
                showCancel: false
              });
            }
          });
          requestTask.onProgressUpdate(function (res) {
            console.log('进度:', res);
          });
        });
      };

      // 选择文件
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original'], // 可以指定是原图还是压缩图，这里默认用原图
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          uploadFile(res.tempFiles[0].path);
        }
      })
    };
    uploadFile()
  }
})