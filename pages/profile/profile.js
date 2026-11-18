// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    nickname: '未登录球友',
    loginStatus: '未登录',
    avatarText: '',
    avatarBgColor: '#f1f5f9',
    selectedGender: 'boy',

    // 常玩项目
    gameOptions: [
      { name: '中式黑八', selected: true },
      { name: '中式九球', selected: true },
      { name: '美式九球', selected: false },
      { name: '斯诺克', selected: false },
      { name: '美式普尔', selected: false },
      { name: '花式撞球', selected: false }
    ],
    selectedGames: ['中式黑八', '中式九球'],

    // 实力段位
    currentLevel: '进阶玩家/有准度',
    levelSubText: '一杆连进3~5球',
    levelOptions: [
      { name: '纯萌新/体验派', sub: '一杆连进1~2球' },
      { name: '娱乐休闲/欢乐局', sub: '一杆连进2~3球' },
      { name: '进阶玩家/有准度', sub: '一杆连进3~5球' },
      { name: '大神级/炸清选手', sub: '经常一杆清台（炸清/接清）' }
    ],

    // 台费分摊规则
    currentSplit: '台费AA',
    splitSubText: '平摊台费，轻松无负担',
    splitOptions: [
      { name: '台费AA', sub: '平摊台费，轻松无负担', emoji: '🤝' },
      { name: '我付台费', sub: '豪爽请客，来打球痛快为主', emoji: '💳' },
      { name: '输家买单', sub: '切磋较量，胜负定台费归属', emoji: '🎯' }
    ],

    // 隐私
    stealthMode: false,

    // 弹窗状态
    showAvatarSheet: false,
    showLevelSheet: false,
    showSplitSheet: false
  },

  onLoad: function () {
    // 读取全局状态
    var globalData = app.globalData
    this.setData({
      isLoggedIn: globalData.isLoggedIn,
      selectedGender: globalData.selectedGender,
      stealthMode: globalData.stealthMode
    })

    if (globalData.isLoggedIn) {
      this.updateAvatarDisplay(globalData.selectedGender)
    }
  },

  // ==================== 头像相关 ====================
  onAvatarTap: function () {
    if (this.data.isLoggedIn) {
      this.setData({ showAvatarSheet: true })
    } else {
      // 未登录时先模拟登录
      this.setData({
        isLoggedIn: true,
        nickname: this.data.selectedGender === 'boy' ? '冷酷准神' : '元气台球妹',
        loginStatus: '已登录'
      })
      app.globalData.isLoggedIn = true
      this.setData({ showAvatarSheet: true })
    }
  },

  onSelectGender: function (e) {
    var gender = e.currentTarget.dataset.gender
    this.setData({ selectedGender: gender })
  },

  onConfirmAvatar: function () {
    var gender = this.data.selectedGender
    app.globalData.isLoggedIn = true
    app.globalData.selectedGender = gender

    this.updateAvatarDisplay(gender)

    this.setData({
      showAvatarSheet: false,
      isLoggedIn: true,
      nickname: gender === 'boy' ? '冷酷准神' : '元气台球妹',
      loginStatus: '已登录'
    })

    wx.showToast({ title: '头像设置成功！', icon: 'success' })
  },

  updateAvatarDisplay: function (gender) {
    if (gender === 'boy') {
      this.setData({
        avatarText: '杰',
        avatarBgColor: '#1E293B'
      })
    } else {
      this.setData({
        avatarText: '琳',
        avatarBgColor: '#F43F5E'
      })
    }
  },

  onCloseAvatarSheet: function () {
    this.setData({ showAvatarSheet: false })
  },

  // ==================== 常玩项目 ====================
  onToggleGame: function (e) {
    var name = e.currentTarget.dataset.name
    var gameOptions = this.data.gameOptions
    var selectedGames = this.data.selectedGames.slice()

    var targetIndex = -1
    for (var i = 0; i < gameOptions.length; i++) {
      if (gameOptions[i].name === name) {
        targetIndex = i
        break
      }
    }
    if (targetIndex === -1) return

    var isSelected = gameOptions[targetIndex].selected

    if (isSelected) {
      // 取消选中：至少保留 1 项
      if (selectedGames.length <= 1) {
        wx.showToast({ title: '至少保留1个常玩项目', icon: 'none' })
        return
      }
      gameOptions[targetIndex].selected = false
      var removeIdx = selectedGames.indexOf(name)
      if (removeIdx > -1) selectedGames.splice(removeIdx, 1)
    } else {
      gameOptions[targetIndex].selected = true
      selectedGames.push(name)
    }

    this.setData({
      gameOptions: gameOptions,
      selectedGames: selectedGames
    })
  },

  // ==================== 实力段位 ====================
  onOpenLevelSheet: function () {
    this.setData({ showLevelSheet: true })
  },

  onCloseLevelSheet: function () {
    this.setData({ showLevelSheet: false })
  },

  onChooseLevel: function (e) {
    var name = e.currentTarget.dataset.name
    var sub = e.currentTarget.dataset.sub

    this.setData({
      currentLevel: name,
      levelSubText: sub,
      showLevelSheet: false
    })

    wx.showToast({ title: '实力段位已更新：' + name, icon: 'none' })
  },

  // ==================== 台费分摊规则 ====================
  onOpenSplitSheet: function () {
    this.setData({ showSplitSheet: true })
  },

  onCloseSplitSheet: function () {
    this.setData({ showSplitSheet: false })
  },

  onChooseSplit: function (e) {
    var name = e.currentTarget.dataset.name
    var sub = e.currentTarget.dataset.sub

    this.setData({
      currentSplit: name,
      splitSubText: sub,
      showSplitSheet: false
    })

    wx.showToast({ title: '台费规则已更新：' + name, icon: 'none' })
  },

  // ==================== 隐身模式 ====================
  onToggleStealth: function () {
    var stealthMode = !this.data.stealthMode
    this.setData({ stealthMode: stealthMode })
    app.globalData.stealthMode = stealthMode

    wx.showToast({
      title: stealthMode ? '地图隐身模式已开启' : '地图隐身模式已关闭',
      icon: 'none'
    })
  }
})
