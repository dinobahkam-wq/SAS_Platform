/**
 * منتج ساس للمعرفة البصرية — خط زمني تاريخي.
 * الوقائع تستند إلى مصادر أصلية محددة؛ فقرة «الدلالة» تفسير تحريري معلن، لا اقتباس من المصدر.
 * الأحداث المختارة لا تمثل جميع وقائع الفترة ولا تقييمًا كميًا للحرب.
 */
export type TimelineCategory = "political" | "military" | "institutional" | "diplomatic";
export type TimelineSource = { title: string; organization: string; url: string };
export type TimelineEvent = {
  id: string;
  date: string;
  dateLabel: string;
  year: string;
  title: string;
  category: TimelineCategory;
  place: string;
  description: string;
  change: string;
  significance: string;
  sources: TimelineSource[];
};

export const timelineCategories: Record<TimelineCategory, string> = {
  political: "تحول سياسي",
  military: "تحول عسكري",
  institutional: "تحول مؤسسي",
  diplomatic: "مسار دبلوماسي",
};

export const yemenTimeline: TimelineEvent[] = [
  {
    id: "sanaa-2014", date: "2014-09-21", dateLabel: "21 سبتمبر 2014", year: "2014",
    title: "سيطرة الحوثيين على صنعاء", category: "political", place: "صنعاء",
    description: "سيطرت جماعة الحوثيين والقوات المتحالفة معها على العاصمة صنعاء ومؤسسات رئيسية، بالتزامن مع توقيع اتفاق السلم والشراكة الوطنية برعاية أممية.",
    change: "اختل ميزان السلطة الذي قامت عليه المرحلة الانتقالية، وأصبحت مؤسسات الدولة في العاصمة تحت سيطرة قوة مسلحة.",
    significance: "تُمثل هذه المحطة انتقال الأزمة من تعثر التسوية السياسية إلى أزمة سلطة ومؤسسات.",
    sources: [{ title: "خلفية الأمم المتحدة عن اليمن والمرحلة الانتقالية", organization: "إدارة الشؤون السياسية وبناء السلام — الأمم المتحدة", url: "https://dppa.un.org/en/yemen" }],
  },
  {
    id: "coalition-2015", date: "2015-03-26", dateLabel: "26 مارس 2015", year: "2015",
    title: "بدء التدخل العسكري للتحالف", category: "military", place: "اليمن",
    description: "بدأ تحالف عسكري بقيادة السعودية عملياته في اليمن بناءً على طلب الرئيس عبدربه منصور هادي، مع اتساع نطاق المواجهات المسلحة.",
    change: "انتقلت الحرب إلى صراع عسكري واسع ذي أبعاد إقليمية، مع تزايد التداعيات الإنسانية والاقتصادية.",
    significance: "أصبحت حسابات الأزمة مرتبطة بالأطراف المحلية وبالتدخل العسكري الخارجي في آن واحد.",
    sources: [{ title: "عرض الأمم المتحدة لتطور الأزمة اليمنية", organization: "إدارة الشؤون السياسية وبناء السلام — الأمم المتحدة", url: "https://dppa.un.org/en/yemen" }],
  },
  {
    id: "central-bank-2016", date: "2016-09-18", dateLabel: "سبتمبر 2016", year: "2016",
    title: "نقل مقر البنك المركزي إلى عدن", category: "institutional", place: "صنعاء / عدن",
    description: "أصدرت الحكومة اليمنية قرارًا بنقل المقر الرئيسي للبنك المركزي من صنعاء إلى عدن، وسط انقسام السيطرة على المؤسسات.",
    change: "تعمق الانقسام النقدي والمؤسسي ونشأت سلطتان نقديتان متنافستان وما ارتبط بذلك من تعقيدات مالية.",
    significance: "امتد الانقسام السياسي والعسكري إلى إدارة العملة والقطاع المصرفي.",
    sources: [{ title: "تقرير اقتصادي عن الانقسام النقدي في اليمن", organization: "البنك الدولي", url: "https://documents1.worldbank.org/curated/en/099445406102232164/pdf/IDU02c5915390fb9604bd10ae55053ca415f59f9.pdf" }],
  },
  {
    id: "saleh-2017", date: "2017-12-04", dateLabel: "4 ديسمبر 2017", year: "2017",
    title: "مقتل الرئيس السابق علي عبدالله صالح", category: "political", place: "صنعاء",
    description: "قُتل الرئيس اليمني السابق علي عبدالله صالح بعد انهيار تحالفه مع الحوثيين واندلاع مواجهات بين الطرفين في صنعاء.",
    change: "انتهى التحالف السياسي والعسكري بين الحوثيين وصالح، وتغيّرت علاقات القوى في معسكر صنعاء.",
    significance: "أعاد الحدث تشكيل شبكة التحالفات الداخلية دون أن ينهي الحرب.",
    sources: [{ title: "تقرير مجلس الأمن بشأن اليمن لعام 2018", organization: "فريق الخبراء المعني باليمن — الأمم المتحدة", url: "https://documents.un.org/api/symbol/access?l=en&s=S%2F2018%2F594&t=pdf" }],
  },
  {
    id: "stockholm-2018", date: "2018-12-13", dateLabel: "13 ديسمبر 2018", year: "2018",
    title: "التوصل إلى اتفاق ستوكهولم", category: "diplomatic", place: "السويد / اليمن",
    description: "توصل ممثلو الحكومة اليمنية والحوثيين في مشاورات السويد إلى تفاهمات بشأن الحديدة وتبادل الأسرى وتعز.",
    change: "فُتح مسار تفاوضي جزئي يركز على ملفات محددة بدل تسوية سياسية شاملة.",
    significance: "أظهر الاتفاق إمكان تحقيق تفاهمات محدودة مع استمرار الخلاف على الإطار السياسي الأوسع.",
    sources: [{ title: "النص الكامل لاتفاق ستوكهولم", organization: "مكتب المبعوث الخاص للأمين العام للأمم المتحدة إلى اليمن", url: "https://osesgy.unmissions.org/en/node/15464" }],
  },
  {
    id: "riyadh-2019", date: "2019-11-05", dateLabel: "5 نوفمبر 2019", year: "2019",
    title: "توقيع اتفاق الرياض", category: "diplomatic", place: "الرياض / عدن",
    description: "وقعت الحكومة اليمنية والمجلس الانتقالي الجنوبي اتفاق الرياض بوساطة سعودية لمعالجة الخلاف بينهما وترتيب تقاسم السلطة والمسؤوليات.",
    change: "أُدخلت الخلافات داخل المعسكر المناهض للحوثيين في مسار تفاوضي وترتيبات سياسية وأمنية.",
    significance: "أبرز الاتفاق أن تعدد مراكز القوة داخل مناطق الحكومة يمثل تحديًا موازيًا للصراع مع الحوثيين.",
    sources: [{ title: "بيان المبعوث الأممي بشأن اتفاق الرياض", organization: "الأمم المتحدة", url: "https://yemen.un.org/en/24297-statement-special-envoy-yemen-martin-griffiths-%E2%80%9Criyadh-agreement%E2%80%9D" }],
  },
  {
    id: "truce-2022", date: "2022-04-02", dateLabel: "2 أبريل 2022", year: "2022",
    title: "بدء الهدنة الأممية", category: "diplomatic", place: "اليمن",
    description: "دخلت هدنة لمدة شهرين حيز التنفيذ وفق إعلان المبعوث الأممي، وشملت وقفًا للأعمال الهجومية وتدابير إنسانية واقتصادية.",
    change: "تراجعت حدة القتال الواسع نسبيًا وفُتحت نافذة لإجراءات بناء الثقة والمسار التفاوضي.",
    significance: "أرست الهدنة نقطة تحول من مرحلة التصعيد العسكري الشامل إلى مرحلة خفض التصعيد، دون أن تنهي الأزمة.",
    sources: [{ title: "إعلان المبعوث الأممي عن الهدنة", organization: "مكتب المبعوث الخاص للأمين العام للأمم المتحدة إلى اليمن", url: "https://osesgy.unmissions.org/en/speeches-and-statements/press-statement-un-special-envoy-yemen-hans-grundberg-two-month" }],
  },
  {
    id: "plc-2022", date: "2022-04-07", dateLabel: "7 أبريل 2022", year: "2022",
    title: "تشكيل مجلس القيادة الرئاسي", category: "institutional", place: "اليمن",
    description: "أصدر الرئيس عبدربه منصور هادي إعلانًا بنقل صلاحياته إلى مجلس قيادة رئاسي، في إطار إعادة ترتيب قيادة السلطة المعترف بها دوليًا.",
    change: "انتقلت القيادة الرئاسية إلى هيئة جماعية بدل صيغة الرئاسة الفردية السابقة.",
    significance: "غيّر القرار بنية القيادة السياسية الرسمية وطريقة إدارة توازناتها الداخلية.",
    sources: [
      { title: "إعلان نقل السلطة وتشكيل مجلس القيادة الرئاسي", organization: "وزارة الخارجية اليمنية", url: "https://www.mofa-ye.org/Pages/17325/" },
      { title: "تعليق الأمم المتحدة على إنشاء مجلس القيادة", organization: "الأمم المتحدة", url: "https://www.un.org/sg/en/content/highlight/2022-04-07.html" },
    ],
  },
];
