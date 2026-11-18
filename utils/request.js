/**
 * 网络请求封装
 * 统一处理请求/响应、错误提示、loading 状态
 */

const envConfig = require('../config/env')

/**
 * 封装 wx.request
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（不含 baseUrl）
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求参数
 * @param {boolean} [options.showLoading=false] - 是否显示 loading
 * @param {string} [options.loadingText='加载中...'] - loading 文字
 * @returns {Promise}
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    showLoading = false,
    loadingText = '加载中...'
  } = options

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true })
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: envConfig.baseUrl + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      timeout: envConfig.timeout,
      success: function (res) {
        if (showLoading) {
          wx.hideLoading()
        }

        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.success) {
            resolve(res.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // 未登录/登录过期
          wx.removeStorageSync('token')
          wx.showToast({ title: '请重新登录', icon: 'none' })
          reject(res.data)
        } else {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
          reject(res)
        }
      },
      fail: function (err) {
        if (showLoading) {
          wx.hideLoading()
        }
        wx.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })
  })
}

// 快捷方法
const get = (url, data, options) => request({ url, method: 'GET', data, ...options })
const post = (url, data, options) => request({ url, method: 'POST', data, ...options })
const put = (url, data, options) => request({ url, method: 'PUT', data, ...options })
const del = (url, data, options) => request({ url, method: 'DELETE', data, ...options })

module.exports = {
  request,
  get,
  post,
  put,
  del
}
