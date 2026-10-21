import { useEffect, useMemo, useRef, useState } from 'react';
import Map3D from './Map3D';
import EventGallery from './EventGallery';
import ConstructionPanel from './ConstructionPanel';
import { buildings } from './models';
import { CalendarDays, Landmark, BookOpen, Globe2, Plus, Search, X, ChevronLeft, Play, Pause, Filter, MapPin, LocateFixed, Trash2, Pencil, Download, Upload, Info, Menu, ExternalLink, RotateCcw, Check, Layers, Navigation } from 'lucide-react';
import { seededEvents, type EventItem, type Category } from './events';
import { kkEvents } from './eventTranslations';
const KEY = 'semey-history-custom-v1';

const UI_KK: Record<string, string> = {
  "ИСТОРИЯ СОБЫТИЯ": "ОҚИҒА ТАРИХЫ",
  "Добавить событие": "Оқиға қосу",
  "Абайская область": "Абай облысы",
  "О ГОРОДЕ": "ҚАЛА ТУРАЛЫ",
  "Семей — город на Иртыше, важный культурный и исторический центр Казахстана. История города ведётся с 1718 года.": "Семей — Ертіс бойындағы, Қазақстанның маңызды мәдени және тарихи орталығы. Қала тарихы 1718 жылдан басталады.",
  "ВЫБРАННОЕ СОБЫТИЕ": "ТАҢДАЛҒАН ОҚИҒА",
  "Рассмотреть 3D-модель": "3D-модельді қарау",
  "КООРДИНАТЫ": "КООРДИНАТТАР",
  "Точка привязана к известному объекту / введена пользователем.": "Нүкте белгілі нысанға байланыстырылған / пайдаланушы енгізген.",
  "Точка ориентировочная или символическая; не является подтверждённым историческим адресом.": "Нүкте шамамен немесе шартты түрде көрсетілген; расталған тарихи мекенжай емес.",
  "Семей сквозь века": "Ғасырлар бойындағы Семей",
  "Выбирайте события на карте или нижней временной шкале. Используйте фильтры, поиск и прокрутку годов. Свои события сохраняются в этом браузере.": "Картадан немесе төмендегі уақыт шкаласынан оқиғаларды таңдаңыз. Сүзгілерді, іздеуді және жылдар жолағын пайдаланыңыз. Өз оқиғаларыңыз осы браузерде сақталады.",
  "Источник события": "Оқиға дереккөзі",
  "Новое событие": "Жаңа оқиға",
  "ЛЕГЕНДА": "ШАРТТЫ БЕЛГІЛЕР",
  "Некоторые точки на карте обозначены условно.": "Картадағы кейбір нүктелер шартты түрде көрсетілген.",
  "Поиск по событиям...": "Оқиғаларды іздеу...",
  "Все": "Барлығы",
  "Сбросить фильтры": "Сүзгілерді тазарту",
  "объект": "нысан",
  "условная точка": "шартты нүкте",
  "область Абай": "Абай облысы",
  "Источник": "Дереккөз",
  "Добавлено пользователем": "Пайдаланушы қосты",
  "ЛЕНТА ВРЕМЕНИ": "УАҚЫТ ЖОЛАҒЫ",
  "С начала": "Басынан",
  "Воспроизвести": "Ойнату",
  "Пауза": "Үзіліс",
  "Нет событий для выбранного периода и фильтров. Измените год или параметры поиска.": "Таңдалған кезең мен сүзгілерге сай оқиғалар жоқ. Жылды немесе іздеу параметрлерін өзгертіңіз.",
  "МОЯ ИСТОРИЯ СЕМЕЯ": "МЕНІҢ СЕМЕЙ ТАРИХЫМ",
  "Редактировать событие": "Оқиғаны өңдеу",
  "Название *": "Атауы *",
  "Название события": "Оқиға атауы",
  "Год *": "Жыл *",
  "Категория": "Санат",
  "Краткая подпись": "Қысқаша тақырып",
  "Например: важный этап развития города": "Мысалы: қала дамуының маңызды кезеңі",
  "Описание *": "Сипаттама *",
  "Что произошло и почему это важно?": "Не болды және бұл неліктен маңызды?",
  "Широта *": "Ендік *",
  "Долгота *": "Бойлық *",
  "Можно ввести координаты вручную или выбрать точку на карте.": "Координаттарды қолмен енгізуге немесе картадан нүкте таңдауға болады.",
  "◎ Выбрать точку на карте": "◎ Картадан нүкте таңдау",
  "Ссылка на источник": "Дереккөз сілтемесі",
  "Отмена": "Болдырмау",
  "Сохранить изменения": "Өзгерістерді сақтау",
  "Выбрать точку на карте": "Картадан нүкте таңдау",
  "Нажмите на нужное место карты, чтобы выбрать координаты.": "Координаттарды таңдау үшін картадағы қажетті орынды басыңыз.",
  "Часть онлайн-данных недоступна. Включены встроенные контуры центра и района моста.": "Онлайн деректердің бір бөлігі қолжетімсіз. Орталық пен көпір маңының кіріктірілген контурлары қосылды.",
  "Поменять картографическую подложку": "Карта негізін ауыстыру",
  "3D тёмная": "3D қараңғы",
  "3D светлая": "3D жарық",
  "Заполните название, описание, целый год (1718–2026) и корректные координаты.": "Атауды, сипаттаманы, толық жылды (1718–2026) және дұрыс координаттарды толтырыңыз.",
  "Не удалось прочитать JSON. Проверьте структуру файла.": "JSON файлын оқу мүмкін болмады. Файл құрылымын тексеріңіз.",
  "Не удалось сохранить: хранилище браузера недоступно. Экспортируйте события в JSON.": "Сақтау мүмкін болмады: браузер қоймасы қолжетімсіз. Оқиғаларды JSON форматына экспорттаңыз."
};

const categories: Category[] = ['Город', 'Культура', 'Торговля', 'Память'];
const themes: Record<Category, string> = { 'Город': '#a765ff', 'Культура': '#4f90ff', 'Торговля': '#efa946', 'Память': '#11cb83' };
const icons: Record<Category, string> = { 'Город': '♜', 'Культура': '✦', 'Торговля': '◆', 'Память': '✳' };
function loadSaved(): EventItem[] { try { const d = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(d) ? d.filter(x => x && x.custom && typeof x.title === 'string' && typeof x.description === 'string' && categories.includes(x.category) && Number.isFinite(x.year) && Number.isFinite(x.lat) && Number.isFinite(x.lng)) : [] } catch { return [] } }
type FormState = { title: string; year: string; category: Category; subtitle: string; description: string; lat: string; lng: string; source: string };
const blank: FormState = { title: '', year: '', category: 'Город', subtitle: '', description: '', lat: '50.411', lng: '80.251', source: '' };
function App() {
    const [lang, setLang] = useState<'ru' | 'kk'>(() => (localStorage.getItem('semey-history-lang') as 'ru' | 'kk') || 'ru');
    useEffect(() => { localStorage.setItem('semey-history-lang', lang); document.documentElement.lang = lang === 'kk' ? 'kk' : 'ru'; }, [lang]);
    const tr = (ru: string, kk?: string) => lang === 'kk' ? (kk || UI_KK[ru] || ru) : ru;
    const [modelId, setModelId] = useState('bridge');
    const [construction, setConstruction] = useState<number | null>(null);
    const [buildingPlay, setBuildingPlay] = useState(false);
    const [modelFocus, setModelFocus] = useState(0);
    const [showModels, setShowModels] = useState(true);
    useEffect(() => { if (!buildingPlay) return; const t = window.setInterval(() => setConstruction(p => { const n = (p ?? 0) + .008; return Math.min(1, n) }), 60); return () => clearInterval(t) }, [buildingPlay]);
    useEffect(() => { if (construction === 1) setBuildingPlay(false) }, [construction]);
    function selectModel(id: string) { setModelId(id); setConstruction(null); setBuildingPlay(false); setShowModels(true); setModelFocus(n => n + 1); setDetails(false) }
    const [saved, setSaved] = useState<EventItem[]>(loadSaved);
    const [selectedId, setSelectedId] = useState('b11');
    const [year, setYear] = useState(2026);
    const [category, setCategory] = useState<string>('Все');
    const [query, setQuery] = useState('');
    const [details, setDetails] = useState(false);
    const [routeOpen, setRouteOpen] = useState(false);
    const [tab, setTab] = useState<'timeline' | 'arch'>('timeline');
    const [routeReq, setRouteReq] = useState(0);
    useEffect(() => { const t = window.setTimeout(() => document.getElementById('ev-' + selectedId)?.scrollIntoView({ inline: 'center', block: 'nearest' }), 400); return () => clearTimeout(t) }, []);
    const [desktop, setDesktop] = useState(() => window.innerWidth > 760);
    useEffect(() => { const f = () => setDesktop(window.innerWidth > 760); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, []);
    const [sidebar, setSidebar] = useState(() => window.innerWidth > 760);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(blank);
    const [pick, setPick] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [focus, setFocus] = useState(0);
    const [legend, setLegend] = useState(false);
    const [tileProvider, setTileProvider] = useState<'dark' | 'light'>('light');
    const [tileError, setTileError] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const rail = useRef<HTMLDivElement>(null);
    const all = useMemo(() => [...seededEvents, ...saved].map(e => lang === 'kk' ? { ...e, ...(kkEvents[e.id] || {}) } : e).sort((a, b) => a.year - b.year || a.title.localeCompare(b.title)), [saved, lang]);
    const filtered = useMemo(() => all.filter(e => e.year <= year && (category === 'Все' || e.category === category) && (`${e.title} ${e.subtitle} ${e.description} ${e.year}`.toLowerCase().includes(query.toLowerCase()))), [all, year, category, query]);
    const selected = all.find(e => e.id === selectedId) || all[0];
    useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { setError('Не удалось сохранить: хранилище браузера недоступно. Экспортируйте события в JSON.') } }, [saved]);
    useEffect(() => { if (!playing) return; const t = window.setInterval(() => setYear(y => Math.min(2026, y + .1)), 80); return () => clearInterval(t) }, [playing]);
    useEffect(() => { if (year >= 2026) setPlaying(false) }, [year]);
    function choose(e: EventItem) { setPlaying(false); setBuildingPlay(false); setConstruction(null); setSelectedId(e.id); setYear(e.year); setDetails(true); setFocus(n => n + 1); setTimeout(() => document.getElementById('ev-' + e.id)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 80) }
    function adjacent(direction: number) { const i = filtered.findIndex(e => e.id === selectedId); if (!filtered.length) return; choose(filtered[(i + direction + filtered.length) % filtered.length]) }
    function openAdd(e?: EventItem) { setPlaying(false); setError(''); setEditing(e?.custom ? e.id : null); setForm(e ? { title: e.title, year: String(e.year), category: e.category, subtitle: e.subtitle, description: e.description, lat: String(e.lat), lng: String(e.lng), source: e.source } : blank); setModal(true) }
    function saveForm() { const y = Number(form.year), lat = Number(form.lat), lng = Number(form.lng); if (!form.title.trim() || !form.description.trim() || !form.year.trim() || !Number.isInteger(y) || y < 1718 || y > 2026 || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) { setError('Заполните название, описание, целый год (1718–2026) и корректные координаты.'); return } const e: EventItem = { id: editing || 'u' + Date.now(), title: form.title.trim(), year: y, category: form.category, subtitle: form.subtitle.trim() || 'Добавлено пользователем', description: form.description.trim(), lat, lng, source: form.source.trim(), precise: true, custom: true, icon: 'custom' }; setSaved(old => editing ? old.map(x => x.id === editing ? e : x) : [...old, e]); setYear(Math.max(year, y)); setSelectedId(e.id); setDetails(true); setFocus(n => n + 1); setModal(false); setPick(false) }
    function remove(e: EventItem) { if (!e.custom || !window.confirm(`Удалить событие «${e.title}»?`)) return; setSaved(old => old.filter(x => x.id !== e.id)); setSelectedId('b0'); setDetails(false) }
    function exportJson() { const b = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'semey-my-events.json'; a.click(); URL.revokeObjectURL(u) }
    async function importJson(f?: File) { if (!f) return; try { const data = JSON.parse(await f.text()); if (!Array.isArray(data)) throw Error(); const valid = data.filter((e: any) => e && typeof e.title === 'string' && typeof e.description === 'string' && Number.isInteger(e.year) && e.year >= 1718 && e.year <= 2026 && Number.isFinite(e.lat) && Math.abs(e.lat) <= 90 && Number.isFinite(e.lng) && Math.abs(e.lng) <= 180 && categories.includes(e.category)).map((e: any, i: number) => ({ id: 'import' + Date.now() + i, title: String(e.title), description: String(e.description), year: e.year, lat: e.lat, lng: e.lng, category: e.category as Category, subtitle: String(e.subtitle || 'Импортировано'), source: String(e.source || ''), precise: true, icon: 'custom', custom: true })); if (!valid.length) throw Error(); setSaved(old => [...old, ...valid]); alert(`Импортировано событий: ${valid.length}`) } catch { alert('Не удалось прочитать JSON. Проверьте структуру файла.') } finally { if (fileRef.current) fileRef.current.value = '' } }
    const sidebarWas = useRef(false);
    useEffect(() => { if (!desktop) return; if (details) setSidebar(s => { sidebarWas.current = s; return false }); else if (sidebarWas.current) { sidebarWas.current = false; setSidebar(true) } }, [details, desktop]);
    const filtersEl = <div className="filters"><div className="search"><Search size={16} /><input aria-label="Поиск событий" placeholder={tr("Поиск по событиям...")} value={query} onChange={e => setQuery(e.target.value)} />{query && <button onClick={() => setQuery('')} aria-label={tr("Очистить поиск", "Іздеуді тазарту")}><X size={14} /></button>}</div><div className="select-wrap"><Filter size={14} /><select aria-label={tr("Категория")} value={category} onChange={e => setCategory(e.target.value)}><option>{tr("Все")}</option>{categories.map(c => <option key={c} value={c}>{tr(c, ({ Город: 'Қала', Культура: 'Мәдениет', Торговля: 'Сауда', Память: 'Естелік' } as Record<string,string>)[c])}</option>)}</select></div><button className="reset" title={tr("Сбросить фильтры")} onClick={() => { setCategory('Все'); setQuery(''); setYear(2026); setPlaying(false) }}><RotateCcw size={16} /></button></div>;
    const constructionPanel = <ConstructionPanel lang={lang} year={year} id={modelId} progress={construction} playing={buildingPlay} visible={showModels} onSelect={selectModel} onProgress={v => { setConstruction(v); setBuildingPlay(false); setShowModels(true) }} onPlay={() => { setPlaying(false); setShowModels(true); setModelFocus(n => n + 1); if (!buildingPlay) setConstruction(v => v === null || v >= 1 ? 0 : v); setBuildingPlay(v => !v) }} onVisible={() => setShowModels(v => !v)} onYear={y => { setYear(y); setConstruction(null); setBuildingPlay(false); setModelFocus(n => n + 1) }} />;
    return <div className="app-shell">
        <aside className={`sidebar ${sidebar ? '' : 'closed'}`}>
            <div className="cover"><div className="cover-top"><div className="logo"><Landmark size={18} /> SEMEY <b>HISTORY</b></div><button className="icon-btn" aria-label="Закрыть панель" onClick={() => setSidebar(false)}><X size={18} /></button></div><div className="cover-bottom"><span className="tiny"><CalendarDays size={13} /> {selected.year} {tr('год', 'жыл')} <MapPin size={13} /> Семей · Казахстан</span><h1>{selected.title}</h1></div></div>
            <div className="sidebar-scroll"><div className="hero-actions"><button onClick={() => setDetails(true)} className="purple"><Globe2 size={15} /> ИСТОРИЯ СОБЫТИЯ</button><button onClick={() => openAdd()} className="teal"><Plus size={15} /> ДОБАВИТЬ</button></div><div className="chips"><span>{tr("Абайская область")}</span><span>{tr(selected.category, ({ Город: "Қала", Культура: "Мәдениет", Торговля: "Сауда", Память: "Естелік" } as Record<string,string>)[selected.category])}</span></div><div className="architecture-strip" aria-label="Типы исторических сооружений"><div className="architecture-title">{tr("ИСТОРИЧЕСКАЯ АРХИТЕКТУРА", "ТАРИХИ СӘУЛЕТ")}</div><div className="architecture-items"><div className="architecture-item"><img src="/gate-icon.png" alt="" /><span>{tr("Ворота", "Қақпа")}</span></div><div className="architecture-item"><img src="/dome-icon.png" alt="" /><span>{tr("Купол", "Күмбез")}</span></div><div className="architecture-item"><img src="/fortification-icon.png" alt="" /><span>{tr("Крепость", "Бекініс")}</span></div><div className="architecture-item"><img src="/bridge-icon.png" alt="" /><span>{tr("Мост", "Көпір")}</span></div></div></div>{desktop && constructionPanel}<div className="side-box"><h3><Globe2 size={15} /> О ГОРОДЕ</h3><p>{tr("Семей — город на Иртыше, важный культурный и исторический центр Казахстана. История города ведётся с 1718 года.")}</p></div><div className="side-box"><h3><BookOpen size={15} /> ВЫБРАННОЕ СОБЫТИЕ</h3><p>{selected.description}</p></div><div className="side-box">{buildings.filter(b => b.eventId === selectedId).map(b => <button className="purple" key={b.id} onClick={() => selectModel(b.id)}>◈ Рассмотреть 3D-модель</button>)}</div><div className="side-box"><h3><Info size={15} /> КООРДИНАТЫ</h3><p>{selected.lat.toFixed(4)}° с. ш. · {selected.lng.toFixed(4)}° в. д.</p><small>{selected.precise ? 'Точка привязана к известному объекту / введена пользователем.' : 'Точка ориентировочная или символическая; не является подтверждённым историческим адресом.'}</small></div><div className="about-text"><h3>{tr("Семей сквозь века")}</h3><p>{tr("Выбирайте события на карте или нижней временной шкале. Используйте фильтры, поиск и прокрутку годов. Свои события сохраняются в этом браузере.")}</p>{selected.source && <a href={/^https?:\/\//i.test(selected.source) ? selected.source : undefined} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> Источник события</a>}</div></div>
        </aside>
        {!sidebar && <button className="reopen" onClick={() => setSidebar(true)} aria-label="Открыть панель"><Menu size={19} /></button>}
        <main className={`map-main tab-${tab} ${routeOpen ? 'routing' : ''} ${details && !routeOpen ? 'has-info' : ''}`}><Map3D routeRequest={routeReq} onRoutePanel={setRouteOpen} year={year} modelId={modelId} construction={construction} modelFocus={modelFocus} showModels={showModels} onModel={selectModel} events={all} selectedId={selectedId} selected={selected} focus={focus} onChoose={choose} pick={pick && modal} onPick={(lat, lng) => { setForm(f => ({ ...f, lat: String(lat), lng: String(lng) })); setPick(false); setModal(true) }} theme={tileProvider} onTileError={() => setTileError(true)} onTheme={t => { setTileProvider(t); setTileError(false) }} lang={lang} />
            {!desktop && constructionPanel}
            {pick && <div className="pick-banner">Нажмите на нужное место карты, чтобы выбрать координаты. <button onClick={() => setPick(false)}>{tr("Отмена")}</button></div>}
            <div className="map-vignette" />
            <div className="map-provider"><button onClick={() => { setTileProvider(p => p === 'dark' ? 'light' : 'dark'); setTileError(false) }} title={tr("Поменять картографическую подложку")}><Layers size={15} /> {tileProvider === 'dark' ? tr('3D тёмная') : tr('3D светлая')} ↻</button>{tileError && <span>{tr("Часть онлайн-данных недоступна. Включены встроенные контуры центра и района моста.")}</span>}</div>
            <div className="topbar"><div className="top-left"><span className="city-tag"><MapPin size={14} /> СЕМЕЙ, КАЗАХСТАН</span><button className="top-add" onClick={() => openAdd()}><Plus size={16} /> Новое событие</button></div>{desktop && filtersEl}<div className="top-right"><button className="legend-button" onClick={() => setLang(lang === "ru" ? "kk" : "ru")} title={tr("Тілді ауыстыру / Сменить язык", "Тілді ауыстыру / Сменить язык")}>{lang === "ru" ? "ҚАЗ" : "РУС"}</button><button className="square" aria-label={tr("Предыдущее событие", "Алдыңғы оқиға")} onClick={() => adjacent(-1)}><ChevronLeft size={19} /></button><span className="date-chip"><CalendarDays size={16} /> 1718 – {Math.floor(year)}</span><button className="legend-button" onClick={() => setLegend(!legend)}><Info size={15} /> ЛЕГЕНДА</button>{legend && <div className="legend-pop">{categories.map(c => <div key={c}><i style={{ background: themes[c] }} />{tr(c, ({ Город: 'Қала', Культура: 'Мәдениет', Торговля: 'Сауда', Память: 'Естелік' } as Record<string,string>)[c])}</div>)}<small>{tr("Некоторые точки на карте обозначены условно.")}</small></div>}</div></div>
            {!desktop && filtersEl}
            {details && selected && !routeOpen && !desktop && <div className="event-dialog"><button className="event-close" onClick={() => setDetails(false)}><X size={18} /></button><div className="dialog-meta"><span><CalendarDays size={13} /> {selected.year} {tr('год', 'жыл')}</span><span className="dot-color" style={{ color: themes[selected.category] }}>● {tr(selected.category, ({ Город: 'Қала', Культура: 'Мәдениет', Торговля: 'Сауда', Память: 'Естелік' } as Record<string,string>)[selected.category])}</span></div><h2>{selected.title}</h2><p className="dialog-subtitle">{selected.subtitle}</p><div className="hr" /><p className="dialog-desc">{selected.description}</p><div className="place-line"><MapPin size={15} /> Семей / область Абай <span>{selected.precise ? '● объект' : '● условная точка'}</span></div><div className="hr" /><div className="dialog-footer">{selected.source ? <a href={/^https?:\/\//i.test(selected.source) ? selected.source : undefined} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Источник</a> : <span>{tr("Добавлено пользователем")}</span>}{selected.custom && <div className="dialog-actions"><button onClick={() => openAdd(selected)} title={tr("Изменить", "Өңдеу")}><Pencil size={16} /></button><button onClick={() => remove(selected)} title={tr("Удалить", "Жою")}><Trash2 size={16} /></button></div>}</div></div>}
            {!routeOpen && <div className="timeline"><div className="timeline-toolbar"><div className="timeline-caption"><CalendarDays size={15} /> ЛЕНТА ВРЕМЕНИ <span>{filtered.length} {tr('событий', 'оқиға')}</span></div><div className="timeline-options"><button onClick={() => { setPlaying(false); setYear(1718); setConstruction(null); setBuildingPlay(false) }}>{tr("С начала")}</button><button onClick={() => { if (!playing) { setConstruction(null); setBuildingPlay(false); if (year >= 2026) setYear(buildings.find(b => b.id === modelId)!.start); setModelFocus(n => n + 1) } setPlaying(!playing) }} className="play">{playing ? <Pause size={14} /> : <Play size={14} />} {playing ? tr('Пауза') : tr('Воспроизвести')}</button><button onClick={exportJson} title={tr("Экспорт своих событий", "Өз оқиғаларын экспорттау")}><Download size={16} /></button><button onClick={() => fileRef.current?.click()} title={tr("Импорт событий", "Оқиғаларды импорттау")}><Upload size={16} /></button><input hidden type="file" ref={fileRef} accept="application/json,.json" onChange={e => importJson(e.target.files?.[0])} /></div></div><div className="year-slider"><span>1718</span><input aria-label="Год временной шкалы" type="range" min="1718" max="2026" step="0.01" value={year} onChange={e => { setPlaying(false); setYear(Number(e.target.value)); setConstruction(null); setBuildingPlay(false) }} /><span>{Math.floor(year)}</span></div><div className="timeline-rail" ref={rail}>{filtered.length ? filtered.map(e => <button id={'ev-' + e.id} key={e.id} className={`event-tile ${selectedId === e.id ? 'active' : ''}`} onClick={() => choose(e)}><div className="tile-top"><span className="tile-symbol" style={{ color: themes[e.category] }}>{icons[e.category]}</span><b>{e.year}</b></div><strong>{e.title}</strong><small>{e.subtitle}</small></button>) : <div className="empty">{tr("Нет событий для выбранного периода и фильтров. Измените год или параметры поиска.")}</div>}</div></div>}
            {details && selected && !routeOpen && (() => { const model = buildings.find(b => b.eventId === selected.id); const catKk = ({ Город: 'Қала', Культура: 'Мәдениет', Торговля: 'Сауда', Память: 'Естелік' } as Record<string, string>)[selected.category]; return <section className="info-sheet" aria-label="Информация о событии"><EventGallery key={selected.id} event={selected} model={model} color={themes[selected.category]} lang={lang} /><button className="info-close" aria-label="Закрыть" onClick={() => setDetails(false)}><X size={18} /></button><div className="info-body"><div className="info-meta"><span><CalendarDays size={13} /> {selected.year} {tr('год', 'жыл')}</span><span style={{ color: themes[selected.category] }}>● {tr(selected.category, catKk)}</span></div><h2>{selected.title}</h2><p className="info-sub">{selected.subtitle}</p><p className="info-desc">{selected.description}</p><div className="info-place"><MapPin size={14} /> Семей / область Абай <span>{selected.precise ? '● объект' : '● условная точка'}</span></div><div className="info-foot">{selected.source ? <a href={/^https?:\/\//i.test(selected.source) ? selected.source : undefined} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> {tr('Источник', 'Дереккөз')}</a> : <span>{tr('Добавлено пользователем')}</span>}{selected.custom && <span className="info-edit"><button onClick={() => openAdd(selected)}><Pencil size={15} /></button><button onClick={() => remove(selected)}><Trash2 size={15} /></button></span>}</div></div><div className="info-actions"><button className="go" onClick={() => setRouteReq(n => n + 1)}><Navigation size={18} /> {tr('Маршрут', 'Бағыт')}</button><button className={model ? '' : 'dim'} onClick={() => { if (model) selectModel(model.id); setDetails(false); setTab('arch'); setModelFocus(n => n + 1) }}><Landmark size={18} /> {tr('Архитектура', 'Сәулет')}</button></div></section> })()}
            {!routeOpen && !details && <nav className="m-tabs" aria-label="Разделы"><button className={tab === 'timeline' ? 'on' : ''} onClick={() => setTab('timeline')}><CalendarDays size={21} /><span>{tr('Лента', 'Лента')}</span></button><button className={tab === 'arch' ? 'on' : ''} onClick={() => { setTab('arch'); setModelFocus(n => n + 1) }}><Landmark size={21} /><span>{tr('Архитектура', 'Сәулет')}</span></button></nav>}
        </main>
        {modal && !pick && <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !pick) { setModal(false) } }}><section className="form-modal"><header><div><span className="eyebrow">{tr("МОЯ ИСТОРИЯ СЕМЕЯ")}</span><h2>{editing ? tr('Редактировать событие') : tr('Добавить событие')}</h2></div><button onClick={() => { setModal(false); setPick(false) }}><X size={20} /></button></header><div className="form-body"><label>{tr("Название *")}<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={tr("Название события")} /></label><div className="field-row"><label>{tr("Год *")}<input type="number" min="1718" max="2026" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></label><label>{tr("Категория")}<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>{categories.map(c => <option key={c} value={c}>{tr(c, ({ Город: 'Қала', Культура: 'Мәдениет', Торговля: 'Сауда', Память: 'Естелік' } as Record<string,string>)[c])}</option>)}</select></label></div><label>{tr("Краткая подпись")}<input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder={tr("Например: важный этап развития города")} /></label><label>{tr("Описание *")}<textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={tr("Что произошло и почему это важно?")} /></label><div className="field-row"><label>{tr("Широта *")}<input type="number" step="any" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} /></label><label>{tr("Долгота *")}<input type="number" step="any" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} /></label></div><p className="form-hint"><LocateFixed size={14} /> Можно ввести координаты вручную или выбрать точку на карте.</p><button type="button" className="pick-coordinates" onClick={() => setPick(true)}>{tr("◎ Выбрать точку на карте")}</button><label>{tr("Ссылка на источник")}<input type="url" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="https://..." /></label>{error && <p className="error">{error}</p>}</div><footer><button className="cancel" onClick={() => { setModal(false); setPick(false) }}>{tr("Отмена")}</button><button className="submit" onClick={saveForm}><Check size={17} /> {editing ? tr('Сохранить изменения') : tr('Добавить событие')}</button></footer></section></div>}
    </div>
}
export default App;