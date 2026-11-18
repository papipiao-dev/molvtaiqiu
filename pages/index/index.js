// pages/index/index.js
const app = getApp()

Page({
  data: {
    // 导航栏相关
    statusBarHeight: 0,
    navBarHeight: 0,
    capsuleAreaWidth: 0,

    currentMode: 'map', // 'map' | 'list'
    locationName: '裕民路南苑六村',
    showLocationBanner: true,
    isLoggedIn: false,
    avatarText: '',

    // 地图相关
    mapCenterLat: 31.374,
    mapCenterLng: 121.253,
    mapScale: 15,
    mapMarkers: [],

    // 选中球友
    selectedPlayerId: '',
    selectedPlayer: null,

    // 球友列表
    playerList: [],

    // 打招呼弹窗
    showPhraseSheet: false,
    targetPlayerId: '',
    targetPlayerName: '',
    phraseOptions: [
      { emoji: '👋', text: 'Hello，我看你在附近，方便一起拼个台打几局吗？' },
      { emoji: '☕', text: '你好呀！一个人练球有点闷，看你也在附近，要不要找个时间凑一局？台费AA，纯娱乐交个朋友～' },
      { emoji: '🔥', text: '你好！想找个有强度的球友练练实战，赢家请喝水、输家付台费，有兴趣约一场吗？' },
      { emoji: '🤝', text: '球友你好！这周晚上有空来附近球房开一局吗？台费算我的，主要图个打球痛快、交个球友！' }
    ]
  },

  onLoad: function () {
    this.initNavBar()
    this.initData()
  },

  // 初始化自定义导航栏尺寸（与微信原生胶囊对齐）
  initNavBar: function () {
    try {
      var systemInfo = wx.getSystemInfoSync()
      var menuButton = wx.getMenuButtonBoundingClientRect()
      var statusBarHeight = systemInfo.statusBarHeight || 20
      // 导航栏内容区高度 = (胶囊顶部距离状态栏底部的间距) × 2 + 胶囊高度
      var navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
      // 胶囊区域总宽度（从胶囊左边缘到屏幕右边缘），用于标题居中
      var capsuleAreaWidth = systemInfo.windowWidth - menuButton.left

      this.setData({
        statusBarHeight: statusBarHeight,
        navBarHeight: navBarHeight,
        capsuleAreaWidth: capsuleAreaWidth
      })
    } catch (e) {
      // 兜底值
      this.setData({
        statusBarHeight: 20,
        navBarHeight: 44,
        capsuleAreaWidth: 80
      })
    }
  },

  onShow: function () {
    // 从位置选择页返回时更新位置
    var pages = getCurrentPages()
    var currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.data && currentPage.data.locationName) {
      // 位置已在 onLocationPickerResult 中处理
    }
  },

  // 初始化数据
  initData: function () {
    var playersData = app.globalData.playersData
    var playerList = []

    var keys = Object.keys(playersData)
    for (var i = 0; i < keys.length; i++) {
      var player = playersData[keys[i]]
      playerList.push(player)
    }

    this.setData({
      playerList: playerList
    })

    this.updateMarkers()
  },

  // 构建地图 markers（包含"我在这"标记 + 球友标记）
  updateMarkers: function () {
    var playersData = app.globalData.playersData
    var mapMarkers = []
    var stealthMode = app.globalData.stealthMode || false

    // 添加"我在这"标记（id: 0，墨绿色 #006c49），隐身模式下隐藏
    if (!stealthMode) {
      mapMarkers.push({
        id: 0,
        latitude: app.globalData.location.latitude,
        longitude: app.globalData.location.longitude,
        title: '我在这',
        width: 36,
        height: 36,
        anchor: { x: 0.5, y: 1 },
        callout: {
          content: '我在这',
          color: '#fff',
          fontSize: 11,
          borderRadius: 14,
          bgColor: '#006c49',
          padding: 6,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      })
    }

    // 添加球友 markers
    var keys = Object.keys(playersData)
    for (var i = 0; i < keys.length; i++) {
      var player = playersData[keys[i]]
      mapMarkers.push({
        id: i + 1,
        latitude: player.latitude,
        longitude: player.longitude,
        title: player.name,
        width: 40,
        height: 40,
        anchor: { x: 0.5, y: 1 },
        callout: {
          content: player.name,
          color: '#fff',
          fontSize: 12,
          borderRadius: 16,
          bgColor: '#07C160',
          padding: 8,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      })
    }

    this.setData({
      mapMarkers: mapMarkers
    })
  },

  // ==================== 模式切换 ====================
  onSwitchMap: function () {
    this.setData({ currentMode: 'map' })
  },

  onSwitchList: function () {
    this.setData({ currentMode: 'list' })
  },

  // ==================== 定位相关 ====================
  onLocationTap: function () {
    wx.navigateTo({
      url: '/pages/location-picker/index',
      events: {
        // 接收位置选择页回传的数据
        onLocationSelected: (data) => {
          this.setData({
            locationName: data.name
          })
          // 更新全局位置（包含 address）
          app.globalData.location.name = data.name
          app.globalData.location.address = data.address || ''
          app.globalData.location.latitude = data.latitude
          app.globalData.location.longitude = data.longitude
          // 更新地图中心
          this.setData({
            mapCenterLat: data.latitude,
            mapCenterLng: data.longitude
          })
          this.updateMarkers()
          wx.showToast({ title: '已切换位置：' + data.name, icon: 'none' })
        }
      }
    })
  },

  onEnableLocation: function () {
    var that = this
    wx.authorize({
      scope: 'scope.userLocation',
      success: function () {
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            app.globalData.location.latitude = res.latitude
            app.globalData.location.longitude = res.longitude
            that.setData({
              showLocationBanner: false,
              mapCenterLat: res.latitude,
              mapCenterLng: res.longitude
            })
            that.updateMarkers()
            wx.showToast({ title: '位置授权已获取', icon: 'success' })
          }
        })
      },
      fail: function () {
        wx.showModal({
          title: '需要位置授权',
          content: '请在设置中授权位置信息以发现附近球友',
          confirmText: '去设置',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  onDismissBanner: function () {
    this.setData({ showLocationBanner: false })
  },

  // ==================== 地图交互 ====================
  onMarkerTap: function (e) {
    var markerId = e.detail.markerId

    // 跳过"我在这"标记（id: 0）
    if (markerId === 0) return

    var playersData = app.globalData.playersData
    var keys = Object.keys(playersData)

    // 找到对应的球友（marker id 从 1 开始）
    var player = playersData[keys[markerId - 1]]
    if (player) {
      this.setData({
        selectedPlayerId: player.id,
        selectedPlayer: player
      })
    }
  },

  onMapBackgroundTap: function () {
    this.setData({
      selectedPlayerId: '',
      selectedPlayer: null
    })
  },

  onCloseMapCard: function () {
    this.setData({
      selectedPlayerId: '',
      selectedPlayer: null
    })
  },

  // ==================== 列表交互 ====================
  onCopyWx: function (e) {
    var wxId = e.currentTarget.dataset.wx
    wx.setClipboardData({
      data: wxId,
      success: function () {
        wx.showToast({ title: '微信号已复制，快去添加好友约球吧！', icon: 'none', duration: 2000 })
      }
    })
  },

  // ==================== 打招呼弹窗 ====================
  onOpenPhraseSheet: function (e) {
    var playerId = ''
    if (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) {
      playerId = e.currentTarget.dataset.id
    } else if (this.data.selectedPlayerId) {
      playerId = this.data.selectedPlayerId
    }

    var playersData = app.globalData.playersData
    var player = playersData[playerId]
    if (!player) return

    this.setData({
      showPhraseSheet: true,
      targetPlayerId: playerId,
      targetPlayerName: player.name
    })
  },

  onClosePhraseSheet: function () {
    this.setData({ showPhraseSheet: false })
  },

  onSendGreeting: function (e) {
    var phrase = e.currentTarget.dataset.phrase
    var playerId = this.data.targetPlayerId
    var playersData = app.globalData.playersData
    var player = playersData[playerId]

    if (!player) return

    // 更新球友状态
    player.greetingSent = true
    player.greetingMessage = phrase.text
    player.status = 'waiting'
    player.greetingTime = '刚刚发送 · 剩余24小时'

    // 更新列表数据
    var playerList = this.data.playerList
    for (var i = 0; i < playerList.length; i++) {
      if (playerList[i].id === playerId) {
        playerList[i] = player
        break
      }
    }

    // 更新选中的球友
    var selectedPlayer = this.data.selectedPlayer
    if (selectedPlayer && selectedPlayer.id === playerId) {
      selectedPlayer = player
    }

    this.setData({
      showPhraseSheet: false,
      playerList: playerList,
      selectedPlayer: selectedPlayer
    })

    wx.showToast({ title: '打招呼已发送', icon: 'success' })

    // 预留订阅消息钩子
    this.requestSubscribeMessage()
  },

  // 预留订阅消息钩子
  requestSubscribeMessage: function () {
    wx.requestSubscribeMessage({
      tmplIds: [''], // 替换为实际的模板 ID
      success: function (res) {
        console.log('订阅消息授权结果：', res)
      },
      fail: function (err) {
        console.log('订阅消息授权失败：', err)
      }
    })
  },

  // ==================== 个人资料入口 ====================
  onProfileTap: function () {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})
