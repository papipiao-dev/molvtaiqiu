// pages/location-picker/index.js
const app = getApp()
const env = require('../../config/env')

// 腾讯地图 API 地址
const SUGGESTION_URL = 'https://apis.map.qq.com/ws/place/v1/suggestion'
const GEOCODER_URL = 'https://apis.map.qq.com/ws/geocoder/v1/'

Page({
  data: {
    mapLat: 31.374,
    mapLng: 121.253,
    mapScale: 15,
    mapMarkers: [],
    searchKeyword: '',
    poiList: [],
    selectedPoiId: '',
    selectedPoiName: '正在获取位置...',
    selectedPoiAddress: '',
    selectedPoiLat: 0,
    selectedPoiLng: 0,
    isSearching: false,
    isReverseGeocoding: false,
    currentCity: '' // 当前城市（从逆地理编码中获取）
  },

  // 防抖定时器
  _searchTimer: null,

  onLoad: function () {
    this.initData()
  },

  initData: function () {
    var location = app.globalData.location
    if (location && location.latitude && location.longitude) {
      this.setData({
        mapLat: location.latitude,
        mapLng: location.longitude,
        selectedPoiLat: location.latitude,
        selectedPoiLng: location.longitude,
        selectedPoiName: location.name || '正在获取位置...'
      })
    } else {
      // 没有缓存位置，使用微信定位获取当前位置
      this.getCurrentLocation()
    }
    // 初始化时逆地理编码获取中心地址
    this.reverseGeocode(this.data.mapLat, this.data.mapLng)
  },

  // 获取当前定位
  getCurrentLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          mapLat: res.latitude,
          mapLng: res.longitude,
          selectedPoiLat: res.latitude,
          selectedPoiLng: res.longitude
        })
        // 更新全局位置
        app.globalData.location.latitude = res.latitude
        app.globalData.location.longitude = res.longitude
        // 逆地理编码
        that.reverseGeocode(res.latitude, res.longitude)
      },
      fail: function () {
        wx.showToast({ title: '定位失败，请手动选择', icon: 'none' })
        that.reverseGeocode(that.data.mapLat, that.data.mapLng)
      }
    })
  },

  // ==================== 逆地理编码（地图拖动后调用） ====================
  reverseGeocode: function (lat, lng) {
    var that = this
    that.setData({ isReverseGeocoding: true })

    console.log('[逆地理编码] 坐标:', lat, lng)

    wx.request({
      url: GEOCODER_URL,
      data: {
        location: lat + ',' + lng,
        get_poi: 1,
        poi_options: 'policy=2;radius=1000;page_size=20',
        key: env.tencentMapKey
      },
      success: function (res) {
        console.log('[逆地理编码] 响应:', res.data)
        if (res.data && res.data.status === 0) {
          var result = res.data.result
          var address = result.address || ''
          var formatted = result.formatted_addresses
            ? result.formatted_addresses.recommend
            : address

          // 提取当前城市（用于搜索 suggestion 的 region 参数）
          var city = ''
          if (result.addressComponent && result.addressComponent.city) {
            city = result.addressComponent.city
          }

          var poiList = []

          // 将逆地理编码返回的 POI 列表转为页面数据
          if (result.pois && result.pois.length > 0) {
            poiList = result.pois.map(function (poi, index) {
              return {
                id: 'poi-' + index,
                name: poi.title || '',
                address: poi.address || '',
                tag: index === 0 ? '当前位置' : '',
                latitude: poi.location.lat,
                longitude: poi.location.lng
              }
            })
          } else {
            // 没有 POI 时，用逆地理编码的地址作为默认项
            poiList = [{
              id: 'poi-0',
              name: formatted,
              address: address,
              tag: '当前位置',
              latitude: lat,
              longitude: lng
            }]
          }

          that.setData({
            currentCity: city,
            poiList: poiList,
            selectedPoiId: poiList[0].id,
            selectedPoiName: formatted,
            selectedPoiAddress: address,
            selectedPoiLat: lat,
            selectedPoiLng: lng,
            isReverseGeocoding: false
          })
        } else {
          that.setData({ isReverseGeocoding: false })
          console.error('逆地理编码失败:', res.data)
        }
      },
      fail: function (err) {
        that.setData({ isReverseGeocoding: false })
        console.error('逆地理编码请求失败:', err)
      }
    })
  },

  // ==================== 搜索（400ms 防抖） ====================
  onSearchInput: function (e) {
    var that = this
    var keyword = e.detail.value
    that.setData({ searchKeyword: keyword })

    // 清除上一次定时器
    if (that._searchTimer) {
      clearTimeout(that._searchTimer)
    }

    // 空关键词时恢复逆地理编码结果
    if (!keyword.trim()) {
      that.setData({ isSearching: false })
      that.reverseGeocode(that.data.mapLat, that.data.mapLng)
      return
    }

    // 400ms 防抖
    that._searchTimer = setTimeout(function () {
      that.searchSuggestion(keyword.trim())
    }, 400)
  },

  onSearchConfirm: function (e) {
    var keyword = e.detail.value
    if (!keyword.trim()) return

    // 清除防抖定时器，立即搜索
    if (this._searchTimer) {
      clearTimeout(this._searchTimer)
    }
    this.searchSuggestion(keyword.trim())
  },

  onClearSearch: function () {
    this.setData({ searchKeyword: '', isSearching: false })
    // 恢复地图中心逆地理编码
    this.reverseGeocode(this.data.mapLat, this.data.mapLng)
  },

  // 调用腾讯地图关键词建议 API
  searchSuggestion: function (keyword) {
    var that = this
    that.setData({ isSearching: true })

    // 使用动态城市，如果还没获取到城市则默认用"全国"
    var region = that.data.currentCity || '全国'

    console.log('[搜索] 关键词:', keyword, '城市:', region)

    wx.request({
      url: SUGGESTION_URL,
      data: {
        keyword: keyword,
        region: region,
        region_fix: 0,
        key: env.tencentMapKey
      },
      success: function (res) {
        console.log('[搜索] 响应:', res.data)
        if (res.data && res.data.status === 0) {
          var data = res.data.data || []
          var poiList = data.map(function (item, index) {
            return {
              id: 'search-' + index,
              name: item.title || '',
              address: item.address || '',
              tag: item.category || '',
              latitude: item.location ? item.location.lat : 0,
              longitude: item.location ? item.location.lng : 0
            }
          })
          that.setData({
            poiList: poiList,
            isSearching: false
          })
        } else {
          that.setData({ isSearching: false })
          console.error('[搜索] 关键词建议失败:', res.data)
          wx.showToast({ title: '搜索失败: ' + (res.data.message || '未知错误'), icon: 'none' })
        }
      },
      fail: function (err) {
        that.setData({ isSearching: false })
        console.error('[搜索] 请求失败:', err)
        wx.showToast({ title: '网络请求失败，请检查网络', icon: 'none' })
      }
    })
  },

  // ==================== POI 选择 ====================
  onSelectPoi: function (e) {
    var poiId = e.currentTarget.dataset.id
    var poi = this.data.poiList.find(function (item) { return item.id === poiId })
    if (!poi) return

    this.setData({
      selectedPoiId: poiId,
      selectedPoiName: poi.name,
      selectedPoiAddress: poi.address,
      selectedPoiLat: poi.latitude,
      selectedPoiLng: poi.longitude
    })

    // 如果是搜索结果，将地图移动到该 POI
    if (poi.latitude && poi.longitude) {
      this.setData({
        mapLat: poi.latitude,
        mapLng: poi.longitude
      })
    }
  },

  // ==================== 地图控制 ====================
  onRegionChange: function (e) {
    // 拖动/缩放结束时触发逆地理编码
    // 注意：微信小程序 bindregionchange 的 type 字段
    if (e.type === 'end' || e.detail && e.detail.type === 'end') {
      var that = this
      var mapCtx = wx.createMapContext('pickerMap', that)
      mapCtx.getCenterLocation({
        success: function (res) {
          that.setData({
            mapLat: res.latitude,
            mapLng: res.longitude
          })
          // 清除搜索状态，恢复逆地理编码
          if (!that.data.searchKeyword) {
            that.reverseGeocode(res.latitude, res.longitude)
          }
        },
        fail: function (err) {
          console.error('获取地图中心坐标失败:', err)
        }
      })
    }
  },

  onResetLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          mapLat: res.latitude,
          mapLng: res.longitude,
          searchKeyword: '',
          isSearching: false
        })
        that.reverseGeocode(res.latitude, res.longitude)
        wx.showToast({ title: '已定位到当前位置', icon: 'none' })
      },
      fail: function () {
        wx.showToast({ title: '定位失败', icon: 'none' })
      }
    })
  },

  onZoomIn: function () {
    var scale = this.data.mapScale
    if (scale < 18) {
      this.setData({ mapScale: scale + 1 })
    } else {
      wx.showToast({ title: '已放大至最大', icon: 'none' })
    }
  },

  onZoomOut: function () {
    var scale = this.data.mapScale
    if (scale > 3) {
      this.setData({ mapScale: scale - 1 })
    } else {
      wx.showToast({ title: '已缩小至最小', icon: 'none' })
    }
  },

  // ==================== 确认选择 ====================
  onConfirmLocation: function () {
    var that = this
    var name = that.data.selectedPoiName
    var address = that.data.selectedPoiAddress
    var latitude = that.data.selectedPoiLat
    var longitude = that.data.selectedPoiLng

    // 如果没有选中任何 POI，使用地图中心
    if (!name || name === '正在获取位置...') {
      wx.showToast({ title: '正在加载位置信息...', icon: 'none' })
      return
    }

    // 如果没有经纬度（纯搜索结果），使用地图中心坐标
    if (!latitude || !longitude) {
      latitude = that.data.mapLat
      longitude = that.data.mapLng
    }

    // 更新全局位置
    app.globalData.location.name = name
    app.globalData.location.address = address
    app.globalData.location.latitude = latitude
    app.globalData.location.longitude = longitude

    // 通过 eventChannel 回传给上一页
    var eventChannel = that.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.emit('onLocationSelected', {
        name: name,
        address: address,
        latitude: latitude,
        longitude: longitude
      })
    }

    wx.navigateBack()
  }
})
