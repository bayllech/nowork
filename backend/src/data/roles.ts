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
  {
    key: 'desk-burner',
    title: '总监桌面燃烧者',
    description: '兼顾 KPI 与危机公关的打工人，随时在会议与文案之间切换火力模式。',
    quote: '“昨晚说好的方案，今早上线了没？”',
    icon: 'fa-solid fa-fire-flame-curved',
    colorFrom: 'from-orange-500',
    colorTo: 'to-rose-500',
    badge: '🔥 本周最炸',
    level: 3
  },
  {
    key: 'night-coder',
    title: '午夜缝纫工',
    description: '常驻夜班的开发者，Bug 与热修总能精准挑在凌晨爆发。',
    quote: '“我在日志里看到了你的许愿。”',
    icon: 'fa-solid fa-moon',
    colorFrom: 'from-indigo-500',
    colorTo: 'to-purple-500',
    badge: '🌙 夜班之王',
    level: 2
  },
  {
    key: 'ops-guard',
    title: '运维堡垒守卫者',
    description: '手握服务器生杀大权，白天巡检，晚上备份，周末还得随叫随到。',
    quote: '“别动，我先截个图留底。”',
    icon: 'fa-solid fa-shield-halved',
    colorFrom: 'from-emerald-500',
    colorTo: 'to-teal-500',
    level: 2
  },
  {
    key: 'client-tamer',
    title: '甲方驯兽师',
    description: '沟通、共情、还原需求，每一个改动都要转译成可执行的工单。',
    quote: '“刚和甲方同步完，他们又想改个小细节。”',
    icon: 'fa-solid fa-comments',
    colorFrom: 'from-sky-500',
    colorTo: 'to-cyan-500',
    badge: '💬 需求风暴',
    level: 1
  },
  {
    key: 'finance-hero',
    title: '报销通关勇者',
    description: '发票、凭证、审批链之间来回穿梭，必须在月底前保住大家的报销。',
    quote: '“这张外卖小票怎么只有一半？”',
    icon: 'fa-solid fa-receipt',
    colorFrom: 'from-amber-500',
    colorTo: 'to-yellow-400',
    level: 1
  },
  {
    key: 'call-center',
    title: '呼叫中心熔断员',
    description: '熟练掌握“抱歉久等”“帮您催促”的节奏，一天接通几百个怒火值 MAX 的投诉。',
    quote: '“请问可以留下您的工单号吗？”',
    icon: 'fa-solid fa-headset',
    colorFrom: 'from-pink-500',
    colorTo: 'to-fuchsia-500',
    level: 2
  },
  {
    key: 'logistics-runner',
    title: '仓储物流冲锋队',
    description: '临近大促还得守在仓库门口，流水线一停都会带来奔溃蝴蝶效应。',
    quote: '“刚装好的货又被退回二次验收。”',
    icon: 'fa-solid fa-truck-fast',
    colorFrom: 'from-slate-500',
    colorTo: 'to-slate-700',
    level: 1
  },
  {
    key: 'newbie',
    title: '初级打工体验官',
    description: '刚入职就碰上全年最忙周期，从入职培训直接投放战场。',
    quote: '“我先照着上个版本抄过来？”',
    icon: 'fa-solid fa-seedling',
    colorFrom: 'from-lime-500',
    colorTo: 'to-green-500',
    badge: '✨ 新晋怒气',
    level: 0
  }
];

