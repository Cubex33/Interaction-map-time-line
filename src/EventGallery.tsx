import { useRef, useState } from 'react';
import { eventImages } from './eventImages';
import type { EventItem } from './events';

interface Props { event: EventItem; model?: { name: string; kind: string }; color: string; lang: 'ru' | 'kk' }

function Art({ kind, color }: { kind: string; color: string }) {
    const c = color, dark = 'rgba(8,10,9,.55)', light = 'rgba(255,255,255,.16)';
    return <svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id={'g' + kind} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".55" /><stop offset="1" stopColor="#101211" /></linearGradient></defs>
        <rect width="400" height="210" fill={'url(#g' + kind + ')'} />
        <circle cx="320" cy="52" r="26" fill="rgba(255,255,255,.18)" />
        {kind === 'fort' && <g fill={dark}><rect x="40" y="120" width="320" height="70" /><rect x="40" y="108" width="320" height="12" /><g>{Array.from({ length: 16 }).map((_, i) => <rect key={i} x={46 + i * 20} y="98" width="12" height="12" />)}</g><rect x="60" y="70" width="46" height="120" /><polygon points="52,70 83,38 114,70" /><rect x="294" y="70" width="46" height="120" /><polygon points="286,70 317,38 348,70" /><rect x="176" y="140" width="48" height="50" rx="24" fill="rgba(0,0,0,.4)" /></g>}
        {kind === 'culture' && <g fill={dark}><rect x="70" y="150" width="260" height="40" /><rect x="90" y="110" width="220" height="40" /><path d="M140 110 A60 60 0 0 1 260 110 Z" /><rect x="197" y="34" width="6" height="26" /><g fill={light}>{Array.from({ length: 6 }).map((_, i) => <rect key={i} x={108 + i * 34} y="120" width="14" height="30" rx="7" />)}</g></g>}
        {kind === 'trade' && <g><path d="M0 170 Q50 160 100 170 T200 170 T300 170 T400 170 V210 H0Z" fill="rgba(60,110,130,.55)" /><g fill={dark}><path d="M130 160 L290 160 L260 188 L160 188Z" /><rect x="205" y="70" width="5" height="90" /><path d="M210 74 L270 150 L210 150Z" /><path d="M200 82 L158 150 L200 150Z" fill="rgba(0,0,0,.35)" /><rect x="40" y="132" width="40" height="30" /><rect x="84" y="142" width="30" height="20" /></g></g>}
        {kind === 'memory' && <g fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2"><circle cx="200" cy="120" r="30" /><circle cx="200" cy="120" r="58" opacity=".7" /><circle cx="200" cy="120" r="88" opacity=".45" /><circle cx="200" cy="120" r="120" opacity=".25" /><circle cx="200" cy="120" r="6" fill="rgba(255,255,255,.7)" stroke="none" /></g>}
        {kind === 'bridge' && <g><path d="M0 178 Q50 170 100 178 T200 178 T300 178 T400 178 V210 H0Z" fill="rgba(60,110,130,.55)" /><g fill={dark}><rect x="40" y="86" width="14" height="94" /><rect x="346" y="86" width="14" height="94" /><rect x="0" y="150" width="400" height="8" /></g><path d="M47 88 Q200 190 353 88" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" /><g stroke="rgba(255,255,255,.3)" strokeWidth="1.5">{Array.from({ length: 15 }).map((_, i) => { const x = 70 + i * 19; const t = (x - 47) / 306; const y = 88 + 4 * 51 * t * (1 - t) * 1.0; return <line key={i} x1={x} y1={y} x2={x} y2="150" /> })}</g></g>}
    </svg>;
}

export default function EventGallery({ event, model, color, lang }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [idx, setIdx] = useState(0);
    const photos = eventImages[event.id] || [];
    const kind = model?.kind === 'bridge' ? 'bridge' : event.icon === 'culture' || event.icon === 'fort' || event.icon === 'trade' || event.icon === 'memory' ? event.icon : 'fort';
    const slides: JSX.Element[] = photos.map((src, i) => <div className="gal-slide" key={'p' + i}><img src={src} alt={event.title} loading="lazy" referrerPolicy="no-referrer" onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }} /></div>);
    if (!photos.length) {
        slides.push(<div className="gal-slide" key="art"><Art kind={kind} color={color} /></div>);
        if (model) slides.push(<div className="gal-slide gal-3d" key="3d"><div><b>◈ 3D</b><strong>{model.name}</strong><span>{lang === 'kk' ? 'Құрылыс кезеңдерін «Сәулет» бөлімінде көріңіз' : 'Этапы строительства — во вкладке «Архитектура»'}</span></div></div>);
    }
    return <div className="gallery">
        <div className="gal-track" ref={ref} onScroll={e => { const el = e.currentTarget; setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))) }}>{slides}</div>
        {slides.length > 1 && <div className="gal-dots">{slides.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</div>}
    </div>;
}
