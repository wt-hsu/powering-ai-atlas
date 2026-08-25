import { useMemo, useState } from 'react';
import { Map, Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './compute-map.css';
import './taiwan-aidc.css';
import data from '../data/taiwan-aidc.json';

// 與 ComputeMap 相同的離線後備:PUBLIC_BASEMAP=offline 時用素色深底
const MAP_STYLE =
  import.meta.env.PUBLIC_BASEMAP === 'offline'
    ? {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0a101c' } }],
      }
    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// 靜態版驗證過的調色(dataviz 六項檢查通過)
const ACCENT = '#00A3B8';
const CORRIDOR = '#BD8628';
const MUTED = '#898781';

// 圓面積 ∝ 揭露容量 MW(sqrt 尺度;未揭露另以固定小圓處理)
const radiusExpr = [
  'interpolate',
  ['linear'],
  ['sqrt', ['coalesce', ['get', 'mw'], 9]],
  3, 6,
  16, 26,
];

const STATUS_ZH = {
  operating: '營運中 Operating',
  construction: '建置中 In build',
  planned: '規劃中 Planned',
  undisclosed: '規模未揭露 Undisclosed',
};

function Legend() {
  return (
    <div className="cm-legend">
      <div className="cm-legend-shape">
        <span className="cm-legend-item">
          <span className="cm-dot" style={{ background: ACCENT }} /> 營運中
        </span>
        <span className="cm-legend-item">
          <span className="cm-dot cm-dot-hollow" style={{ borderColor: ACCENT }} /> 建置/規劃中
        </span>
        <span className="cm-legend-item">
          <span className="cm-dot cm-dot-hollow" style={{ borderColor: MUTED }} /> 規模未揭露
        </span>
        <span className="cm-legend-item">
          <span className="cm-size-demo">
            <i style={{ width: 6, height: 6 }} />
            <i style={{ width: 16, height: 16 }} />
          </span>
          面積∝揭露容量(口徑依個案)
        </span>
      </div>
      <div className="cm-legend-shape">
        <span className="cm-legend-item">
          <span className="ta-swatch-hatch" /> 北北基桃 5MW+ 暫緩供電區
        </span>
        <span className="cm-legend-item">
          <span className="ta-swatch-dash" /> 南臺灣算力廊帶
        </span>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: 'operating', label: '營運中', match: (s) => s === 'operating' },
  { key: 'building', label: '建置・規劃', match: (s) => s === 'construction' || s === 'planned' },
  { key: 'undisclosed', label: '未揭露', match: (s) => s === 'undisclosed' },
];

export default function TaiwanAidcMap() {
  const [active, setActive] = useState(() => new Set(FILTERS.map((f) => f.key)));
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const keep = (status) => FILTERS.some((f) => active.has(f.key) && f.match(status));
    return {
      type: 'FeatureCollection',
      features: data.sites.features.filter((f) => keep(f.properties.status)),
    };
  }, [active]);

  const toggle = (key) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const onMove = (e) => {
    const f = e.features && e.features[0];
    if (f) setHover({ x: e.point.x, y: e.point.y, p: f.properties });
    else setHover(null);
  };

  const onClick = (e) => {
    const f = e.features && e.features[0];
    if (f) {
      setSelected({ lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], p: f.properties });
    } else setSelected(null);
  };

  return (
    <div className="ta-root">
      <div className="cm-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`cm-chip ${active.has(f.key) ? 'cm-chip-on' : ''}`}
            onClick={() => toggle(f.key)}
          >
            {f.label}
          </button>
        ))}
        <span className="ta-hint">滑鼠拖曳平移、滾輪縮放,點擊案場看細節</span>
      </div>

      <div className="ta-map">
        <Map
          mapStyle={MAP_STYLE}
          initialViewState={{ longitude: 120.95, latitude: 23.75, zoom: 6.8 }}
          minZoom={5.5}
          maxZoom={13}
          maxBounds={[[116.5, 19.8], [125.5, 27.5]]}
          interactiveLayerIds={['ta-solid', 'ta-hollow', 'ta-undisclosed']}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={onClick}
          cursor={hover ? 'pointer' : 'grab'}
          attributionControl={import.meta.env.PUBLIC_BASEMAP !== 'offline'}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* 自帶台灣輪廓:不依賴外部 basemap 也能讀出島形 */}
          <Source id="land" type="geojson" data={data.land}>
            <Layer id="ta-land" type="fill" paint={{ 'fill-color': '#18222f', 'fill-opacity': 0.55 }} />
          </Source>
          <Source id="borders" type="geojson" data={data.borders}>
            <Layer
              id="ta-borders"
              type="line"
              paint={{ 'line-color': '#2a3648', 'line-width': 0.8 }}
            />
          </Source>
          <Source id="coast" type="geojson" data={data.coast}>
            <Layer id="ta-coast" type="line" paint={{ 'line-color': '#4e6076', 'line-width': 1.1 }} />
          </Source>

          <Source id="moratorium" type="geojson" data={data.moratorium}>
            <Layer
              id="ta-mora-fill"
              type="fill"
              paint={{ 'fill-color': '#8fa3bd', 'fill-opacity': 0.08 }}
            />
            <Layer
              id="ta-mora-line"
              type="line"
              paint={{ 'line-color': '#5a6b82', 'line-width': 1, 'line-dasharray': [2, 2] }}
            />
          </Source>

          <Source id="corridor" type="geojson" data={data.corridor}>
            <Layer
              id="ta-corridor"
              type="line"
              paint={{ 'line-color': CORRIDOR, 'line-width': 1.6, 'line-dasharray': [3, 2.4] }}
            />
          </Source>

          <Source id="sites" type="geojson" data={filtered}>
            <Layer
              id="ta-hollow"
              type="circle"
              filter={['any', ['==', ['get', 'status'], 'construction'], ['==', ['get', 'status'], 'planned']]}
              paint={{
                'circle-radius': radiusExpr,
                'circle-color': ACCENT,
                'circle-opacity': 0.12,
                'circle-stroke-width': 1.8,
                'circle-stroke-color': ACCENT,
              }}
            />
            <Layer
              id="ta-undisclosed"
              type="circle"
              filter={['==', ['get', 'status'], 'undisclosed']}
              paint={{
                'circle-radius': 6,
                'circle-color': MUTED,
                'circle-opacity': 0.1,
                'circle-stroke-width': 1.6,
                'circle-stroke-color': MUTED,
              }}
            />
            <Layer
              id="ta-solid"
              type="circle"
              filter={['==', ['get', 'status'], 'operating']}
              paint={{
                'circle-radius': radiusExpr,
                'circle-color': ACCENT,
                'circle-opacity': 0.85,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': 'rgba(10,16,28,0.9)',
              }}
            />
            {/* NVIDIA 嵌套:外虛圈=建置上限(上面 hollow 層),內實圈=已商轉容量 */}
            <Layer
              id="ta-nested-core"
              type="circle"
              filter={['!=', ['get', 'nestedLive'], null]}
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['sqrt', ['coalesce', ['get', 'nestedLive'], 4]],
                  3, 6,
                  16, 26,
                ],
                'circle-color': ACCENT,
                'circle-opacity': 0.9,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': 'rgba(10,16,28,0.9)',
              }}
            />
          </Source>

          {selected && (
            <Popup
              longitude={selected.lng}
              latitude={selected.lat}
              anchor="bottom"
              offset={14}
              closeOnClick={false}
              onClose={() => setSelected(null)}
              maxWidth="300px"
            >
              <div className="ta-popup">
                <strong>{selected.p.name}</strong>
                <div className="ta-popup-row">
                  <span className="ta-popup-mw">{selected.p.mwLabel}</span>
                  <span className="ta-popup-status">{STATUS_ZH[selected.p.status]}</span>
                </div>
                {selected.p.nestedLabel && (
                  <div className="ta-popup-note">內圈:{selected.p.nestedLabel}</div>
                )}
                {selected.p.timeline && <div className="ta-popup-note">{selected.p.timeline}</div>}
                <div className="ta-popup-muted">
                  {selected.p.region} · 可信度 {selected.p.grade} · 座標為鄉鎮級示意
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {hover && !selected && (
          <div className="cm-tooltip" style={{ left: hover.x + 12, top: hover.y + 12 }}>
            <strong>{hover.p.name}</strong>
            <div>
              {hover.p.mwLabel} · {STATUS_ZH[hover.p.status]}
            </div>
            <div className="cm-tooltip-muted">{hover.p.region} · 點擊看細節</div>
          </div>
        )}
      </div>

      <Legend />
    </div>
  );
}
