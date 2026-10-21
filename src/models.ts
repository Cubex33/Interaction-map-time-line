import footprints from './historic-footprints.json';
import type { Feature, Polygon, FeatureCollection } from 'geojson';
export type ModelKind = 'fort' | 'house' | 'museum' | 'bridge';
export type Building = { id: string; eventId: string; name: string; lng: number; lat: number; kind: ModelKind; start: number; end: number; angle: number; note: string };
export const buildings: Building[] = [
    { id: 'stepanov', eventId: 'b5', name: 'Дом купца Степанова', lng: 80.2535237, lat: 50.401941675, kind: 'museum', start: 1870, end: 1871, angle: 25, note: 'Контур OSM №426769886, Пушкина, 108. Положение по зданию музея; детализация исторического корпуса и высота требуют обмеров. 1870-е — датировка источников; этапы демонстрационные.' },
    { id: 'dostoevsky', eventId: 'b4', name: 'Дом Достоевского', lng: 80.25218961666667, lat: 50.40441403333333, kind: 'house', start: 1857, end: 1858, angle: 25, note: 'Контур OSM №44085709, Достоевского, 118; совпадает с музейной точкой OSM. 1857 — проживание, не строительство. Контур включает современный комплекс; этапы демонстрационные.' },
    { id: 'moldabaev', eventId: 'b6', name: 'Дом Анияра Молдабаева', lng: 80.25619765, lat: 50.40698675, kind: 'house', start: 1898, end: 1899, angle: 25, note: 'Контур OSM №426108461, Богенбай батыра, 132. 1898 — приобретение уже построенного дома. Этапы демонстрационные; высота расчётная.' },
    { id: 'bridge', eventId: 'b11', name: 'Подвесной мост', lng: 80.224585, lat: 50.409886, kind: 'bridge', start: 1998, end: 2000, angle: -19.65, note: 'Ось по дорогам OSM №44080309 и №44080311. Строительство 1998–2000; опоры и кабели схематичные, этапы внутри периода демонстрационные.' }
];
export const stages = ['Площадка', 'Фундамент', 'Стены / опоры', 'Крыша / пролёт', 'Готовый объект'];
export function progressAt(b: Building, year: number) { return b.kind === 'bridge' ? Math.max(0, Math.min(1, (year - b.start) / (b.end - b.start))) : year >= b.start ? 1 : 0; }
export function makeModels(year: number, active: string, override: number | null, visible: string[]): FeatureCollection<Polygon> {
    const features: Feature<Polygon>[] = [];
    for (const b of buildings) {
        if (!visible.includes(b.id)) continue;
        const manual = b.id === active && override !== null;
        if (year < b.start && !manual) continue;
        const p = manual ? override! : progressAt(b, year);
        const footprint = footprints[b.id as keyof typeof footprints];
        if (footprint) {
            const height = b.id === 'stepanov' ? 8 : b.id === 'dostoevsky' ? 6.4 : 7;
            const emit = (base: number, top: number, color: string) => features.push({ type: 'Feature', properties: { id: b.id, name: b.name, base, height: top, color }, geometry: footprint.geometry as Polygon });
            emit(0, .25, '#b6aa92');
            if (p > 0) emit(0, Math.min(1.2, p * 6), '#b8b4a8');
            if (p > .2) emit(1.2, 1.2 + (height - 1.2) * Math.min(1, (p - .2) / .55), '#dfbd98');
            if (p > .75) emit(height, height + Math.min(1, (p - .75) / .25) * 1.3, '#617d86');
            continue;
        }
        const rad = b.angle * Math.PI / 180;
        const point = (x: number, y: number) => [b.lng + (x * Math.cos(rad) - y * Math.sin(rad)) / (111320 * Math.cos(b.lat * Math.PI / 180)), b.lat + (x * Math.sin(rad) + y * Math.cos(rad)) / 111320];
        const box = (x: number, y: number, w: number, d: number, base: number, top: number, color: string, from = 0, to = 1) => {
            const t = Math.max(0, Math.min(1, (p - from) / (to - from)));
            if (t <= 0) return;
            features.push({ type: 'Feature', properties: { id: b.id, name: b.name, base, height: base + (top - base) * t, color }, geometry: { type: 'Polygon', coordinates: [[point(x - w / 2, y - d / 2), point(x + w / 2, y - d / 2), point(x + w / 2, y + d / 2), point(x - w / 2, y + d / 2), point(x - w / 2, y - d / 2)]] } });
        };
        // A low construction plot is visible even at 0%.
        features.push({ type: 'Feature', properties: { id: b.id, name: b.name, base: 0, height: .25, color: '#d8b989' }, geometry: { type: 'Polygon', coordinates: [[point(-22, -18), point(22, -18), point(22, 18), point(-22, 18), point(-22, -18)]] } });
        if (b.kind === 'bridge') {
            for (const y of [-375, 375]) for (const x of [-15, 15]) { box(x, y, 13, 22, 0, 7, '#bdc7ca', 0, .2); box(x, y, 7, 13, 7, 85, '#c1d5c3', .2, .55); box(0, y, 36, 7, 73, 78, '#c1d5c3', .5, .62) }
            box(0, 0, 32, 750, 19, 23, '#536573', .45, .78);
            for (const x of [-16, 16]) for (let y = -375; y <= 375; y += 8) { const z = Math.abs(y) <= 375 ? 28 + 50 * (y / 375) ** 2 : 78 - (Math.abs(y) - 375) * .26; box(x, y, 1.5, 9, z, z + 1.5, '#b8e9e3', .78, .95); if (y % 32 === 0) box(x, y, 1, 1, 23, z, '#b8e9e3', .84, .98) }
            for (let y = -375; y < 375; y += 20)box(0, y, .5, 10, 23, 23.2, '#fbecb9', .98, 1);
        } else if (b.kind === 'fort') {
            box(0, 0, 125, 125, 0, 2, '#bca584', 0, .2);
            for (const s of [-1, 1]) { box(s * 58, 0, 6, 116, 2, 11, '#986e48', .2, .6); box(0, s * 58, 116, 6, 2, 11, '#986e48', .2, .6) }
            for (const x of [-58, 58]) for (const y of [-58, 58]) { box(x, y, 15, 15, 2, 19, '#b58a5c', .3, .7); for (let i = 0; i < 7; i++)box(x, y, 17 - i * 2, 17 - i * 2, 19 + i, 20 + i, '#5c554c', .7, .9) }
            box(0, 0, 28, 18, 2, 11, '#d3b282', .45, .8); for (let i = 0; i < 7; i++)box(0, 0, 30, 20 - i * 2, 11 + i * .7, 11.7 + i * .7, '#586e65', .8, 1);
        } else {
            const w = b.kind === 'museum' ? 46 : 26, d = b.kind === 'museum' ? 26 : 18, h = b.kind === 'museum' ? 13 : 9;
            box(0, 0, w + 3, d + 3, 0, 1.5, '#b4b7b1', 0, .2); box(0, 0, w, d, 1.5, h, b.kind === 'museum' ? '#e6b28b' : '#bb976b', .2, .65);
            for (let i = 0; i < 9; i++)box(0, 0, w + 2, (d + 2) * (1 - i / 10), h + i * .5, h + (i + 1) * .5, '#506c72', .65, .9);
            for (const side of [-1, 1]) for (let x = -w / 2 + 4; x < w / 2; x += 6)for (const z of [3, 7]) { box(x, side * (d / 2 + .12), 2.5, .3, z, z + 2, '#9edce6', .9, 1); box(x, side * (d / 2 + .3), 3.2, .5, z - .3, z, '#f9e8ce', .92, 1) }
            box(0, -d / 2 - .3, 3, .6, 1.5, 5, '#5b473c', .9, 1); box(w / 4, 0, 2, 2, h + 2, h + 7, '#a16f59', .9, 1);
        }
    }
    return { type: 'FeatureCollection', features };
}
export const fallback: FeatureCollection = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[80.12, 50.47], [80.19, 50.43], [80.22, 50.408], [80.26, 50.39], [80.32, 50.36]] } }] };
