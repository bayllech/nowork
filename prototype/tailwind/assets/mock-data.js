window.noworkMock = {
  stats: {
    today: 1382,
    total: 196704,
    angerLevel: 2,
    angerLabel: '气到抖腿'
  },
  provinces: [
    { rank: 1, province: '广东 · 深圳', count: 15892, percent: '12%', level: 3 },
    { rank: 2, province: '上海 · 浦东', count: 12604, percent: '9%', level: 2 },
    { rank: 3, province: '北京 · 海淀', count: 11276, percent: '8%', level: 2 },
    { rank: 4, province: '浙江 · 杭州', count: 9842, percent: '7%', level: 2 }
  ],
  globals: [
    { rank: 1, country: 'United States', label: '硅谷需求史诗级返工', count: 24587 },
    { rank: 2, country: 'Japan', label: '加班到末班车是常态', count: 18302 },
    { rank: 3, country: 'Singapore', label: '金融圈 KPI 季冲刺', count: 11927 },
    { rank: 4, country: 'Germany', label: '项目延误 + 会议爆棚', count: 9106 }
  ],
  roles: [
    {
      key: 'client',
      title: '甲方又提需求',
      description: '“改成更年轻、活泼、科技一点”——每一句都在挑战理智。',
      snippet: '刚上线的版本又要推翻？那我们是迭代机器吗？',
      level: 2
    },
    {
      key: 'boss',
      title: '老板 KPI 轰炸',
      description: '周报写成小说、会议开成脱口秀，怒气值+++。',
      snippet: '老板说“这个不急”，结果半小时后问上线没。',
      level: 3
    },
    {
      key: 'colleague',
      title: '同事摸鱼甩锅',
      snippet: '一个“帮忙看看”直接演化成通宵修 Bug。 ',
      description: '你负责我的 Bug，我负责你的 KPI —— 合作模式新高度。',
      level: 2
    },
    {
      key: 'ddl',
      title: '通宵赶 DDL',
      snippet: '凌晨三点的工位灯和没喝完的咖啡，懂得都懂。',
      description: '加班当饭吃，代码当枕头，梦里都在赶工。',
      level: 1
    }
  ],
  phrases: {
    boss: [
      '老板说：“这个需求不急，今天下班前给我。”—— 我：这是新的时间单位吗？',
      '周会从早开到晚，灵感从满格变掉线。'
    ]
  }
};
