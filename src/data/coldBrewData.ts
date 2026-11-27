import type { Language } from '../utils/showcaseLogic';

export const LOGO_IMAGE_PATH = '/src/assets/images/bashqaloob_logo_1795700921194.jpg';

export interface ProductItem {
  id: 'colombia' | 'ethiopia';
  originCode: 'COLOMBIA' | 'ETHIOPIA';
  image: string;
  priceUsd: number;
  volumeMl: number;
  steepHours: number;
  caffeineMg: number;
  en: {
    name: string;
    subtitle: string;
    notes: string[];
    description: string;
  };
  ar: {
    name: string;
    subtitle: string;
    notes: string[];
    description: string;
  };
}

export interface ProcessStep {
  id: 'steep' | 'filter' | 'bottle';
  number: string;
  duration: string;
  en: {
    title: string;
    caption: string;
    detail: string;
  };
  ar: {
    title: string;
    caption: string;
    detail: string;
  };
}

export interface ReviewItem {
  id: string;
  rating: number;
  en: {
    author: string;
    role: string;
    quote: string;
    variety: string;
  };
  ar: {
    author: string;
    role: string;
    quote: string;
    variety: string;
  };
}

export const BRAND_INFO = {
  en: {
    name: 'BASHQALOOB',
    tagline: 'Eighteen Hours of Cold Patience.',
    subtagline:
      'Ready-to-drink single-origin cold brew from Colombia and Ethiopia—steeped slowly at 4°C in triple-filtered mineral water and sealed in chilled glass flasks.',
    orderNow: 'Order Now',
    orderShort: 'Order',
    exploreRange: 'Explore Origins',
    dragHint: 'Move pointer to tilt · Hover a bottle to swirl · Scroll to spin',
    loaderLabel: 'Preparing BASHQALOOB cold brew...',
  },
  ar: {
    name: 'بشقلوب',
    tagline: 'ثماني عشرة ساعة من الصبر البارد.',
    subtagline:
      'قهوة باردة مختصة جاهزة للشرب من أصلين منفردين: كولومبيا وإثيوبيا—تُنقع ببطء عند ٤° مئوية في مياه معدنية مفلترة ثلاثياً وتُعبأ في قوارير زجاجية مبردة.',
    orderNow: 'اطلب الآن',
    orderShort: 'اطلب',
    exploreRange: 'استكشف المحاصيل',
    dragHint: 'حرّك المؤشر لإمالة القوارير · مرّر فوق القارورة لتحريك القهوة',
    loaderLabel: 'جارٍ تجهيز قهوة بشقلوب الباردة...',
  },
};

export const NAV_LINKS: Array<{ id: string; en: string; ar: string }> = [
  { id: 'featured', en: 'Signature', ar: 'المميزة' },
  { id: 'range', en: 'Origins', ar: 'المحاصيل' },
  { id: 'origin', en: 'Story', ar: 'القصة' },
  { id: 'process', en: 'Process', ar: 'التحضير' },
  { id: 'reviews', en: 'Reviews', ar: 'الآراء' },
];

export const FEATURED_PRODUCT = {
  id: 'bashqaloob-dual-reserve',
  image: '/src/assets/images/featured_cold_brew_1795699331497.jpg',
  priceUsd: 7.5,
  volumeMl: 350,
  steepHours: 18,
  caffeineMg: 210,
  en: {
    kicker: 'BASHQALOOB Signature · Single-Origin Flasks',
    title: 'Colombia & Ethiopia Dual-Origin Reserve',
    description:
      'Two distinct terroirs bottled ready-to-drink at peak chill. Choose Huila Colombia for rich panela cacao warmth, or washed Yirgacheffe Ethiopia for crisp floral citrus clarity—both steeped 18 hours with zero bitterness.',
    notesLabel: 'Tasting Notes',
    notes: ['Dark Cacao', 'Panela Caramel', 'Bergamot & Blood Orange'],
    specs: ['350 ml Glass Flask', '18h Cold Extraction', 'Ready-to-Drink · Zero Sugar'],
  },
  ar: {
    kicker: 'إصدار بشقلوب المميز · قوارير أحادية المصدر',
    title: 'تشكيلة بشقلوب: كولومبيا وإثيوبيا',
    description:
      'محصولان استثنائيان جاهزان للشرب في قوارير زجاجية مبردة. اختر كولومبيا هويلا لغنى الكاكاو والكراميل، أو إثيوبيا يرغاشيف لصفاء البرغموت والحمضيات—كلاهما منقوع ١٨ ساعة دون أي مرارة.',
    notesLabel: 'إيحاءات التذوق',
    notes: ['كاكاو داكن', 'كراميل بانيلا', 'برغموت وبرتقال دموي'],
    specs: ['قارورة زجاجية ٣٥٠ مل', 'تخمير بارد ١٨ ساعة', 'جاهزة للشرب · بدون سكر'],
  },
};

export const PRODUCT_RANGE: ProductItem[] = [
  {
    id: 'colombia',
    originCode: 'COLOMBIA',
    image: '/src/assets/images/product_caramel_1795699331852.jpg',
    priceUsd: 6.25,
    volumeMl: 350,
    steepHours: 16,
    caffeineMg: 195,
    en: {
      name: 'Colombia — Huila Single Origin',
      subtitle: 'Velvet Cocoa & Panela · 16h',
      notes: ['Milk Chocolate', 'Toasted Almond', 'Panela Sugar'],
      description:
        'High-grown Colombian Caturra steeped 16 hours at 4°C for deep cacao sweetness, toasted nut body, and a silky low-acid finish.',
    },
    ar: {
      name: 'كولومبيا — هويلا أحادي المصدر',
      subtitle: 'كاكاو مخملي وسكر القصب · ١٦ س',
      notes: ['شوكولاتة بالحليب', 'لوز محمص', 'سكر البانيلا'],
      description:
        'حبوب كاتورا الكولومبية من مرتفعات هويلا، تُنقع ١٦ ساعة عند ٤° مئوية لحلاوة كاكاو عميقة وقوام مخملي قليل الحموضة.',
    },
  },
  {
    id: 'ethiopia',
    originCode: 'ETHIOPIA',
    image: '/src/assets/images/product_black_1795699334088.jpg',
    priceUsd: 6.5,
    volumeMl: 350,
    steepHours: 18,
    caffeineMg: 210,
    en: {
      name: 'Ethiopia — Yirgacheffe Single Origin',
      subtitle: 'Floral Citrus & Black Tea · 18h',
      notes: ['Bergamot Blossom', 'Black Cherry', 'Dark Cacao'],
      description:
        'Washed heirloom beans from Yirgacheffe steeped 18 hours, unlocking luminous jasmine aroma, black cherry brightness, and crisp mineral clarity.',
    },
    ar: {
      name: 'إثيوبيا — يرغاشيف أحادي المصدر',
      subtitle: 'حمضيات زهرية وشاي أسود · ١٨ س',
      notes: ['زهر البرغموت', 'كرز أسود', 'كاكاو داكن'],
      description:
        'حبوب إرثية مغسولة من يرغاشيف تُنقع ١٨ ساعة لتكشف عن عبير الياسمين، إشراقة الكرز الأسود، ونقاء معدني منعش.',
    },
  },
];

export const ORIGIN_STORY = {
  image: '/src/assets/images/origin_story_beans_1795699334388.jpg',
  en: {
    kicker: 'Provenance & Craft',
    title: 'Two Iconic Origins. Never Rushed by Heat.',
    paragraphs: [
      'Every BASHQALOOB flask begins at 1,950 meters in Ethiopia’s Yirgacheffe highlands and Colombia’s volcanic Huila slopes. We partner directly with smallholder cooperatives who hand-pick only crimson cherries at peak ripeness.',
      'Instead of scalding hot water—which extracts bitter tannins and harsh acids—we coarse-grind our beans minutes before steeping them in chilled, triple-filtered mineral water for 12 to 18 hours, then seal them fresh in glass flasks.',
    ],
    stats: [
      { value: '1,950m', label: 'Harvest Elevation' },
      { value: '12–18h', label: 'Cold Steep Window' },
      { value: '67%', label: 'Lower Acidity' },
      { value: '4°C', label: 'Extraction Temp' },
    ],
  },
  ar: {
    kicker: 'الأصل والحرفية',
    title: 'محصولان استثنائيان. يُستخلصان بالوقت لا بالحرارة.',
    paragraphs: [
      'تبدأ كل قارورة بشقلوب على ارتفاع ١٬٩٥٠ متراً في مرتفعات يرغاشيف بإثيوبيا ومنحدرات هويلا البركانية في كولومبيا. نتعاون مباشرة مع مزارع صغيرة تقطف الكرز الناضج يدوياً في ذروة موسمه.',
      'بدلاً من الماء المغلي الذي يطلق المرارة والأحماض القاسية، نطحن حبوبنا طحناً خشناً قبل دقائق من نقعها في مياه معدنية باردة مفلترة ثلاثياً لمدة ١٢ إلى ١٨ ساعة، ثم نعبئها طازجة في قوارير زجاجية.',
    ],
    stats: [
      { value: '١٬٩٥٠م', label: 'ارتفاع المزارع' },
      { value: '١٢–١٨ س', label: 'مدة التخمير البارد' },
      { value: '٦٧٪', label: 'حموضة أقل' },
      { value: '٤°م', label: 'حرارة الاستخلاص' },
    ],
  },
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'steep',
    number: '01',
    duration: '12–18h',
    en: {
      title: 'Cold Steeping Jar',
      caption: 'Coarse grounds immersed at 4°C',
      detail:
        'Freshly roasted Colombia and Ethiopia beans are coarse-ground and steeped gently in remineralized cold water for 12 to 18 hours inside our glass steeping jar.',
    },
    ar: {
      title: 'وعاء النقع البارد',
      caption: 'قهوة مطحونة بخشونة عند ٤° مئوية',
      detail:
        'تُطحن حبوب كولومبيا وإثيوبيا المحمصة طازجاً وتُغمر ببطء في مياه معدنية باردة لمدة ١٢ إلى ١٨ ساعة داخل وعاء النقع الزجاجي.',
    },
  },
  {
    id: 'filter',
    number: '02',
    duration: '01:30',
    en: {
      title: 'Triple Cold Filtration',
      caption: 'Velvet clarity, zero sediment',
      detail:
        'The steeped concentrate passes slowly through layered micro-filtration to remove fine grounds while preserving aromatic coffee oils.',
    },
    ar: {
      title: 'الترشيح البارد الثلاثي',
      caption: 'نقاء مخملي دون أي رواسب',
      detail:
        'يمر المستخلص ببطء عبر طبقات ترشيح دقيقة لإزالة الرواسب مع الحفاظ على الزيوت العطرية الغنية.',
    },
  },
  {
    id: 'bottle',
    number: '03',
    duration: '04:00 AM',
    en: {
      title: 'Chilled Flask Bottling',
      caption: 'Sealed fresh in glass flasks',
      detail:
        'Each batch is poured cold into signature clear glass flasks, capped tight, and labeled by single-origin harvest for immediate chilled enjoyment.',
    },
    ar: {
      title: 'التعبئة المبردة في القوارير',
      caption: 'تُغلق طازجة كل فجر',
      detail:
        'تُسكب كل دفعة باردة في قواريرنا الزجاجية المميزة وتُختم بإحكام مع ملصق المحصول لتكون جاهزة للشرب مباشرة.',
    },
  },
];

export const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    rating: 5,
    en: {
      author: 'Nadia Al-Mansoor',
      role: 'Specialty Roaster & Q-Grader',
      quote:
        'BASHQALOOB Ethiopia has the cleanest jasmine-to-cherry finish I have ever tasted in a ready-to-drink glass flask.',
      variety: 'Ethiopia Single Origin',
    },
    ar: {
      author: 'نادية المنصور',
      role: 'خبيرة تذوق قهوة مختصة',
      quote:
        'بشقلوب إثيوبيا يقدم أنقى انتقال من زهر الياسمين إلى الكرز الأسود في قارورة جاهزة للشرب.',
      variety: 'إثيوبيا أحادي المصدر',
    },
  },
  {
    id: 'rev-2',
    rating: 5,
    en: {
      author: 'Marcus Vance',
      role: 'Architectural Photographer',
      quote:
        'Colombia gives me smooth dark chocolate focus on early shoot mornings with zero stomach acidity or added sugar.',
      variety: 'Colombia Single Origin',
    },
    ar: {
      author: 'ماركوس فانس',
      role: 'مصور معماري',
      quote:
        'محصول كولومبيا يمنحني نكهة الشوكولاتة الداكنة الصافية طوال ساعات التصوير دون أي حموضة أو سكر مضاف.',
      variety: 'كولومبيا أحادي المصدر',
    },
  },
  {
    id: 'rev-3',
    rating: 5,
    en: {
      author: 'Layla Haddad',
      role: 'Pastry Chef, Atelier Bloom',
      quote:
        'The balance between the panela sweetness in Colombia and the floral snap in Ethiopia makes keeping both chilled a studio ritual.',
      variety: 'Dual-Origin Reserve',
    },
    ar: {
      author: 'ليلى حداد',
      role: 'شيف حلويات',
      quote:
        'التوازن بين حلاوة كولومبيا وإشراقة إثيوبيا جعل وجود القارورتين في براد الاستوديو طقساً يومياً.',
      variety: 'إصدار المحصولين',
    },
  },
  {
    id: 'rev-4',
    rating: 5,
    en: {
      author: 'Kenji Takahashi',
      role: 'Industrial Designer',
      quote:
        'Even before the first sip, the flask silhouette and cream emblem label feel sculpted and unmistakably BASHQALOOB.',
      variety: 'Ethiopia Single Origin',
    },
    ar: {
      author: 'كينجي تاكاهاشي',
      role: 'مصمم صناعي',
      quote:
        'حتى قبل الرشفة الأولى، يبدو تصميم القارورة الزجاجية والشعار الكهرماني تحفة متقنة تعبر عن بشقلوب.',
      variety: 'إثيوبيا أحادي المصدر',
    },
  },
];

export const SECTION_COPY = {
  en: {
    featuredSectionTitle: 'Signature Reserve',
    rangeKicker: 'Two Single-Origin Flasks',
    rangeTitle: 'Colombia & Ethiopia',
    rangeSubtitle:
      'Hover either 3D flask to inspect the roast clarity and watch the cream emblem label catch the amber light.',
    processKicker: 'Method & Precision',
    processTitle: 'Steep. Filter. Bottle Cold.',
    processSubtitle:
      'Scroll through our three-stage cold extraction process as each vessel illuminates in sequence.',
    reviewsKicker: 'Verified Tasting Impressions',
    reviewsTitle: 'Poured & Loved Daily',
    pauseCarousel: 'Pause auto-scroll',
    playCarousel: 'Resume auto-scroll',
    prevReview: 'Previous review',
    nextReview: 'Next review',
    footerTagline:
      'Ready-to-drink single-origin cold brew from Colombia & Ethiopia, steeped 12–18 hours and sealed chilled every morning.',
    footerNavTitle: 'Explore',
    footerContactTitle: 'Roastery & Contact',
    footerAddress: '412 Cedar Alley, Artisan Roastery District',
    footerHours: 'Daily · 06:30 – 19:00',
    footerEmail: 'hello@bashqaloob.com',
    footerPhone: '+1 (415) 890-4412',
    copyright: '© 2026 BASHQALOOB (بشقلوب) Cold Brew. Showcase Demo.',
    themeToLight: 'Switch to Warm Cream mode',
    themeToDark: 'Switch to Deep Espresso mode',
    langSwitchLabel: 'العربية',
  },
  ar: {
    featuredSectionTitle: 'الإصدار المميز',
    rangeKicker: 'محصولان أحاديا المصدر',
    rangeTitle: 'كولومبيا وإثيوبيا',
    rangeSubtitle:
      'مرّر المؤشر فوق أي قارورة ثلاثية الأبعاد لتدويرها ورؤية الشعار الكريمي يعكس الإضاءة الكهرمانية.',
    processKicker: 'المنهج والدقة',
    processTitle: 'نقع. ترشيح. تعبئة باردة.',
    processSubtitle:
      'مرّر عبر مراحل التحضير الثلاث لتضيء كل مرحلة تباعاً بتفاصيل الاستخلاص البارد.',
    reviewsKicker: 'انطباعات المتذوقين',
    reviewsTitle: 'تُسكب وتُعشق كل صباح',
    pauseCarousel: 'إيقاف التمرير التلقائي',
    playCarousel: 'تشغيل التمرير التلقائي',
    prevReview: 'التقييم السابق',
    nextReview: 'التقييم التالي',
    footerTagline:
      'قهوة باردة مختصة جاهزة للشرب من كولومبيا وإثيوبيا، منقوعة من ١٢ إلى ١٨ ساعة ومبردة يومياً.',
    footerNavTitle: 'تصفح الأقسام',
    footerContactTitle: 'المحمصة والتواصل',
    footerAddress: '٤١٢ ممر الأرز، حي المحامص المختصة',
    footerHours: 'يومياً · ٠٦:٣٠ – ١٩:٠٠',
    footerEmail: 'hello@bashqaloob.com',
    footerPhone: '+966 55 890 4412',
    copyright: '© ٢٠٢٦ بشقلوب (BASHQALOOB) للقهوة الباردة. موقع استعراضي تجريبي.',
    themeToLight: 'التبديل إلى وضع الكريمة الدافئة',
    themeToDark: 'التبديل إلى وضع الإسبريسو الداكن',
    langSwitchLabel: 'EN',
  },
};

export function getText(lang: Language) {
  return SECTION_COPY[lang];
}
