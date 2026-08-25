import { useEffect, useMemo, useRef, useState } from 'react';
import { Map, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './compute-map.css';
import clusters from '../data/clusters.json';
import meta from '../data/meta.json';
import { OWNERS, ownerColorExpr, formatPower } from './owners.js';

// Dev aid: `PUBLIC_BASEMAP=offline npm run build` swaps the Carto basemap for a
// plain dark background, so the data layers can be checked without tile access.
const MAP_STYLE =
  import.meta.env.PUBLIC_BASEMAP === 'offline'
    ? {
        version: 8,
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#111110' } }],
      }
    : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// point size: area encodes power (sqrt scale), tiny floor for unknown-power sites
const radiusExpr = [
  'interpolate',
  ['linear'],
  ['sqrt', ['coalesce', ['get', 'mw'], 2]],
  0, 2.5,
  10, 7,
  40, 22,
];

const solidPaint = {
  'circle-radius': radiusExpr,
  'circle-color': ownerColorExpr,
  'circle-opacity': 0.82,
  'circle-stroke-width': 1,
  'circle-stroke-color': 'rgba(13,13,13,0.85)',
};

const hollowPaint = {
  'circle-radius': radiusExpr,
  'circle-color': ownerColorExpr,
  'circle-opacity': 0.1,
  'circle-stroke-width': 1.8,
  'circle-stroke-color': ownerColorExpr,
};

function toGeoJSON(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: r,
    })),
  };
}

function computeStats(rows) {
  const withPower = rows.filter((r) => r.mw != null);
  const totalMW = withPower.reduce((s, r) => s + r.mw, 0);
  const usMW = withPower
    .filter((r) => (r.country || '').includes('United States'))
    .reduce((s, r) => s + r.mw, 0);
  const top = rows.reduce((a, b) => ((b.mw || 0) > (a.mw || 0) ? b : a), rows[0]);
  return {
    count: rows.filter((r) => r.status === 'operational').length,
    campusCount: rows.filter((r) => r.status === 'campus').length,
    totalMW,
    usShare: totalMW ? Math.round((usMW / totalMW) * 100) : 0,
    top,
    topHomesM: top?.mw ? (top.mw * 0.81) / 1000 : 0, // ~810k US homes per continuous GW
  };
}

function Legend({ compact = false }) {
  return (
    <div className={`cm-legend ${compact ? 'cm-legend-compact' : ''}`}>
      <div className="cm-legend-owners">
        {OWNERS.map((o) => (
          <span key={o.key} className="cm-legend-item">
            <span className="cm-dot" style={{ background: o.color }} />
            {o.label}
          </span>
        ))}
      </div>
      <div className="cm-legend-shape">
        <span className="cm-legend-item">
          <span className="cm-dot" style={{ background: '#c3c2b7' }} /> supercomputer (operational)
        </span>
        <span className="cm-legend-item">
          <span className="cm-dot cm-dot-hollow" style={{ borderColor: '#c3c2b7' }} /> mega-campus (building out)
        </span>
        <span className="cm-legend-item">
          <span className="cm-size-demo">
            <i style={{ width: 6, height: 6 }} />
            <i style={{ width: 16, height: 16 }} />
          </span>
          size = power (MW)
        </span>
      </div>
    </div>
  );
}

/* ---------- Part 1: scroll-driven story ---------- */

function ScrollyMap({ stats, geojson }) {
  const mapRef = useRef(null);
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        camera: { center: [10, 22], zoom: 1.3 },
        title: `${stats.count} machines run the AI boom`,
        body: `Every solid dot on this map is an AI supercomputer running today — a warehouse of tens of thousands of GPUs. The hollow circles are ${stats.campusCount} frontier mega-campuses still building out. Together they draw about ${formatPower(stats.totalMW)} of power.`,
      },
      {
        camera: { center: [-95, 38], zoom: 3.4 },
        title: 'Most of it lives in the United States',
        body: `Around ${stats.usShare}% of the mapped AI computing power sits on the US grid — clustered where land, fiber, and above all electricity are available: Virginia, Texas, Tennessee, the Midwest.`,
      },
      {
        camera: { center: [stats.top.lng, stats.top.lat], zoom: 10.5 },
        title: 'Single sites the size of cities',
        body: `${stats.top.name} already draws about ${formatPower(stats.top.mw)} — roughly the household electricity of ${stats.topHomesM.toFixed(1)} million US homes — and is still growing. Facilities of this scale are reshaping local power grids.`,
      },
    ],
    [stats],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { center, zoom } = steps[step].camera;
    map.flyTo({ center, zoom, duration: reduced ? 0 : 2400, essential: true });
  }, [step, steps]);

  useEffect(() => {
    const sections = document.querySelectorAll('.cm-step');
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number(e.target.dataset.step));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="cm-scrolly">
      <div className="cm-scrolly-map">
        <Map
          ref={mapRef}
          mapStyle={MAP_STYLE}
          initialViewState={{ longitude: 10, latitude: 22, zoom: 1.3 }}
          interactive={false}
          attributionControl={false}
        >
          <Source id="clusters" type="geojson" data={geojson}>
            <Layer
              id="story-up"
              type="circle"
              filter={['==', ['get', 'status'], 'campus']}
              paint={hollowPaint}
            />
            <Layer
              id="story-op"
              type="circle"
              filter={['==', ['get', 'status'], 'operational']}
              paint={solidPaint}
            />
          </Source>
        </Map>
        <div className="cm-map-overlay">
          <Legend compact />
        </div>
      </div>
      <div className="cm-steps">
        {steps.map((s, i) => (
          <section className="cm-step" data-step={i} key={i}>
            <div className={`cm-card ${step === i ? 'cm-card-active' : ''}`}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- Part 2: free exploration ---------- */

function ExplorerMap({ geojson }) {
  const [activeOwners, setActiveOwners] = useState(() => new Set(OWNERS.map((o) => o.key)));
  const [showOp, setShowOp] = useState(true);
  const [showUp, setShowUp] = useState(true);
  const [hover, setHover] = useState(null);

  const filtered = useMemo(() => {
    const feats = geojson.features.filter((f) => {
      const p = f.properties;
      if (!activeOwners.has(p.ownerKey)) return false;
      if (p.status === 'operational' && !showOp) return false;
      if (p.status === 'campus' && !showUp) return false;
      return true;
    });
    return { type: 'FeatureCollection', features: feats };
  }, [geojson, activeOwners, showOp, showUp]);

  const toggleOwner = (key) => {
    setActiveOwners((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onMove = (e) => {
    const f = e.features && e.features[0];
    if (f) setHover({ x: e.point.x, y: e.point.y, p: f.properties });
    else setHover(null);
  };

  return (
    <div className="cm-explorer">
      <div className="cm-filters">
        {OWNERS.map((o) => (
          <button
            key={o.key}
            className={`cm-chip ${activeOwners.has(o.key) ? 'cm-chip-on' : ''}`}
            style={{ '--chip': o.color }}
            onClick={() => toggleOwner(o.key)}
          >
            <span className="cm-dot" style={{ background: o.color }} />
            {o.label}
          </button>
        ))}
        <span className="cm-filter-sep" />
        <button className={`cm-chip ${showOp ? 'cm-chip-on' : ''}`} onClick={() => setShowOp(!showOp)}>
          Supercomputers
        </button>
        <button className={`cm-chip ${showUp ? 'cm-chip-on' : ''}`} onClick={() => setShowUp(!showUp)}>
          Mega-campuses
        </button>
      </div>

      <div className="cm-explorer-map">
        <Map
          mapStyle={MAP_STYLE}
          initialViewState={{ longitude: 5, latitude: 30, zoom: 1.6 }}
          interactiveLayerIds={['ex-op', 'ex-up']}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          cursor={hover ? 'pointer' : 'grab'}
          minZoom={1}
        >
          <NavigationControl position="top-right" showCompass={false} />
          <Source id="clusters-ex" type="geojson" data={filtered}>
            <Layer
              id="ex-up"
              type="circle"
              filter={['==', ['get', 'status'], 'campus']}
              paint={hollowPaint}
            />
            <Layer
              id="ex-op"
              type="circle"
              filter={['==', ['get', 'status'], 'operational']}
              paint={solidPaint}
            />
          </Source>
        </Map>
        {hover && (
          <div className="cm-tooltip" style={{ left: hover.x + 12, top: hover.y + 12 }}>
            <strong>{hover.p.name}</strong>
            <div>{hover.p.owner}</div>
            <div>
              {formatPower(hover.p.mw)}
              {hover.p.cert === false ? ' (estimated)' : ''}
              {hover.p.h100e
                ? ` · ~${hover.p.h100e >= 1000 ? `${Math.round(hover.p.h100e / 1000)}k` : Math.round(hover.p.h100e)} H100-equivalents`
                : ''}
            </div>
            <div className="cm-tooltip-muted">
              {hover.p.country}
              {hover.p.status === 'campus' ? ' · mega-campus, building out' : hover.p.year ? ` · since ${hover.p.year}` : ''}
              {hover.p.approx ? ' · location approximate' : ''}
            </div>
          </div>
        )}
      </div>
      <Legend />
    </div>
  );
}

/* ---------- top level ---------- */

export default function ComputeMap() {
  const geojson = useMemo(() => toGeoJSON(clusters), []);
  const stats = useMemo(() => computeStats(clusters), []);

  return (
    <div className="cm-root">
      {meta.sample && (
        <p className="cm-sample-note">
          ⚠️ Showing a small placeholder sample — the full Epoch AI dataset ({'>'}500 sites) is
          loaded by the data pipeline.
        </p>
      )}
      <ScrollyMap stats={stats} geojson={geojson} />
      <div className="cm-explore-heading container">
        <h2>Explore the map</h2>
        <p>
          Pan, zoom, and hover over any site. Filter by owner or by whether a facility is already
          running.
        </p>
      </div>
      <ExplorerMap geojson={geojson} />
    </div>
  );
}
