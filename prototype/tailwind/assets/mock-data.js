window.noworkMock = {
  stats: {
    today: 1382,
    total: 196704,
    angerLevel: 2,
    angerLabel: '持续冒烟'
  },
  provinces: [
    { rank: 1, province: '广东 · 珠三角', count: 15892, percent: '12%', level: 3 },
    { rank: 2, province: '上海 · 浦东', count: 12604, percent: '9%', level: 3 },
    { rank: 3, province: '北京 · 朝阳', count: 11276, percent: '8%', level: 2 },
    { rank: 4, province: '浙江 · 杭州', count: 9842, percent: '7%', level: 2 },
    { rank: 5, province: '四川 · 成都', count: 8610, percent: '6%', level: 2 },
    { rank: 6, province: '湖北 · 武汉', count: 7423, percent: '5%', level: 2 },
    { rank: 7, province: '江苏 · 苏州', count: 6894, percent: '5%', level: 2 },
    { rank: 8, province: '陕西 · 西安', count: 5742, percent: '4%', level: 1 },
    { rank: 9, province: '山东 · 青岛', count: 5123, percent: '4%', level: 1 },
    { rank: 10, province: '重庆', count: 4865, percent: '3%', level: 1 }
  ],
  globals: [
    { rank: 1, country: 'United States', label: '反内卷联盟呼声最高', count: 24587 },
    { rank: 2, country: 'Japan', label: '加班文化深度焦虑', count: 18302 },
    { rank: 3, country: 'Singapore', label: '金融圈 KPI 洪水猛兽', count: 11927 },
    { rank: 4, country: 'Germany', label: '项目计划 + 严谨文化', count: 9106 }
  ],
  roles: [
    {
      key: 'boss',
      title: '老板 KPI 炸弹',
      description: '擅长画饼加立 Flag,最爱用一句"这个季度就看这次了"让全员血压飙升。',
      snippet: '"我就再提个小目标,这周冲到 200%。"',
      level: 3,
      icon: 'fa-user-tie',
      color: 'from-red-500 to-orange-500',
      badge: '🔥 最热'
    },
    {
      key: 'client',
      title: '甲方需求猎人',
      description: '一句"很简单"就想拔高七层楼,从概念到设计再到上线,人人都是产品经理。',
      snippet: '"这个版本顺便加个小功能,双十一前上线。"',
      level: 3,
      icon: 'fa-briefcase',
      color: 'from-orange-500 to-yellow-500',
      badge: '🔥 最热'
    },
    {
      key: 'pm',
      title: '产品经理神逻辑',
      description: '需求文档永远在改,原型永远有新版本,一句"参考微信"能让开发抓狂一整天。',
      snippet: '"这个需求很简单,就是做个抖音+微信+淘宝的结合体。"',
      level: 3,
      icon: 'fa-lightbulb',
      color: 'from-purple-500 to-pink-500',
      badge: '✨ 新增'
    },
    {
      key: 'hr',
      title: 'HR 套路大师',
      description: '招聘时说弹性工作制,入职后发现是随时加班制,离职时各种流程卡你三个月。',
      snippet: '"我们是扁平化管理,大家都是兄弟姐妹(就是没有加班费)。"',
      level: 2,
      icon: 'fa-user-group',
      color: 'from-blue-500 to-cyan-500',
      badge: '✨ 新增'
    },
    {
      key: 'colleague',
      title: '甩锅躺平同事',
      description: '白天摸鱼晚上甩锅,出了问题第一时间喊"不是我"的神秘角色。',
      snippet: '"Bug 是线上环境的问题,我这边没复现。"',
      level: 2,
      icon: 'fa-users',
      color: 'from-green-500 to-emerald-500',
      badge: ''
    },
    {
      key: 'customer',
      title: '客服地狱模式',
      description: '客户永远是对的,即使他要求 1+1=3,你也要微笑着解释为什么等于 2。',
      snippet: '"我不管,反正就是你们的问题,马上给我解决!"',
      level: 2,
      icon: 'fa-headset',
      color: 'from-teal-500 to-green-500',
      badge: '✨ 新增'
    },
    {
      key: 'ops',
      title: '运维背锅侠',
      description: '凌晨三点服务器告警,周末被紧急叫回公司,永远在救火永远在背锅。',
      snippet: '"又是谁在线上直接改配置没有备份的?!"',
      level: 2,
      icon: 'fa-server',
      color: 'from-slate-500 to-gray-500',
      badge: '✨ 新增'
    },
    {
      key: 'ddl',
      title: '永远紧逼的 DDL',
      description: '白天方案三连夜晚突发需求,日程像俄罗斯方块一样堆满。',
      snippet: '"老板说明天早上要看到 Demo。"',
      level: 1,
      icon: 'fa-clock',
      color: 'from-amber-500 to-orange-500',
      badge: ''
    },
    {
      key: 'designer',
      title: '设计师改稿噩梦',
      description: '客户要求大气、简约、炫酷还要有科技感,改了 20 版最后选了第一版。',
      snippet: '"能不能把 logo 放大再放大,要有那种高级感。"',
      level: 2,
      icon: 'fa-palette',
      color: 'from-pink-500 to-rose-500',
      badge: '✨ 新增'
    }
  ],
  phrases: {
    boss: [
      '老板说需求不大,今天下班前给个版本看看。',
      '能不能先上线,占个坑,后面慢慢优化?'
    ],
    client: [
      '我想要苹果官网那种感觉,顺便做个后台吧。',
      '这个按钮能不能再更有氛围一点?'
    ],
    colleague: [
      '线上挂了?你先重启下吧,我这边开会呢。',
      '我以为你已经搞定了,所以没动。'
    ],
    pm: [
      '这个功能改一下很快的,就是把微信和抖音结合一下。',
      '我觉得用户体验不够好,你再优化优化。'
    ],
    hr: [
      '我们公司福利特别好,有零食、咖啡,还能加班!',
      '离职需要提前一个月,而且要把所有工作交接完。'
    ],
    customer: [
      '你们这什么破服务,我要投诉!',
      '我不管,反正就是要退款,马上!'
    ],
    ops: [
      '谁又在生产环境测试了?数据库炸了!',
      '这个 Bug 不是我的锅,是开发没按规范来。'
    ],
    designer: [
      '甲方说这个红色不够红,要那种很红的红色。',
      '改了 50 稿,最后用了第一版。'
    ]
  }
};
