// ============================================
// 评估框架 - 数据结构和配置
// ============================================

// 问题类型定义
export type QuestionType = 'single' | 'multiple' | 'rating' | 'text';

// 选项类型
export interface Option {
  value: string;
  label: string;
  score?: number;
  description?: string;
  icon?: string;
}

// 问题定义
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: Option[];
  min?: number;
  max?: number;
  required: boolean;
}

// 评估类型
export type AssessmentType = 'capability' | 'inventory' | 'interest' | 'growth';

// 评估配置
export interface AssessmentConfig {
  id: AssessmentType;
  title: string;
  description: string;
  emoji: string;
  estimatedTime: string;
  questions: Question[];
  calculateScore: (answers: Record<string, any>) => AssessmentResult;
}

// 评估结果
export interface AssessmentResult {
  score: number;
  maxScore: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  levelName: string;
  recommendations: Recommendation[];
}

// 推荐项
export interface Recommendation {
  type: 'market' | 'platform' | 'category' | 'action';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
}

// ============================================
// 1. 个人能力照妖镜配置
// ============================================

export const CAPABILITY_ASSESSMENT: AssessmentConfig = {
  id: 'capability',
  title: '个人能力照妖镜',
  description: '5分钟快速评估，发现你的跨境电商优势与短板',
  emoji: '🪞',
  estimatedTime: '5分钟',
  questions: [
    {
      id: 'experience',
      type: 'single',
      question: '你的跨境电商经验？',
      description: '选择最符合你当前情况的选项',
      options: [
        { value: 'none', label: '完全新手，刚开始了解', score: 0 },
        { value: 'learning', label: '正在学习，尚未开始实操', score: 2 },
        { value: 'started', label: '已开始尝试，有1-3个月经验', score: 4 },
        { value: 'experienced', label: '有6个月以上实操经验', score: 6 },
        { value: 'expert', label: '1年以上成功运营经验', score: 8 },
      ],
      required: true,
    },
    {
      id: 'time',
      type: 'single',
      question: '每周可投入多少时间？',
      options: [
        { value: 'part-time', label: '业余时间（1-10小时/周）', score: 2 },
        { value: 'half-time', label: '半职状态（10-20小时/周）', score: 4 },
        { value: 'full-time', label: '全职投入（20-40小时/周）', score: 6 },
        { value: 'all-in', label: '全力投入（40+小时/周）', score: 8 },
      ],
      required: true,
    },
    {
      id: 'capital',
      type: 'single',
      question: '你的启动资金预算？',
      options: [
        { value: 'micro', label: '小额（1万以下）', score: 1 },
        { value: 'small', label: '小规模（1-5万）', score: 3 },
        { value: 'medium', label: '中等（5-20万）', score: 5 },
        { value: 'large', label: '充足（20万以上）', score: 7 },
      ],
      required: true,
    },
    {
      id: 'language',
      type: 'multiple',
      question: '你掌握的语言？（可多选）',
      options: [
        { value: 'chinese', label: '中文（母语）', score: 0 },
        { value: 'english', label: '英语（可交流）', score: 3 },
        { value: 'thai', label: '泰语', score: 4 },
        { value: 'vietnamese', label: '越南语', score: 4 },
        { value: 'spanish', label: '西班牙语', score: 4 },
        { value: 'portuguese', label: '葡萄牙语', score: 4 },
      ],
      required: true,
    },
  ],
  calculateScore: (answers) => {
    let score = 0;

    // 经验分数
    score += answers.experience?.score || 0;

    // 时间分数
    score += answers.time?.score || 0;

    // 资金分数
    score += answers.capital?.score || 0;

    // 语言分数（取最高一项）
    if (Array.isArray(answers.language)) {
      const langScores = answers.language.map((l: any) => l.score || 0);
      score += Math.max(...langScores);
    }

    // 确定等级
    let level: AssessmentResult['level'];
    let levelName: string;
    let recommendations: Recommendation[];

    if (score <= 7) {
      level = 'beginner';
      levelName = '新手创业者';
      recommendations = [
        { type: 'market', title: '东南亚市场', description: '从泰国、越南开始，门槛较低', priority: 'high', icon: '🌏' },
        { type: 'platform', title: 'Shopee', description: '平台友好，适合新手入门', priority: 'high', icon: '🛒' },
        { type: 'category', title: '轻量级品类', description: '美妆、小饰品、家居用品', priority: 'medium', icon: '📦' },
        { type: 'action', title: '学习基础知识', description: '先花1-2周了解平台规则和选品方法', priority: 'high', icon: '📚' },
      ];
    } else if (score <= 14) {
      level = 'intermediate';
      levelName = '进阶卖家';
      recommendations = [
        { type: 'market', title: '东南亚+拉美', description: '拓展到第二个市场，分散风险', priority: 'high', icon: '🌏' },
        { type: 'platform', title: '多平台策略', description: 'Shopee + Lazada + 本地平台', priority: 'medium', icon: '🛒' },
        { type: 'category', title: '利润优化品类', description: '根据数据分析选择高利润品类', priority: 'medium', icon: '📦' },
        { type: 'action', title: '建立运营体系', description: '标准化流程，考虑小团队协作', priority: 'high', icon: '⚙️' },
      ];
    } else if (score <= 21) {
      level = 'advanced';
      levelName = '专业运营者';
      recommendations = [
        { type: 'market', title: '欧美市场', description: '挑战高价值市场，Amazon/Shopify', priority: 'high', icon: '🇺🇸' },
        { type: 'platform', title: '独立站+平台', description: '品牌化路线，建立私域流量', priority: 'medium', icon: '🌐' },
        { type: 'category', title: '自有品牌产品', description: '从选品转向产品开发', priority: 'high', icon: '🏷️' },
        { type: 'action', title: '团队扩张', description: '组建专业团队，分工协作', priority: 'high', icon: '👥' },
      ];
    } else {
      level = 'expert';
      levelName = '跨境电商专家';
      recommendations = [
        { type: 'market', title: '全球布局', description: '根据实际情况定制全球战略', priority: 'high', icon: '🌍' },
        { type: 'platform', title: '全渠道策略', description: '平台+独立站+社交媒体全覆盖', priority: 'medium', icon: '📱' },
        { type: 'category', title: '品类创新', description: '开创全新品类或细分市场', priority: 'high', icon: '💡' },
        { type: 'action', title: '资本化运作', description: '融资、并购、建立生态', priority: 'medium', icon: '💰' },
      ];
    }

    return { score, maxScore: 30, level, levelName, recommendations };
  },
};

// ============================================
// 2. 资源盘点配置
// ============================================

export const INVENTORY_ASSESSMENT: AssessmentConfig = {
  id: 'inventory',
  title: '资源盘点',
  description: '清点你的创业弹药库，看看你手里有什么牌',
  emoji: '📦',
  estimatedTime: '10分钟',
  questions: [
    {
      id: 'supply_chain',
      type: 'single',
      question: '供应链资源如何？',
      options: [
        { value: 'none', label: '没有供应链资源', score: 0 },
        { value: 'limited', label: '有少量厂家联系方式', score: 2 },
        { value: 'good', label: '有稳定的供货渠道', score: 5 },
        { value: 'excellent', label: '自有工厂或深度合作', score: 8 },
      ],
      required: true,
    },
    {
      id: 'logistics',
      type: 'single',
      question: '物流资源如何？',
      options: [
        { value: 'none', label: '完全依赖平台物流', score: 0 },
        { value: 'basic', label: '了解基本物流渠道', score: 2 },
        { value: 'partnership', label: '有物流合作伙伴', score: 5 },
        { value: 'warehouse', label: '有海外仓或自建物流', score: 8 },
      ],
      required: true,
    },
    {
      id: 'funding',
      type: 'single',
      question: '资金实力如何？',
      options: [
        { value: 'tight', label: '紧张，需要精打细算', score: 1 },
        { value: 'adequate', label: '够用，可以正常运营', score: 3 },
        { value: 'strong', label: '充足，可以快速扩张', score: 6 },
        { value: 'abundant', label: '非常充足，可大投入', score: 8 },
      ],
      required: true,
    },
    {
      id: 'overseas',
      type: 'single',
      question: '海外关系如何？',
      options: [
        { value: 'none', label: '没有海外关系', score: 0 },
        { value: 'friends', label: '有海外朋友或同学', score: 2 },
        { value: 'partners', label: '有海外合作伙伴', score: 5 },
        { value: 'network', label: '有完整的海外网络', score: 8 },
      ],
      required: true,
    },
  ],
  calculateScore: (answers) => {
    let score = 0;
    score += answers.supply_chain?.score || 0;
    score += answers.logistics?.score || 0;
    score += answers.funding?.score || 0;
    score += answers.overseas?.score || 0;

    let level: AssessmentResult['level'];
    let levelName: string;
    let recommendations: Recommendation[];

    if (score <= 8) {
      level = 'beginner';
      levelName = '轻量级起步';
      recommendations = [
        { type: 'action', title: 'Dropshipping模式', description: '零库存模式，专注营销', priority: 'high', icon: '📦' },
        { type: 'category', title: '数字产品', description: '虚拟商品、在线服务等无需物流', priority: 'high', icon: '💻' },
        { type: 'platform', title: '平台 Fulfillment', description: '使用FBA、Shopee Fulfillment等', priority: 'medium', icon: '🛒' },
        { type: 'market', title: '从东南亚开始', description: '物流门槛相对较低', priority: 'medium', icon: '🌏' },
      ];
    } else if (score <= 16) {
      level = 'intermediate';
      levelName = '稳健发展';
      recommendations = [
        { type: 'action', title: '小库存试水', description: '从少量库存开始测试市场', priority: 'high', icon: '📦' },
        { type: 'category', title: '标准化产品', description: '选择易于存储和运输的产品', priority: 'medium', icon: '📦' },
        { type: 'platform', title: '第三方物流', description: '与靠谱的物流服务商合作', priority: 'high', icon: '🚚' },
        { type: 'market', title: '东南亚+拉美', description: '两个市场分散风险', priority: 'medium', icon: '🌍' },
      ];
    } else {
      level = 'advanced';
      levelName = '资源优势';
      recommendations = [
        { type: 'action', title: '自有品牌', description: '资源充足时可考虑品牌化', priority: 'high', icon: '🏷️' },
        { type: 'category', title: '优势品类', description: '利用供应链优势选择品类', priority: 'high', icon: '📦' },
        { type: 'platform', title: '海外仓布局', description: '提前布局海外仓储', priority: 'medium', icon: '🏭' },
        { type: 'market', title: '多市场并行', description: '资源足够可同时进入多个市场', priority: 'medium', icon: '🌍' },
      ];
    }

    return { score, maxScore: 32, level, levelName, recommendations };
  },
};

// ============================================
// 3. 兴趣推荐配置
// ============================================

export const INTEREST_ASSESSMENT: AssessmentConfig = {
  id: 'interest',
  title: '兴趣到哪里去看看',
  description: '跟着兴趣探索市场，看看哪个市场适合你',
  emoji: '🧭',
  estimatedTime: '8分钟',
  questions: [
    {
      id: 'interests',
      type: 'multiple',
      question: '你对哪些品类感兴趣？（可多选）',
      description: '选择你感兴趣或有经验的品类',
      options: [
        { value: 'beauty', label: '美妆护肤', icon: '💄' },
        { value: 'fashion', label: '服饰鞋包', icon: '👗' },
        { value: 'electronics', label: '3C数码', icon: '📱' },
        { value: 'home', label: '家居用品', icon: '🏠' },
        { value: 'food', label: '食品饮料', icon: '🍜' },
        { value: 'sports', label: '运动户外', icon: '⚽' },
        { value: 'pets', label: '宠物用品', icon: '🐕' },
        { value: 'kids', label: '母婴用品', icon: '👶' },
        { value: 'health', label: '保健医疗', icon: '💊' },
        { value: 'hobbies', label: '爱好收藏', icon: '🎮' },
      ],
      required: true,
    },
    {
      id: 'market_preference',
      type: 'single',
      question: '你更倾向于哪个市场？',
      options: [
        { value: 'sea', label: '东南亚', description: '文化相近，物流便利', icon: '🌏' },
        { value: 'na', label: '欧美', description: '高消费能力，利润空间大', icon: '🇺🇸' },
        { value: 'la', label: '拉美', description: '新兴市场，竞争较小', icon: '🇧🇷' },
        { value: 'unsure', label: '不确定，需要推荐', icon: '🤔' },
      ],
      required: true,
    },
  ],
  calculateScore: (answers) => {
    const interests = Array.isArray(answers.interests) ? answers.interests : [];
    const marketPref = answers.market_preference?.value || 'unsure';

    // 兴趣与市场匹配逻辑
    const recommendations: Recommendation[] = [];

    // 基于兴趣的品类推荐
    const interestMap: Record<string, { category: string; market: string; priority: string }> = {
      beauty: { category: '美妆护肤', market: '东南亚 (女性用户多)', priority: 'high' },
      fashion: { category: '服饰鞋包', market: '东南亚 (气候相关)', priority: 'high' },
      electronics: { category: '3C数码', market: '东南亚 (价格敏感)', priority: 'medium' },
      home: { category: '家居用品', market: '拉美 (家庭文化)', priority: 'high' },
      food: { category: '食品饮料', market: '东南亚 (饮食文化)', priority: 'medium' },
      sports: { category: '运动户外', market: '拉美 (足球文化)', priority: 'high' },
      pets: { category: '宠物用品', market: '欧美 (宠物经济)', priority: 'high' },
      kids: { category: '母婴用品', market: '东南亚 (家庭市场)', priority: 'medium' },
      health: { category: '保健医疗', market: '欧美 (健康意识)', priority: 'high' },
      hobbies: { category: '爱好收藏', market: '欧美 (消费能力)', priority: 'medium' },
    };

    interests.forEach((interest: any) => {
      const match = interestMap[interest.value];
      if (match) {
        recommendations.push({
          type: 'category',
          title: match.category,
          description: `推荐市场: ${match.market}`,
          priority: match.priority as any,
          icon: interest.icon,
        });
      }
    });

    // 基于市场偏好的推荐
    if (marketPref !== 'unsure') {
      const marketInfo: Record<string, { name: string; description: string }> = {
        sea: { name: '东南亚', description: '泰国、越南、马来西亚等，文化相近，入门首选' },
        na: { name: '欧美', description: '美国、加拿大，高消费能力但竞争激烈' },
        la: { name: '拉美', description: '巴西、墨西哥，新兴市场蓝海机会' },
      };
      const info = marketInfo[marketPref];
      recommendations.unshift({
        type: 'market',
        title: info.name,
        description: info.description,
        priority: 'high',
      });
    }

    // 添加通用推荐
    recommendations.push({
      type: 'action',
      title: '小批量试测',
      description: '选择感兴趣的品类，从小批量开始验证市场',
      priority: 'high',
      icon: '🧪',
    });

    const score = interests.length * 2 + (marketPref !== 'unsure' ? 5 : 0);

    return {
      score,
      maxScore: 25,
      level: score >= 15 ? 'intermediate' : 'beginner',
      levelName: '兴趣驱动型',
      recommendations,
    };
  },
};

// ============================================
// 4. 成长路径配置
// ============================================

export const GROWTH_STAGES = [
  { id: 'stage_1', title: '了解跨境电商', description: '学习基础知识', emoji: '📚', estimatedDays: 7 },
  { id: 'stage_2', title: '选择目标市场', description: '确定进入哪个市场', emoji: '🎯', estimatedDays: 3 },
  { id: 'stage_3', title: '选择销售平台', description: 'Shopee/Lazada等', emoji: '🛒', estimatedDays: 5 },
  { id: 'stage_4', title: '完成店铺注册', description: '准备资料并开店', emoji: '📝', estimatedDays: 3 },
  { id: 'stage_5', title: '学习选品方法', description: '研究热销品', emoji: '🔍', estimatedDays: 7 },
  { id: 'stage_6', title: '寻找供应商', description: '联系货源', emoji: '📦', estimatedDays: 7 },
  { id: 'stage_7', title: '上架首批商品', description: '优化商品详情', emoji: '🏷️', estimatedDays: 5 },
  { id: 'stage_8', title: '设置营销策略', description: '优惠券/广告', emoji: '📢', estimatedDays: 3 },
  { id: 'stage_9', title: '处理首笔订单', description: '完成完整交易流程', emoji: '🎉', estimatedDays: 1 },
  { id: 'stage_10', title: '优化运营流程', description: '提升效率', emoji: '⚙️', estimatedDays: 7 },
  { id: 'stage_11', title: '扩张产品线', description: '增加SKU', emoji: '📈', estimatedDays: 14 },
  { id: 'stage_12', title: '考虑多平台/多市场', description: '规模化发展', emoji: '🚀', estimatedDays: 30 },
];

// localStorage键名
export const PROGRESS_STORAGE_KEY = 'zenconsult_growth_progress';

// 获取成长进度
export function getGrowthProgress(): Record<string, { completed: boolean; completedAt?: string }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// 保存成长进度
export function saveGrowthProgress(stageId: string, completed: boolean) {
  if (typeof window === 'undefined') return;
  const progress = getGrowthProgress();
  progress[stageId] = {
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  };
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

// 计算总体进度
export function getGrowthProgressPercentage(): number {
  const progress = getGrowthProgress();
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  return Math.round((completedCount / GROWTH_STAGES.length) * 100);
}

// ============================================
// 导出所有评估配置
// ============================================

export const ASSESSMENTS: Record<AssessmentType, AssessmentConfig> = {
  capability: CAPABILITY_ASSESSMENT,
  inventory: INVENTORY_ASSESSMENT,
  interest: INTEREST_ASSESSMENT,
  growth: {
    id: 'growth',
    title: '跨境电商业主养成记',
    description: '从小白到卖家的12阶段成长地图',
    emoji: '📖',
    estimatedTime: '60-90天',
    questions: [],
    calculateScore: () => ({
      score: getGrowthProgressPercentage(),
      maxScore: 100,
      level: getGrowthProgressPercentage() >= 80 ? 'advanced' : getGrowthProgressPercentage() >= 50 ? 'intermediate' : 'beginner',
      levelName: '成长中',
      recommendations: [],
    }),
  },
};
