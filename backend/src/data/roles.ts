export interface RoleDefinition {
  key: string;
  title: string;
  description: string;
  quote: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  badge?: string;
  level: number;
}

export const roleDefinitions: RoleDefinition[] = [
  // 老板系列
  {
    key: 'shabi-boss',
    title: '傻X老板',
    description: '天天画大饼，工资不见涨，加班第一名',
    quote: '又来了？今天又要"紧急"开会？',
    icon: 'fa-solid fa-crown',
    colorFrom: 'from-red-600',
    colorTo: 'to-red-800',
    badge: '🔥 本周最炸',
    level: 5
  },
  {
    key: 'huabi-king',
    title: '画饼大王',
    description: 'PPT做得好，不如饼画得圆',
    quote: '年轻人要有格局，这个项目做好了公司不会亏待你的',
    icon: 'fa-solid fa-chart-pie',
    colorFrom: 'from-orange-600',
    colorTo: 'to-orange-800',
    level: 4
  },
  {
    key: 'meeting-nazi',
    title: '会议纳粹',
    description: '没有什么是开会解决不了的，如果有，就再开一个',
    quote: '我们现在开个短会，就10分钟',
    icon: 'fa-solid fa-users',
    colorFrom: 'from-yellow-600',
    colorTo: 'to-yellow-800',
    level: 4
  },
  {
    key: 'weekend-hell',
    title: '周末恶魔',
    description: '你的周末就是他的工作日',
    quote: '小王啊，周六过来加个班，有个东西很急',
    icon: 'fa-solid fa-calendar-times',
    colorFrom: 'from-red-700',
    colorTo: 'to-red-900',
    badge: '🔥 本周最炸',
    level: 5
  },

  // 客户系列
  {
    key: 'chishi-client',
    title: '吃💩客户',
    description: '预算要小米，效果要苹果，态度像大爷',
    quote: '你这个logo再放大一点，同时再缩小一点',
    icon: 'fa-solid fa-poo',
    colorFrom: 'from-purple-700',
    colorTo: 'to-purple-900',
    level: 4
  },
  {
    key: 'yidui-zhongyi',
    title: '一堆中意',
    description: '我也不知道要什么，但你给我做一百个方案看看',
    quote: '我想要一种高端大气上档次的感觉',
    icon: 'fa-solid fa-gavel',
    colorFrom: 'from-violet-600',
    colorTo: 'to-violet-800',
    level: 4
  },
  {
    key: 'weikong-dashi',
    title: '微信大师',
    description: '半夜3点发消息，早上6点打电话',
    quote: '在吗？睡了吗？那个东西明天早上要',
    icon: 'fa-brands fa-weixin',
    colorFrom: 'from-green-600',
    colorTo: 'to-green-800',
    level: 3
  },
  {
    key: 'bujia-zhuanjia',
    title: '砍价专家',
    description: '一分钱一分货？不，我要一块钱买十块钱的货',
    quote: '你们同行报价比你低一半',
    icon: 'fa-solid fa-scissors',
    colorFrom: 'from-amber-600',
    colorTo: 'to-amber-800',
    level: 3
  },

  // 同事系列
  {
    key: 'tongshi-feiren',
    title: '同事不是人',
    description: '甩锅第一名，邀功第一名，摸鱼也第一名',
    quote: '这个锅你来背一下，下次我请你吃饭',
    icon: 'fa-solid fa-user-ninja',
    colorFrom: 'from-cyan-600',
    colorTo: 'to-cyan-800',
    badge: '🔥 本周最炸',
    level: 5
  },
  {
    key: 'shua-gou-dashi',
    title: '甩锅大师',
    description: '锅从天上来，甩给别人去',
    quote: '这个不是我负责的，是小王做的',
    icon: 'fa-solid fa-hands',
    colorFrom: 'from-indigo-600',
    colorTo: 'to-indigo-800',
    level: 4
  },
  {
    key: 'mo-yu-wang',
    title: '摸鱼之王',
    description: '上班一条虫，下班一条龙',
    quote: '摸鱼才是工作的本质',
    icon: 'fa-solid fa-fish',
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-700',
    level: 3
  },
  {
    key: 'report-xiaoren',
    title: '报告小人',
    description: '领导不在他是领导，领导在他是狗腿子',
    quote: '老板，我觉得小王今天上班摸鱼了',
    icon: 'fa-solid fa-snake',
    colorFrom: 'from-lime-600',
    colorTo: 'to-lime-800',
    level: 3
  },

  // 产品/运营系列
  {
    key: 'xuqiu-gou',
    title: '需求狗',
    description: '需求改改改，上线遥遥无期',
    quote: '我就改一个小小的地方',
    icon: 'fa-solid fa-dog',
    colorFrom: 'from-orange-500',
    colorTo: 'to-orange-700',
    level: 3
  },
  {
    key: 'deadline-zhainan',
    title: 'DDL宅男',
    description: 'deadline才是第一生产力',
    quote: '今天必须上线！',
    icon: 'fa-solid fa-clock',
    colorFrom: 'from-pink-600',
    colorTo: 'to-pink-800',
    badge: '💢 紧急',
    level: 4
  },

  // 其他系列
  {
    key: 'it-xiaobai',
    title: 'IT小白',
    description: '鼠标不会双击，重启不会关机',
    quote: '我电脑打不开了，帮我看看',
    icon: 'fa-solid fa-desktop',
    colorFrom: 'from-sky-500',
    colorTo: 'to-sky-700',
    level: 2
  },
  {
    key: 'renli-zhangsan',
    title: '人事张三',
    description: '制度我说了算，福利公司说了算',
    quote: '这是公司规定',
    icon: 'fa-solid fa-id-card',
    colorFrom: 'from-red-500',
    colorTo: 'to-red-700',
    level: 3
  },
  {
    key: 'caiwu-lisi',
    title: '财务李四',
    description: '发票没有不行，预算超了不行',
    quote: '这个单子不合规，不能报',
    icon: 'fa-solid fa-calculator',
    colorFrom: 'from-green-600',
    colorTo: 'to-green-800',
    level: 3
  }
];