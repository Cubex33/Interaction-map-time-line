import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import type { EventItem } from './events';
import { buildings, makeModels } from './models';
import 'maplibre-gl/dist/maplibre-gl.css';
import FallbackMap from './FallbackMap';
import { cityStyle, cityBuildings, cityRoads, historicIds, cityCount } from './city';
interface Props { events: EventItem[]; selectedId: string; selected: EventItem; focus: number; onChoose: (e: EventItem) => void; pick: boolean; onPick: (lat: number, lng: number) => void; theme: 'dark' | 'light'; onTileError: () => void; year: number; modelId: string; construction: number | null; modelFocus: number; showModels: boolean; onModel: (id: string) => void; onRoutePanel?: (open: boolean) => void; routeRequest?: number; lang?: 'ru' | 'kk'; onTheme?: (t: 'dark' | 'light') => void }
export default function Map3D(props: Props) {
    const el = useRef<HTMLDivElement>(null), mapRef = useRef<maplibregl.Map | null>(null), latest = useRef(props); latest.current = props;
    const [cityVisible, setCityVisible] = useState(false);
    const [routeStatus, setRouteStatus] = useState('');
    const [routePanel, setRoutePanel] = useState(false);
    const [paramsOpen, setParamsOpen] = useState(false);
    const [view, setView] = useState({ pitch: 60, bearing: -22 });
    const paramsRef = useRef<HTMLDivElement>(null), panelRef = useRef<HTMLDivElement>(null), closeTimer = useRef(0);
    const [panelPos, setPanelPos] = useState<{ right: number; top: number; width: number; maxHeight: number } | null>(null);
    const tr = (ru: string, kk: string) => props.lang === 'kk' ? kk : ru;
    const [routeInfo, setRouteInfo] = useState<{ km: number; min: number } | null>(null);
    const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'bicycling' | 'transit'>('driving');
    const [lastPosition, setLastPosition] = useState<{lat:number;lng:number;accuracy:number} | null>(null);
    const [ready, setReady] = useState(false), [offline, setOffline] = useState(false), [fatal, setFatal] = useState(false);
    useEffect(() => {
        if (!el.current) return;
        let map: maplibregl.Map;
        try { map = new maplibregl.Map({ container: el.current, center: [80.25, 50.410], zoom: 14, pitch: 60, bearing: -22, maxPitch: 80, attributionControl: { compact: true }, style: cityStyle() }) } catch { setFatal(true); return }
        mapRef.current = map;
        map.on('style.load', () => {
            map.addSource('local-city', { type: 'geojson', data: cityBuildings });
            map.addSource('local-roads', { type: 'geojson', data: cityRoads });
            map.addLayer({ id: 'local-roads', type: 'line', source: 'local-roads', layout: { visibility: 'none' }, paint: { 'line-color': '#788b8f', 'line-width': 3 } });
            map.addLayer({ id: 'local-city', type: 'fill-extrusion', source: 'local-city', filter: ['!', ['in', ['get', 'osm_id'], ['literal', historicIds]]], layout: { visibility: 'none' }, paint: { 'fill-extrusion-color': '#c6cfc8', 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 1 } });
            map.addSource('models', { type: 'geojson', data: makeModels(2026, '', null, []) });
            map.addSource('user-location', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
            map.addLayer({ id: 'user-location-halo', type: 'circle', source: 'user-location', paint: { 'circle-radius': 13, 'circle-color': '#1687ff', 'circle-opacity': .22, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
            map.addLayer({ id: 'user-location-dot', type: 'circle', source: 'user-location', paint: { 'circle-radius': 6, 'circle-color': '#1687ff', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff' } });
            map.addSource('user-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
            map.addLayer({ id: 'user-route-line', type: 'line', source: 'user-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#f08a4b', 'line-width': 5, 'line-opacity': .92 } });
            map.addLayer({ id: 'buildings', type: 'fill-extrusion', source: 'models', paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': ['get', 'base'], 'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true } });
            map.setLight({ anchor: 'viewport', color: '#fff2d4', intensity: .55, position: [1.5, 200, 35] }); setReady(true);
        });
        map.on('error', e => { const source = (e as unknown as { sourceId?: string }).sourceId; if (source === 'openmaptiles' || /tiles.openfreemap.org/.test(e.error.message)) { setOffline(true); latest.current.onTileError() } });
        map.on('click', e => { if (latest.current.pick) { latest.current.onPick(+e.lngLat.lat.toFixed(6), +e.lngLat.lng.toFixed(6)); return } if (map.getLayer('buildings')) { const f = map.queryRenderedFeatures(e.point, { layers: ['buildings'] })[0]; if (f) { latest.current.onModel(String(f.properties.id)); return } const cityLayer = map.getLayer('local-city') && map.getLayer('building-3d') ? ['local-city', 'building-3d'] : []; if (cityLayer.length) { const hit = map.queryRenderedFeatures(e.point, { layers: cityLayer })[0]; if (hit) { const box = document.createElement('div'); box.style.color = '#233746'; const name = document.createElement('strong'); name.textContent = hit.properties.name || 'Здание OpenStreetMap'; const note = document.createElement('p'); note.textContent = (hit.properties.address || '') + ' · Высота: ' + (hit.properties.height ?? hit.properties.render_height ?? 6.4) + ' м. Высота из данных карты или расчётная; год постройки неизвестен.'; box.append(name, note); new maplibregl.Popup().setLngLat(e.lngLat).setDOMContent(box).addTo(map) } } } });
        const resize = new ResizeObserver(() => map.resize()); resize.observe(el.current);
        return () => { resize.disconnect(); map.remove(); mapRef.current = null };
    }, []);
    useEffect(() => { const map = mapRef.current; if (!map || !ready) return; const ids = props.showModels ? buildings.filter(b => props.events.some(e => e.id === b.eventId) || b.id === props.modelId).map(b => b.id) : []; (map.getSource('models') as maplibregl.GeoJSONSource).setData(makeModels(props.year, props.modelId, props.construction, ids)) }, [ready, props.year, props.modelId, props.construction, props.showModels, props.events]);
    useEffect(() => { const m = mapRef.current; if (!m) return; const markers = props.events.map(e => { const b = document.createElement('button'); b.className = 'pin3d' + (e.id === props.selectedId ? ' selected' : ''); b.style.setProperty('--pin', '#8b72ed'); b.textContent = String(e.year); b.style.fontSize = '10px'; b.title = e.title; b.onclick = ev => { ev.stopPropagation(); latest.current.onChoose(e) }; return new maplibregl.Marker({ element: b, anchor: 'bottom' }).setLngLat([e.lng, e.lat]).addTo(m) }); return () => markers.forEach(x => x.remove()) }, [props.events, props.selectedId]);
    useEffect(() => { if (props.focus) mapRef.current?.flyTo({ center: [props.selected.lng, props.selected.lat], zoom: 16.5, pitch: 60, duration: 1000, padding: window.innerWidth <= 760 ? { top: 0, left: 0, right: 0, bottom: Math.round(window.innerHeight * .34) } : { top: 0, left: 400, right: 0, bottom: 220 } }) }, [props.focus]);
    useEffect(() => { const b = buildings.find(x => x.id === props.modelId); if (b && props.modelFocus) mapRef.current?.flyTo({ center: [b.lng, b.lat], zoom: b.kind === 'bridge' ? 14.8 : b.kind === 'fort' ? 16.5 : 18, pitch: 62, bearing: b.angle, duration: 1100 }) }, [props.modelFocus]);
    useEffect(() => { if (props.modelFocus) setCityVisible(false) }, [props.modelFocus]);
    function showAllPlaces() { const m = mapRef.current; if (!m || !props.events.length) return; const bounds = new maplibregl.LngLatBounds(); props.events.forEach(e => bounds.extend([e.lng, e.lat])); m.fitBounds(bounds, { padding: { top: 100, bottom: 260, left: 80, right: 90 }, maxZoom: 14, duration: 1000 }); }
    function geoErrorMessage(error: GeolocationPositionError) {
        if (error.code === 1) return 'Доступ к геолокации запрещён. Разрешите его в настройках сайта и нажмите «Моё местоположение» ещё раз.';
        if (error.code === 2) return 'Не удалось определить координаты. Проверьте GPS/Wi-Fi и попробуйте снова.';
        if (error.code === 3) return 'Определение местоположения заняло слишком много времени. Попробуйте ещё раз.';
        return 'Не удалось определить местоположение.';
    }
    function getMyPosition(onSuccess: (position: GeolocationPosition) => void) {
        if (!window.isSecureContext) {
            setRouteStatus('Геолокация работает только на HTTPS или localhost. Откройте сайт по защищённому адресу.');
            return;
        }
        if (!navigator.geolocation) {
            setRouteStatus('Браузер не поддерживает геолокацию. Используйте актуальный Chrome, Edge или Firefox.');
            return;
        }
        setRouteStatus('Определяем местоположение по GPS/Wi-Fi…');
        // First request a fresh, high-accuracy reading. Do not silently substitute a guessed/IP location.
        navigator.geolocation.getCurrentPosition(onSuccess, error => {
            setRouteStatus(geoErrorMessage(error) + ' Проверьте разрешение геолокации и настройки точности устройства.');
        }, { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
    }
    function showMyLocation(position: GeolocationPosition, zoom = 16) {
        const origin = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
        setLastPosition(origin);
        const m = mapRef.current;
        const source = m?.getSource('user-location') as maplibregl.GeoJSONSource | undefined;
        source?.setData({ type: 'Feature', properties: { accuracy: origin.accuracy }, geometry: { type: 'Point', coordinates: [origin.lng, origin.lat] } });
        m?.flyTo({ center: [origin.lng, origin.lat], zoom: origin.accuracy > 500 ? 12 : zoom, pitch: 0, duration: 1000 });
        return origin;
    }
    useEffect(() => { props.onRoutePanel?.(routePanel); return () => props.onRoutePanel?.(false) }, [routePanel]);
    const firstReq = useRef(props.routeRequest ?? 0);
    useEffect(() => { if (!props.routeRequest || props.routeRequest === firstReq.current) return; setRoutePanel(true); buildRoute('driving') }, [props.routeRequest]);
    function closeRoute() {
        setRoutePanel(false); setRouteInfo(null); setRouteStatus('');
        (mapRef.current?.getSource('user-route') as maplibregl.GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: [] });
    }
    function fmtMin(min: number) { return min >= 60 ? `${Math.floor(min / 60)} ч ${min % 60} мин` : `${min} мин`; }
    function locateMe() {
        getMyPosition(position => {
            showMyLocation(position);
            const accuracy = Math.round(position.coords.accuracy);
            setRouteStatus(accuracy > 500
                ? `Местоположение определено неточно (погрешность около ${accuracy} м). Это может быть приблизительная позиция браузера. Включите точную геолокацию/GPS в настройках устройства.`
                : `Синяя точка — ваше местоположение · заявленная точность около ${accuracy} м.`);
        });
    }
    function openExternalRoute(mode: 'driving' | 'walking' | 'bicycling' | 'transit', origin?: {lat:number;lng:number}) {
        const destination = latest.current.selected;
        const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
        const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination.lat},${destination.lng}&travelmode=${mode}`;
        window.location.assign(url);
    }
    async function buildRoute(mode: 'driving' | 'walking' | 'bicycling' | 'transit' = travelMode) {
        setTravelMode(mode);
        setRouteInfo(null);
        const destination = latest.current.selected;
        getMyPosition(async position => {
            const origin = showMyLocation(position, 14);
            // Use a real routing engine for car routes; Google Maps Directions handles walking, cycling and transit with its live routing data. The browser navigates directly so popup blockers cannot silently cancel the route.
            if (mode !== 'driving') {
                setRouteStatus(mode === 'walking' ? 'Открываем маршрут пешком…' : mode === 'bicycling' ? 'Открываем велосипедный маршрут…' : 'Открываем маршрут на общественном транспорте…');
                openExternalRoute(mode, origin);
                return;
            }
            const m = mapRef.current;
            try {
                setRouteStatus('Строим автомобильный маршрут…');
                const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(12000) });
                if (!response.ok) throw new Error('route unavailable');
                const data = await response.json();
                if (data.code !== 'Ok' || !data.routes?.[0]?.geometry) throw new Error('route unavailable');
                const source = m?.getSource('user-route') as maplibregl.GeoJSONSource | undefined;
                source?.setData({ type: 'Feature', properties: {}, geometry: data.routes[0].geometry });
                const bounds = new maplibregl.LngLatBounds(); bounds.extend([origin.lng, origin.lat]); bounds.extend([destination.lng, destination.lat]);
                m?.fitBounds(bounds, { padding: { top: 140, bottom: 330, left: 60, right: 60 }, maxZoom: 15, duration: 1000 });
                setRouteInfo({ km: data.routes[0].distance / 1000, min: Math.max(1, Math.round(data.routes[0].duration / 60)) });
                setRouteStatus(`Автомобильный маршрут · ${(data.routes[0].distance / 1000).toFixed(1)} км · около ${Math.round(data.routes[0].duration / 60)} мин.`);
            } catch {
                setRouteInfo(null);
                setRouteStatus('Не удалось построить маршрут по дорогам (нет связи с сервисом). Можно открыть его в Google Maps.');
            }
        });
    }
    useEffect(() => { const m = mapRef.current; if (!m || !ready) return; for (const id of ['local-city', 'local-roads']) if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', offline && cityVisible ? 'visible' : 'none'); if (m.getLayer('building-3d')) m.setLayoutProperty('building-3d', 'visibility', !offline && cityVisible ? 'visible' : 'none'); const bg = m.getStyle().layers?.find(l => l.type === 'background'); if (bg) m.setPaintProperty(bg.id, 'background-color', props.theme === 'dark' ? '#233a47' : '#edf0e7') }, [ready, offline, cityVisible, props.theme]);

    useEffect(() => {
        if (!paramsOpen) return;
        const m = mapRef.current;
        const sync = () => { if (m) setView({ pitch: Math.round(m.getPitch()), bearing: Math.round(m.getBearing()) }) };
        sync(); m?.on('move', sync);
        const outside = (e: PointerEvent) => { const t = e.target as Node; if (!paramsRef.current?.contains(t) && !panelRef.current?.contains(t)) setParamsOpen(false) };
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setParamsOpen(false) };
        document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc);
        return () => { m?.off('move', sync); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc); window.clearTimeout(closeTimer.current) };
    }, [paramsOpen]);
    const openPanel = (e: { currentTarget: HTMLElement }) => { const r = e.currentTarget.getBoundingClientRect(); const top = Math.max(8, r.top); setPanelPos({ right: window.innerWidth - r.left + 10, top, width: Math.min(260, Math.max(200, r.left - 18)), maxHeight: window.innerHeight - top - 10 }); setParamsOpen(v => !v) };
    const hoverIn = () => window.clearTimeout(closeTimer.current);
    const hoverOut = (e: ReactPointerEvent) => { if (e.pointerType === 'mouse') { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setParamsOpen(false), 250) } };

    return <div className="map3d-root"><div className="map3d-map" ref={el} />{fatal && <FallbackMap key={props.modelId} cityVisible={cityVisible} year={props.year} id={props.modelId} progress={props.construction} show={props.showModels} events={props.events} onModel={props.onModel} onChoose={props.onChoose} pick={props.pick} onPick={props.onPick} />}<div className="map3d-tools" style={{ display: fatal ? 'none' : undefined }}><div className="params-wrap" ref={paramsRef} onPointerEnter={hoverIn} onPointerLeave={hoverOut}><button className={`t-toggle ${paramsOpen ? 'tool-active' : ''}`} title={tr('Дополнительные параметры', 'Қосымша параметрлер')} aria-haspopup="dialog" aria-expanded={paramsOpen} onClick={openPanel}>{paramsOpen ? '×' : '⋯'}</button>{paramsOpen && createPortal(<div className="map-params" ref={panelRef} style={panelPos ?? undefined} onPointerEnter={hoverIn} onPointerLeave={hoverOut} role="dialog" aria-label={tr('Параметры карты', 'Карта параметрлері')}><div className="mp-title">{tr('ДОПОЛНИТЕЛЬНО', 'ҚОСЫМША')}</div><div className="mp-actions"><button onClick={() => mapRef.current?.zoomIn()}><b>+</b>{tr('Приблизить', 'Жақындату')}</button><button onClick={() => mapRef.current?.zoomOut()}><b>−</b>{tr('Отдалить', 'Алыстату')}</button><button onClick={() => mapRef.current?.flyTo({ center: [80.25, 50.41], zoom: 14, pitch: 60 })}><b>⌂</b>{tr('Центр города', 'Қала орталығы')}</button><button onClick={() => { const m = mapRef.current; m?.easeTo({ bearing: m.getBearing() + 40 }) }}><b>↻</b>{tr('Повернуть', 'Бұру')}</button><button onClick={showAllPlaces}><b>◎</b>{tr('Все места', 'Барлық орындар')}</button></div><div className="mp-group"><span>{tr('Подложка', 'Карта негізі')}</span><div className="mp-seg">{(['light', 'dark'] as const).map(t => <label key={t} className={props.theme === t ? 'on' : ''}><input type="radio" name="map-theme" checked={props.theme === t} onChange={() => props.onTheme?.(t)} />{t === 'light' ? tr('Светлая', 'Жарық') : tr('Тёмная', 'Қараңғы')}</label>)}</div></div><label className="mp-switch"><span>{tr('Современная застройка', 'Қазіргі құрылыс')}</span><input type="checkbox" checked={cityVisible} onChange={e => setCityVisible(e.target.checked)} /><i /></label><label className="mp-switch"><span>{tr('Схема без интернета', 'Интернетсіз сызба')}</span><input type="checkbox" checked={offline} onChange={e => setOffline(e.target.checked)} /><i /></label><label className="mp-range"><span>{tr('Наклон', 'Көлбеу')}<b>{view.pitch}°</b></span><input type="range" min="0" max="80" value={view.pitch} onChange={e => { const v = +e.target.value; setView(s => ({ ...s, pitch: v })); mapRef.current?.setPitch(v) }} /></label><label className="mp-range"><span>{tr('Поворот', 'Бұру')}<b>{view.bearing}°</b></span><input type="range" min="-180" max="180" value={view.bearing} onChange={e => { const v = +e.target.value; setView(s => ({ ...s, bearing: v })); mapRef.current?.setBearing(v) }} /></label></div>, document.body)}</div><button title="Показать моё местоположение" onClick={locateMe}>⌖</button><button title="Построить маршрут от моего местоположения до выбранного места" onClick={() => { setRoutePanel(true); buildRoute('driving') }}>➤</button><button title="2D / 3D" onClick={() => { const m = mapRef.current; m?.easeTo({ pitch: m.getPitch() > 30 ? 0 : 60 }) }}>3D</button></div><button className="city-context" onClick={() => setCityVisible(v => !v)}>{cityVisible ? '▥ Современные дома: вкл.' : '▱ Современные дома: выкл.'}</button>{routePanel && <div className="route-sheet" role="dialog" aria-label="Маршрут"><div className="rs-grab" /><div className="rs-head"><div><strong>{props.selected.title}</strong><small>Маршрут до места · {props.selected.year}</small></div><button aria-label="Закрыть" onClick={closeRoute}>×</button></div><div className="rs-modes">{([{ id: 'driving', icon: '🚗', label: 'Авто' }, { id: 'walking', icon: '🚶', label: 'Пешком' }, { id: 'bicycling', icon: '🚲', label: 'Вело' }, { id: 'transit', icon: '🚌', label: 'Транспорт' }] as const).map(mode => <button key={mode.id} className={travelMode === mode.id ? 'active' : ''} onClick={() => { setTravelMode(mode.id); if (mode.id === 'driving') buildRoute('driving'); else { setRouteInfo(null); setRouteStatus(''); (mapRef.current?.getSource('user-route') as maplibregl.GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: [] }); } }}><span>{mode.icon}</span>{mode.label}</button>)}</div><div className="rs-summary">{routeInfo && travelMode === 'driving' ? <><b>{fmtMin(routeInfo.min)}</b><span>{routeInfo.km.toFixed(1)} км · по дорогам</span></> : <span className="rs-note">{routeStatus || (travelMode === 'driving' ? 'Строим маршрут…' : 'Маршрут откроется в Google Maps')}</span>}</div><div className="rs-actions"><button className="rs-go" onClick={() => { if (travelMode === 'driving') { if (routeInfo || routeStatus.startsWith('Не удалось')) openExternalRoute('driving', lastPosition ?? undefined); else buildRoute('driving') } else buildRoute(travelMode) }}>{travelMode === 'driving' ? (routeInfo ? 'Поехали' : routeStatus.startsWith('Не удалось') ? 'Открыть в Google Maps' : 'Строим…') : 'Построить маршрут'}</button><button className="rs-reset" onClick={closeRoute}>Сбросить</button></div></div>}{routeStatus && !routePanel && <div className="route-status" role="status">{routeStatus}<button onClick={() => { setRouteStatus(''); (mapRef.current?.getSource('user-route') as maplibregl.GeoJSONSource | undefined)?.setData({ type: 'FeatureCollection', features: [] }); }}>×</button></div>}<div className="map3d-hint">{fatal ? 'Без WebGL: резервная объёмная схема' : offline ? `Локальные контуры OSM: ${cityCount} зданий` : '3D-застройка OpenStreetMap / OpenFreeMap'} · Современные здания — фон, год постройки неизвестен{!fatal && ' · ПКМ: вращение'}</div></div>
}