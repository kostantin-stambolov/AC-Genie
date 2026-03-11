import {
  ArrowRight, AlertCircle, BookOpen, CheckCircle, ChevronLeft, ChevronRight,
  FileText, LogOut, Mic, RotateCcw, Sparkles, StopCircle, Zap,
} from "@/components/icons";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight mb-6 pb-3 border-b border-[#E5E7EB]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const c = 2 * Math.PI * 16;
  const d = c * (1 - 3 / 6);
  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      <header className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] h-14 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-sm select-none">AC</span>
          <span className="font-semibold text-[#111827] tracking-tight">Design System</span>
        </div>
        <span className="text-[#E5E7EB]">|</span>
        <nav className="flex items-center gap-1 overflow-x-auto flex-1">
          {([["#colors","Цветове"],["#typography","Типография"],["#icons","Иконографика"],["#spacing","Разстояния"],["#buttons","Бутони"],["#badges","Бейджове"],["#cards","Карти"],["#forms","Форми"],["#organisms","Организми"]] as [string,string][]).map(([href,label])=>(
            <a key={href} href={href} className="shrink-0 text-[13px] text-[#6B7280] hover:text-[#111827] px-2.5 py-1 rounded-lg hover:bg-[#F3F4F6] transition">{label}</a>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">

        <div>
          <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-2">AC-Genie</p>
          <h1 className="text-[32px] font-semibold text-[#111827] tracking-tight mb-2">Design System</h1>
          <p className="text-[15px] text-[#4B5563]">Единен референс за всички визуални токени, компоненти и паттерни. Организиран по Atomic Design: атоми &rarr; молекули &rarr; организми.</p>
        </div>

        <Section id="colors" title="Цветове">
          <Sub title="Бранд / Структурни">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm" style={{background:"#0B1F3A"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Navy — Primary</p><p className="text-[12px] font-mono text-[#9CA3AF]">#0B1F3A</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Основен бутон, лого, прогрес пръстен</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm" style={{background:"#122a50"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Navy Hover</p><p className="text-[12px] font-mono text-[#9CA3AF]">#122a50</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Hover state на основния бутон</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm" style={{background:"#1e3a5f"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Navy Deep</p><p className="text-[12px] font-mono text-[#9CA3AF]">#1e3a5f</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Gradient — login/register панел</p></div>
            </div>
          </Sub>
          <Sub title="Неутрали / Сиви">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#F0F2F5"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Page Background</p><p className="text-[12px] font-mono text-[#9CA3AF]">#F0F2F5</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Фон на всички страници</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#F9FAFB"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Surface Subtle</p><p className="text-[12px] font-mono text-[#9CA3AF]">#F9FAFB</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Инпут полета, вътрешни секции</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#F3F4F6"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Surface</p><p className="text-[12px] font-mono text-[#9CA3AF]">#F3F4F6</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Вторичен бутон, разделители, иконни контейнери</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#E5E7EB"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Border</p><p className="text-[12px] font-mono text-[#9CA3AF]">#E5E7EB</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Рамки на инпути, хедър разделители</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#D1D5DB"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Placeholder</p><p className="text-[12px] font-mono text-[#9CA3AF]">#D1D5DB</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Плейсхолдър текст, бъдещи точки</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#9CA3AF"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Text Dimmed</p><p className="text-[12px] font-mono text-[#9CA3AF]">#9CA3AF</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Подсказки, timestamp-ове, subtitle</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#6B7280"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Text Muted</p><p className="text-[12px] font-mono text-[#9CA3AF]">#6B7280</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Вторично тяло — само върху bg-white!</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#4B5563"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Text Secondary</p><p className="text-[12px] font-mono text-[#9CA3AF]">#4B5563</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Основно тяло върху страничен фон</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 rounded-xl shrink-0 shadow-sm border border-[#E5E7EB]" style={{background:"#111827"}} /><div><p className="text-[15px] font-semibold text-[#111827]">Text Primary</p><p className="text-[12px] font-mono text-[#9CA3AF]">#111827</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] text-right max-w-xs">Заглавия, важни стойности</p></div>
            </div>
          </Sub>
          <Sub title="Семантични Tailwind палитри">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-indigo-600 mb-1">Indigo</p><p className="text-[12px] text-[#6B7280]">Активен коучинг, фокус</p></div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-emerald-700 mb-1">Emerald</p><p className="text-[12px] text-[#6B7280]">Висок резултат, верни корекции</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-amber-700 mb-1">Amber</p><p className="text-[12px] text-[#6B7280]">В процес, предупреждения</p></div>
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-red-600 mb-1">Red</p><p className="text-[12px] text-[#6B7280]">Грешки, диктовка</p></div>
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-orange-600 mb-1">Orange</p><p className="text-[12px] text-[#6B7280]">Среден резултат</p></div>
              <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3"><p className="text-[14px] font-semibold text-sky-600 mb-1">Sky</p><p className="text-[12px] text-[#6B7280]">Структура sub-score</p></div>
            </div>
          </Sub>
          <Sub title="Правило за контраст">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <p className="text-[14px] font-semibold text-amber-800 mb-1">Важно</p>
              <p className="text-[13px] text-amber-700">#6B7280 и по-светлите сиви са допустими само върху bg-white. Върху #F0F2F5 минималният цвят е #4B5563.</p>
            </div>
          </Sub>
        </Section>

        <Section id="typography" title="Типография">
          <Sub title="Шрифт">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-5">
              <p className="text-[32px] font-bold text-[#111827] mb-1">DM Sans</p>
              <p className="text-[15px] text-[#6B7280] mb-3">Google Fonts &middot; 400/500/600/700 &middot; подмножество latin</p>
              <p className="text-[12px] font-mono text-[#9CA3AF]">--font-dm-sans &middot; fallback: -apple-system, BlinkMacSystemFont, Segoe UI</p>
            </div>
          </Sub>
          <Sub title="Скала на размерите">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">11px</span><span className="text-[11px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Sub-score лейбли</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">12px</span><span className="text-[12px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Бейджове, uppercase лейбли</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">13px</span><span className="text-[13px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Помощен текст, timestamp</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">14px</span><span className="text-[14px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">NavHeader, LogoutButton</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">15px</span><span className="text-[15px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Стандартно тяло — бутони, инпути</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">16px</span><span className="text-[16px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">PhaseBar заглавие</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">18px</span><span className="text-[18px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Заглавия на карти</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">22px</span><span className="text-[22px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Фазови h2</span></div>
              <div className="flex items-baseline gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">26px</span><span className="text-[26px] font-semibold text-[#111827] flex-1">Abc — Текст</span><span className="text-[12px] text-[#9CA3AF] text-right hidden sm:block">Страничен h1</span></div>
            </div>
          </Sub>
          <Sub title="Тегла">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">400</span><span className="font-normal text-[18px] text-[#111827] flex-1">Американски колеж</span><span className="text-[12px] text-[#9CA3AF] hidden sm:block">Вторични бутони</span></div>
              <div className="flex items-center gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">500</span><span className="font-medium text-[18px] text-[#111827] flex-1">Американски колеж</span><span className="text-[12px] text-[#9CA3AF] hidden sm:block">Навигационни връзки, бейджове</span></div>
              <div className="flex items-center gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">600</span><span className="font-semibold text-[18px] text-[#111827] flex-1">Американски колеж</span><span className="text-[12px] text-[#9CA3AF] hidden sm:block">Заглавия, бутони</span></div>
              <div className="flex items-center gap-5 px-5 py-3.5 border-b border-[#F3F4F6] last:border-0"><span className="w-20 shrink-0 text-[12px] font-mono text-[#9CA3AF]">700</span><span className="font-bold text-[18px] text-[#111827] flex-1">Американски колеж</span><span className="text-[12px] text-[#9CA3AF] hidden sm:block">Uppercase лейбли, резултати</span></div>
            </div>
          </Sub>
          <Sub title="Универсален секционен лейбъл">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-5"><p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Секционен лейбъл</p><p className="text-[12px] font-mono text-[#9CA3AF]">text-[12px] font-bold text-indigo-500 uppercase tracking-widest</p></div>
          </Sub>
        </Section>

        <Section id="icons" title="Иконографика">
          <Sub title="Система">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-4 mb-4"><p className="text-[13px] text-[#6B7280]">SVG &middot; stroke=currentColor &middot; viewBox 24x24 &middot; strokeWidth 2 &middot; default size 18px</p></div>
          </Sub>
          <Sub title="Каталог">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><ArrowRight size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">ArrowRight</span></div><p className="text-[12px] text-[#9CA3AF]">Основни CTA бутони, навигация</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><ChevronLeft size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">ChevronLeft</span></div><p className="text-[12px] text-[#9CA3AF]">NavHeader обратна връзка</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><ChevronRight size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">ChevronRight</span></div><p className="text-[12px] text-[#9CA3AF]">Списъчни редове, избор на тема</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><FileText size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">FileText</span></div><p className="text-[12px] text-[#9CA3AF]">Модулна карта Есе</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><BookOpen size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">BookOpen</span></div><p className="text-[12px] text-[#9CA3AF]">Режим Насочено обучение</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><Zap size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">Zap</span></div><p className="text-[12px] text-[#9CA3AF]">Режим Бързо упражнение</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><Mic size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">Mic</span></div><p className="text-[12px] text-[#9CA3AF]">DictateButton — запис</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><StopCircle size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">StopCircle</span></div><p className="text-[12px] text-[#9CA3AF]">DictateButton — спри</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><Sparkles size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">Sparkles</span></div><p className="text-[12px] text-[#9CA3AF]">Примерно есе, AI действия</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><CheckCircle size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">CheckCircle</span></div><p className="text-[12px] text-[#9CA3AF]">Маркирай като завършено</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><RotateCcw size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">RotateCcw</span></div><p className="text-[12px] text-[#9CA3AF]">Опитай пак</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><AlertCircle size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">AlertCircle</span></div><p className="text-[12px] text-[#9CA3AF]">Арбитраж, секция грешки</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#111827]"><LogOut size={22} /></div><span className="text-[13px] font-semibold text-[#111827] font-mono">LogOut</span></div><p className="text-[12px] text-[#9CA3AF]">Бутон за изход</p></div>
            </div>
          </Sub>
          <Sub title="Иконен контейнер — размери">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-5 flex items-end gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-2"><div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center"><FileText size={14} className="text-indigo-600" /></div><span className="text-[11px] text-[#9CA3AF]">28px</span></div>
              <div className="flex flex-col items-center gap-2"><div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><FileText size={16} className="text-indigo-600" /></div><span className="text-[11px] text-[#9CA3AF]">36px</span></div>
              <div className="flex flex-col items-center gap-2"><div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center"><FileText size={20} className="text-indigo-600" /></div><span className="text-[11px] text-[#9CA3AF]">44px — стандарт</span></div>
              <div className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center"><FileText size={24} className="text-indigo-600" /></div><span className="text-[11px] text-[#9CA3AF]">56px</span></div>
            </div>
          </Sub>
        </Section>

        <Section id="spacing" title="Разстояния, радиус и сенки">
          <Sub title="Радиус">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 shrink-0 rounded-lg bg-indigo-100 border border-indigo-200" /><div><p className="text-[14px] font-semibold text-[#111827]">rounded-lg</p><p className="text-[12px] font-mono text-[#9CA3AF]">8px</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] max-w-xs hidden sm:block">DictateButton, малки инлайн елементи</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-100 border border-indigo-200" /><div><p className="text-[14px] font-semibold text-[#111827]">rounded-xl</p><p className="text-[12px] font-mono text-[#9CA3AF]">12px</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] max-w-xs hidden sm:block">Лого, иконен контейнер, Nav hover bg</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-100 border border-indigo-200" /><div><p className="text-[14px] font-semibold text-[#111827]">rounded-2xl</p><p className="text-[12px] font-mono text-[#9CA3AF]">16px</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] max-w-xs hidden sm:block">Всички бутони, инпути, textarea, info кутии</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 shrink-0 rounded-3xl bg-indigo-100 border border-indigo-200" /><div><p className="text-[14px] font-semibold text-[#111827]">rounded-3xl</p><p className="text-[12px] font-mono text-[#9CA3AF]">24px</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] max-w-xs hidden sm:block">Всички карти, модали — универсален контейнер</p></div>
              <div className="flex items-center gap-5 px-5 py-4 border-b border-[#F3F4F6] last:border-0"><div className="w-12 h-12 shrink-0 rounded-full bg-indigo-100 border border-indigo-200" /><div><p className="text-[14px] font-semibold text-[#111827]">rounded-full</p><p className="text-[12px] font-mono text-[#9CA3AF]">9999px</p></div><p className="ml-auto text-[13px] text-[#9CA3AF] max-w-xs hidden sm:block">Бейджове, пилюли, точки за прогрес</p></div>
            </div>
          </Sub>
          <Sub title="Сенки">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-5 py-4 border border-[#F3F4F6]"><p className="text-[14px] font-semibold text-[#111827] mb-0.5">Card Default</p><p className="text-[12px] font-mono text-[#9CA3AF] mb-1 break-all">shadow-[0_2px_12px_rgba(0,0,0,0.06)]</p><p className="text-[12px] text-[#6B7280]">Всички bg-white карти</p></div>
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-4 border border-[#F3F4F6]"><p className="text-[14px] font-semibold text-[#111827] mb-0.5">Card Subtle</p><p className="text-[12px] font-mono text-[#9CA3AF] mb-1 break-all">shadow-[0_2px_12px_rgba(0,0,0,0.04)]</p><p className="text-[12px] text-[#6B7280]">Списъчни карти default</p></div>
              <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] px-5 py-4 border border-[#F3F4F6]"><p className="text-[14px] font-semibold text-[#111827] mb-0.5">Card Hover</p><p className="text-[12px] font-mono text-[#9CA3AF] mb-1 break-all">shadow-[0_4px_16px_rgba(0,0,0,0.10)]</p><p className="text-[12px] text-[#6B7280]">Списъчни карти при hover</p></div>
              <div className="bg-white rounded-2xl shadow-md px-5 py-4 border border-[#F3F4F6]"><p className="text-[14px] font-semibold text-[#111827] mb-0.5">Button CTA</p><p className="text-[12px] font-mono text-[#9CA3AF] mb-1 break-all">shadow-md</p><p className="text-[12px] text-[#6B7280]">Основен CTA бутон</p></div>
              <div className="bg-white rounded-2xl shadow-2xl px-5 py-4 border border-[#F3F4F6]"><p className="text-[14px] font-semibold text-[#111827] mb-0.5">Modal Panel</p><p className="text-[12px] font-mono text-[#9CA3AF] mb-1 break-all">shadow-2xl</p><p className="text-[12px] text-[#6B7280]">RewriteModal панел</p></div>
            </div>
          </Sub>
        </Section>

        <Section id="buttons" title="Бутони">
          <div className="space-y-4">

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-3">
              <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Primary CTA</p>
              <button className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold hover:bg-[#122a50] hover:-translate-y-0.5 shadow-md transition-all cursor-pointer">Напиши ново есе <ArrowRight size={16} /></button>
              <button disabled className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold shadow-md opacity-50 cursor-not-allowed">Деактивиран <ArrowRight size={16} /></button>
              <p className="text-[12px] font-mono text-[#9CA3AF]">h-[52px] rounded-2xl bg-[#0B1F3A] text-white font-semibold shadow-md hover:bg-[#122a50] hover:-translate-y-0.5</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-3">
              <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Secondary</p>
              <button className="flex items-center justify-center w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] font-normal hover:bg-[#E5E7EB] transition cursor-pointer">Виж предишни опити</button>
              <p className="text-[12px] font-mono text-[#9CA3AF]">h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] font-normal hover:bg-[#E5E7EB]</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-3">
              <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Dictate — idle / recording</p>
              <div className="flex gap-3"><button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] text-[12px] font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"><Mic size={13} /> Диктувай</button><button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] font-semibold cursor-pointer"><StopCircle size={13} /> Спри</button></div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-3">
              <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Ghost Nav</p>
              <div className="flex gap-3"><button className="flex items-center gap-1.5 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] transition cursor-pointer px-2 py-2 rounded-xl hover:bg-[#F3F4F6]"><ChevronLeft size={16} /> Назад</button><button className="flex items-center gap-1.5 text-[14px] font-medium text-[#9CA3AF] hover:text-[#111827] transition cursor-pointer px-2 py-2 rounded-xl hover:bg-[#F3F4F6]"><LogOut size={16} /> Изход</button></div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-3">
              <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest">Self-Review Toggle</p>
              <div className="flex gap-2"><button className="min-w-[44px] h-9 px-3 rounded-xl text-[15px] font-semibold bg-emerald-600 text-white">Да</button><button className="min-w-[44px] h-9 px-3 rounded-xl text-[15px] font-semibold border border-[#E5E7EB] bg-white text-[#9CA3AF]">Да</button><button className="min-w-[44px] h-9 px-3 rounded-xl text-[15px] font-semibold bg-red-500 text-white">Не</button><button className="min-w-[44px] h-9 px-3 rounded-xl text-[15px] font-semibold border border-[#E5E7EB] bg-white text-[#9CA3AF]">Не</button></div>
            </div>

          </div>
        </Section>

        <Section id="badges" title="Бейджове и пилюли">
          <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> В процес</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Завършено</span>
              <span className="text-[12px] font-semibold bg-[#0B1F3A] text-white rounded-full px-3 py-1">Препоръчано</span>
              <span className="text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">Насочено обучение</span>
              <span className="text-[12px] font-semibold bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5">Бързо упражнение</span>
              <span className="text-[12px] font-medium text-[#9CA3AF] bg-[#F3F4F6] rounded-full px-2.5 py-1">Не е започнато</span>
            </div>
          </div>
        </Section>

        <Section id="cards" title="Карти">
          <Sub title="Стандартна бяла карта">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-5"><p className="text-[18px] font-semibold text-[#111827] mb-1">Заглавие на карта</p><p className="text-[15px] text-[#4B5563]">Стандартен описателен текст. Универсален контейнер за всяко съдържание.</p></div>
            <p className="text-[12px] font-mono text-[#9CA3AF] mt-2 px-1">bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-6 py-5</p>
          </Sub>
          <Sub title="Карта с хедър / боди">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0"><FileText size={20} className="text-indigo-600" /></div><div className="flex-1"><h3 className="font-bold text-[#111827] text-[18px]">Заглавие</h3><p className="text-[#9CA3AF] text-[13px] mt-0.5">Субтайтъл</p></div></div>
              <div className="px-6 py-5"><p className="text-[15px] text-[#4B5563]">Тяло с описание и действия.</p></div>
            </div>
          </Sub>
          <Sub title="Информационни / Alert карти">
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4"><p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Ключово</p><p className="text-[15px] text-[#4B5563]">Indigo — ключови съвети, AI препоръки.</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4"><p className="text-[12px] font-bold text-amber-600 uppercase tracking-widest mb-1">Внимание</p><p className="text-[15px] text-amber-800">Amber — арбитраж, времеви предупреждения.</p></div>
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4"><p className="text-[12px] font-bold text-red-500 uppercase tracking-widest mb-1">Грешка</p><p className="text-[15px] text-red-700">Red — грешки при вход, мрежови грешки.</p></div>
            </div>
          </Sub>
          <Sub title="Score Chip (динамичен цвят)">
            <div className="flex gap-3 flex-wrap">
              <div className="bg-emerald-100 ring-1 ring-emerald-200 rounded-2xl px-5 py-3 flex flex-col items-center"><span className="text-4xl font-bold text-emerald-700">17</span><span className="text-[12px] text-emerald-700">/ 20</span><span className="text-[11px] font-semibold text-emerald-700 mt-0.5">Силен</span></div>
              <div className="bg-amber-100 ring-1 ring-amber-200 rounded-2xl px-5 py-3 flex flex-col items-center"><span className="text-4xl font-bold text-amber-700">13</span><span className="text-[12px] text-amber-700">/ 20</span><span className="text-[11px] font-semibold text-amber-700 mt-0.5">Добър</span></div>
              <div className="bg-orange-100 ring-1 ring-orange-200 rounded-2xl px-5 py-3 flex flex-col items-center"><span className="text-4xl font-bold text-orange-700">9</span><span className="text-[12px] text-orange-700">/ 20</span><span className="text-[11px] font-semibold text-orange-700 mt-0.5">Развиващ се</span></div>
              <div className="bg-red-100 ring-1 ring-red-200 rounded-2xl px-5 py-3 flex flex-col items-center"><span className="text-4xl font-bold text-red-700">5</span><span className="text-[12px] text-red-700">/ 20</span><span className="text-[11px] font-semibold text-red-700 mt-0.5">Нужна е работа</span></div>
            </div>
          </Sub>
        </Section>

        <Section id="forms" title="Форми">
          <Sub title="Инпут полета">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-4">
              <div><label className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Стандартен инпут</label><input readOnly value="" placeholder="Въведи текст..." className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-indigo-400" /><p className="text-[12px] font-mono text-[#9CA3AF] mt-1">rounded-2xl border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 focus:ring-2 focus:ring-indigo-400</p></div>
              <div><label className="block text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Textarea</label><textarea readOnly value="" rows={3} placeholder="Напиши отговора си тук..." className="w-full rounded-2xl border border-[#E5E7EB] px-3 py-2.5 text-[15px] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" /><p className="text-[12px] font-mono text-[#9CA3AF] mt-1">rounded-2xl border-[#E5E7EB] px-3 py-2.5 resize-none focus:ring-2 focus:ring-indigo-400</p></div>
            </div>
          </Sub>
        </Section>

        <Section id="organisms" title="Организми">
          <Sub title="PhaseBar — Прогрес лента на коучинга">
            <div className="bg-[#F0F2F5] px-4 pt-4 pb-4 rounded-3xl border border-[#E5E7EB]">
              <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center gap-3">
                <div className="shrink-0 relative w-10 h-10">
                  <svg width="40" height="40" className="-rotate-90">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#0B1F3A" strokeWidth="3" strokeDasharray={c} strokeDashoffset={d} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-[#0B1F3A]">3</span>
                </div>
                <div className="flex-1 min-w-0"><p className="text-[16px] font-bold text-[#111827] leading-tight">Човекът, когото най-много уважавам</p><p className="text-[12px] text-[#9CA3AF] mt-0.5">Пиши есето &middot; 3 от 6</p></div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {[0,1,2,3,4,5].map(i=>(<div key={i} className={i<2?"w-2 h-2 rounded-full bg-[#0B1F3A]":i===2?"w-2.5 h-2.5 rounded-full bg-[#0B1F3A]":"w-2 h-2 rounded-full bg-[#D1D5DB]"} />))}
                </div>
              </div>
            </div>
          </Sub>
          <Sub title="ModuleCard — Начален екран">
            <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0"><FileText size={22} className="text-indigo-600" /></div><div className="flex-1 min-w-0"><h2 className="font-bold text-[#111827] text-[18px]">Есе</h2><p className="text-[#9CA3AF] text-[13px] mt-0.5">Приемен изпит — Част 1</p></div></div>
              <div className="px-6 py-5 space-y-3"><p className="text-[15px] text-[#4B5563]">Напиши есе и получи честна оценка по критериите на АКС.</p><div className="flex items-center justify-center gap-2 w-full h-[52px] rounded-2xl bg-[#0B1F3A] text-white text-[15px] font-semibold shadow-md select-none">Напиши ново есе <ArrowRight size={16} /></div><div className="flex items-center justify-center w-full h-[50px] rounded-2xl bg-[#F3F4F6] text-[#6B7280] text-[15px] select-none">Виж предишни опити</div></div>
            </div>
          </Sub>
          <Sub title="ModeSelector карти">
            <div className="space-y-3">
              <div className="bg-white rounded-3xl border-2 border-[#E5E7EB] p-5"><div className="flex items-start gap-4"><div className="shrink-0 w-11 h-11 rounded-xl bg-[#F3F4F6] flex items-center justify-center"><Zap size={20} className="text-amber-500" /></div><div className="flex-1"><h3 className="font-semibold text-[#111827] text-[18px] mb-1">Бързо упражнение</h3><p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Пиши свободно, получи оценка</p><p className="text-[15px] text-[#6B7280]">Започни директно и получи оценка с обратна връзка.</p></div></div></div>
              <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 relative"><div className="absolute top-3.5 right-3.5"><span className="text-[12px] font-semibold bg-[#0B1F3A] text-white rounded-full px-3 py-1">Препоръчано</span></div><div className="flex items-start gap-4"><div className="shrink-0 w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center"><BookOpen size={20} className="text-indigo-600" /></div><div className="flex-1 pr-24"><h3 className="font-semibold text-[#111827] text-[18px] mb-1">Насочено обучение</h3><p className="text-[12px] font-semibold text-indigo-500 uppercase tracking-widest mb-2">Стъпка по стъпка</p><p className="text-[15px] text-[#6B7280]">Коуч те води през разбирането, планирането, писането и самопроверката.</p><div className="flex flex-wrap gap-1.5 mt-3">{["Разбери","Планирай","Пиши","Провери","Оценка","Размисли"].map(s=>(<span key={s} className="text-[12px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">{s}</span>))}</div></div></div></div>
            </div>
          </Sub>
          <Sub title="Езикова грешка карта">
            <div className="rounded-2xl border border-red-100 overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#F3F4F6] flex items-center gap-2"><span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 uppercase tracking-wide">Правопис</span></div>
              <div className="grid grid-cols-2 divide-x divide-[#F3F4F6]"><div className="px-4 py-3"><p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Оригинал</p><p className="text-[14px] text-red-600 line-through">грешна дума</p></div><div className="px-4 py-3"><p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Корекция</p><p className="text-[14px] text-emerald-700 font-semibold">правилна дума</p></div></div>
              <div className="px-4 py-2.5 bg-[#F9FAFB] border-t border-[#F3F4F6]"><p className="text-[13px] text-[#6B7280]">Кратко обяснение на грешката.</p></div>
            </div>
          </Sub>
        </Section>

        <div className="h-16" />
      </main>
    </div>
  );
}
