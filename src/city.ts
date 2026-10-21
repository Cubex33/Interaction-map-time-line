import type { StyleSpecification, FilterSpecification } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import baseStyle from './city-style.json';
import cityData from './city-buildings.json';
import roadData from './city-roads.json';
import footprints from './historic-footprints.json';
export const historicIds = Object.values(footprints).map(f => f.properties.osm_id);
export const cityBuildings = cityData as FeatureCollection<Polygon>;
export const cityRoads = roadData as FeatureCollection;
export const cityCount = cityBuildings.features.length;
const masks = Object.values(footprints).map(f => { const c = f.geometry.coordinates[0]; const xs = c.map(p => p[0]), ys = c.map(p => p[1]); const x0 = Math.min(...xs) - .000015, x1 = Math.max(...xs) + .000015, y0 = Math.min(...ys) - .00001, y1 = Math.max(...ys) + .00001; return [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]; });
export const excludeHistoric = ['!', ['within', { type: 'MultiPolygon', coordinates: masks }]] as FilterSpecification;
export function cityStyle(): StyleSpecification {
    const style = JSON.parse(JSON.stringify(baseStyle)) as StyleSpecification;
    style.layers = style.layers.filter(l => l.id !== 'building');
    const b = style.layers.find(l => l.id === 'building-3d');
    if (b && b.type === 'fill-extrusion') {
        b.minzoom = 12; b.filter = excludeHistoric;
        b.paint = { 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-height': ['max', 3, ['coalesce', ['get', 'render_height'], 6.4]], 'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6.4], 3, '#e6dfcd', 15, '#c1d4da', 40, '#8aa9bd'], 'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': true };
    }
    return style;
}
