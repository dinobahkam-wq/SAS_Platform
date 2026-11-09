const sections = [
  {
    number: "01",
    title: "الأخبار والشؤون الجارية",
    description: "متابعة منظمة للأحداث والتطورات، مع إسناد واضح للمصادر والتوقيت.",
    href: "#news",
  },
  {
    number: "02",
    title: "التحليل والرأي",
    description: "قراءات سياسية واستراتيجية تضع الوقائع في سياقاتها الأوسع.",
    href: "#analysis",
  },
  {
    number: "03",
    title: "الدراسات والأبحاث",
    description: "أوراق بحثية ودراسات معمقة تدعم الفهم وصناعة القرار.",
    href: "#research",
  },
  {
    number: "04",
    title: "البرامج والوسائط",
    description: "حوارات وبرامج ومحتوى مرئي وصوتي يوسّع نطاق المعرفة.",
    href: "#media",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3" aria-label="منصة ساس">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-lg font-bold tracking-tight">
              س
            </span>
            <span>
              <span className="block text-lg font-bold">منصة ساس</span>
              <span className="block text-xs text-neutral-500">للإعلام والدراسات</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-neutral-700 md:flex">
            <a href="#news">الأخبار</a>
            <a href="#analysis">التحليل والرأي</a>
            <a href="#research">الدراسات والأبحاث</a>
            <a href="#media">البرامج والوسائط</a>
          </nav>
          <span className="rounded-full border border-neutral-200 px-4 py-2 text-xs text-neutral-500">
            النسخة التجريبية
          </span>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-end md:py-28">
        <div>
          <p className="mb-6 text-sm font-semibold tracking-wide text-[var(--accent)]">
            منصة للإعلام والمعرفة السياسية
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.45] font-bold tracking-tight md:text-6xl">
            نفهم الأحداث،
            <br />
            ونقرأ ما وراءها.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600 md:text-lg">
            منصة إعلامية وبحثية تُنظّم الأخبار، وتقدم التحليل والرأي،
            وتنشر الدراسات والأبحاث حول اليمن ومحيطه الإقليمي والدولي.
          </p>
        </div>
        <div className="border-r-2 border-[var(--accent)] pr-6 md:mb-2">
          <p className="text-sm leading-8 text-neutral-600">
            نعمل على بناء مساحة معرفية موثوقة، تربط الخبر بسياقه،
            والتحليل بمصادره، والبحث بأسئلة الواقع.
          </p>
          <p className="mt-5 text-xs font-medium tracking-widest text-neutral-400">
            SAS MEDIA AND STUDIES PLATFORM
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between border-b border-[var(--line)] pb-5">
          <div>
            <p className="text-xs font-semibold text-[var(--accent)]">أقسام المنصة</p>
            <h2 className="mt-2 text-2xl font-bold">مساحات المحتوى</h2>
          </div>
          <span className="text-xs text-neutral-400">01 — 04</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <a
              id={section.href.slice(1)}
              href={section.href}
              key={section.number}
              className="group flex min-h-52 flex-col justify-between border border-[var(--line)] bg-white p-7 transition-colors hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-widest text-neutral-400">
                  {section.number}
                </span>
                <span className="text-lg text-neutral-400 transition-transform group-hover:-translate-x-1">
                  ←
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-neutral-500">
                  {section.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <span>منصة ساس للإعلام والدراسات</span>
          <span dir="ltr">© SAS Media and Studies Platform</span>
        </div>
      </footer>
    </main>
  );
}
