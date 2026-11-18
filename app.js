App({
  onLaunch: function () {
    // 初始化时获取用户模糊位置
    this.getLocation()
  },

  globalData: {
    userInfo: null,
    location: {
      name: '裕民路南苑六村',
      address: '上海市嘉定区裕民路480弄',
      latitude: 31.374,
      longitude: 121.253
    },
    stealthMode: false,
    isLoggedIn: false,
    selectedGender: 'boy',
    // 球友数据
    playersData: {
      ajie: {
        id: 'ajie',
        name: '阿杰',
        avatarText: '杰',
        avatarColor: '#1E293B',
        location: '嘉定紫藤园球场',
        activeTime: '2小时前活跃',
        style: '中式黑八',
        tags: ['☕ 娱乐休闲/欢乐局', '🤝 台费AA'],
        distance: '0.4km',
        status: 'idle',
        greetingSent: false,
        greetingMessage: '',
        greetingTime: '',
        wxId: '',
        latitude: 31.376,
        longitude: 121.256
      },
      xiaolin: {
        id: 'xiaolin',
        name: '小林',
        avatarText: '林',
        avatarColor: '#047857',
        location: '安亭市民体育中心',
        activeTime: '25分钟前活跃',
        style: '中式九球',
        tags: ['🔥 进阶玩家/有点准度', '🤝 台费AA'],
        distance: '0.8km',
        status: 'waiting',
        greetingSent: true,
        greetingMessage: 'Hello，我看你在附近，方便一起拼个台打几局吗？',
        greetingTime: '15分钟前发送 · 剩余23小时',
        wxId: '',
        latitude: 31.372,
        longitude: 121.248
      },
      fengge: {
        id: 'fengge',
        name: '峰哥',
        avatarText: '峰',
        avatarColor: '#1E3A8A',
        location: '远香湖球会',
        activeTime: '10分钟前活跃',
        style: '美式九球',
        tags: ['🔥 进阶玩家/有点准度', '🤝 台费AA'],
        distance: '1.2km',
        status: 'accepted',
        greetingSent: true,
        greetingMessage: '你好！想找个有强度的球友练练实战，有兴趣约一场吗？',
        greetingTime: '2小时前',
        wxId: 'fengge_billiards',
        latitude: 31.378,
        longitude: 121.260
      },
      chenjiaolian: {
        id: 'chenjiaolian',
        name: '陈教练',
        avatarText: '陈',
        avatarColor: '#4C1D95',
        location: '上海国际赛车场俱乐部',
        activeTime: '刚刚活跃',
        style: '斯诺克',
        tags: ['🏆 准清台/球房常客', '🤝 输家买单'],
        distance: '1.8km',
        status: 'declined',
        greetingSent: true,
        greetingMessage: '陈教练你好，请问今天下午在球房吗？方便切磋切磋吗？',
        greetingTime: '5小时前',
        wxId: '',
        latitude: 31.370,
        longitude: 121.245
      },
      laozhou: {
        id: 'laozhou',
        name: '老周',
        avatarText: '周',
        avatarColor: '#B45309',
        location: '嘉定体育馆桌球厅',
        activeTime: '昨天活跃',
        style: '中式黑八',
        tags: ['☕ 娱乐休闲/欢乐局', '🤝 台费AA'],
        distance: '2.3km',
        status: 'idle',
        greetingSent: false,
        greetingMessage: '',
        greetingTime: '',
        wxId: '',
        latitude: 31.375,
        longitude: 121.250
      }
    }
  },

  getLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.globalData.location.latitude = res.latitude
        that.globalData.location.longitude = res.longitude
      },
      fail: function () {
        // 定位失败时使用默认坐标（上海嘉定）
        console.log('定位失败，使用默认坐标')
      }
    })
  }
})
