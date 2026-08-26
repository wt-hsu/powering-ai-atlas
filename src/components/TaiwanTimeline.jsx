import { useMemo, useRef, useState } from 'react';
import './compute-map.css';
import './taiwan-aidc.css';
import data from '../data/taiwan-aidc.json';
import { STATUS_ZH } from './TaiwanAidcMap.jsx';

// 每年新增案場・單位圖:一顆點=一個案子(與地圖同語言:實心=營運、空心=建置/規劃、灰=未揭露)
const ACCENT = '#00A3B8';
const MUTED = '#898781';

const W = 960, H = 264;
const M = { l: 24, r: 24, top: 58, bottom: 44 };
const Y0 = 2013, Y1 = 2029;
const YEARS = Array.from({ length: Y1 - Y0 + 1 }, (_, i) => Y0 + i);
const R = 10, GAP = 26;

export default function TaiwanTimeline() {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null); // {x, y, p, pinned}

  const columns = useMemo(() => {
    const byYear = new Map(YEARS.map((y) => [y, []]));
    for (const f of data.sites.features) {
      if (byYear.has(f.properties.year)) byYear.get(f.properties.year).push(f.properties);
    }
    // 每欄由大到小排(視覺穩定),回傳 [{year, sites}]
    return YEARS.map((y) => ({ year: y, sites: byYear.get(y).sort((a, b) => (b.mw || 0) - (a.mw || 0)) }));
  }, []);

  const X = (i) => M.l + ((i + 0.5) / YEARS.length) * (W - M.l - M.r);
  const baseY = H - M.bottom;
  const unitY = (j) => baseY - R - j * GAP;

  const show = (e, p, pinned) => {
    const rect = wrapRef.current.getBoundingClientRect();
    setTip({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12, p, pinned });
  };

  const unitStyle = (p) => {
    if (p.status === 'operating') return { fill: ACCENT, stroke: 'none', strokeWidth: 0 };
    if (p.status === 'undisclosed') return { fill: 'rgba(137,135,129,0.1)', stroke: MUTED, strokeWidth: 1.6 };
    return { fill: 'rgba(0,163,184,0.12)', stroke: ACCENT, strokeWidth: 1.8 };
  };

  const i24 = YEARS.indexOf(2024), i27 = YEARS.indexOf(2027);
  const bandX0 = X(i24) - R - 8, bandX1 = X(i27) + R + 8;

  return (
    <div className="tl-wrap" ref={wrapRef} onMouseLeave={() => setTip((t) => (t && t.pinned ? t : null))}>
      <div className="tl-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="tl-svg" role="img" aria-label="每年新增 AIDC 案場單位圖">
          {/* 2024–27 加速帶 */}
          <rect x={bandX0} y={M.top - 26} width={bandX1 - bandX0} height={baseY - M.top + 26} rx="8" fill="rgba(0,163,184,0.07)" />
          <text x={(bandX0 + bandX1) / 2} y={M.top - 36} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">
            2024–27:10 案
          </text>
          <line x1={M.l} y1={baseY} x2={W - M.r} y2={baseY} stroke="var(--border)" strokeWidth="1.5" />
          {columns.map((c, i) =>
            c.sites.map((p, j) => {
              const st = unitStyle(p);
              return (
                <g key={p.id}>
                  <circle
                    cx={X(i)}
                    cy={unitY(j)}
                    r={R}
                    fill={st.fill}
                    stroke={st.stroke}
                    strokeWidth={st.strokeWidth}
                  />
                  {/* 放大命中區:hover/tap 都好點 */}
                  <circle
                    cx={X(i)}
                    cy={unitY(j)}
                    r={R + 7}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseMove={(e) => setTip((t) => (t && t.pinned ? t : tipOf(e, p, false, wrapRef)))}
                    onClick={(e) => { e.stopPropagation(); show(e, p, true); }}
                  />
                </g>
              );
            }),
          )}
          {/* 2013 直接標名(空曠處直接給名字,不必 hover) */}
          <text x={X(0) + R + 10} y={unitY(0) + 5} fontSize="13.5" fill="var(--ink-2)">
            Google 彰濱
          </text>
          {[2013, 2016, 2019, 2022, 2024, 2026, 2029].map((y) => (
            <text key={y} x={X(YEARS.indexOf(y))} y={baseY + 24} textAnchor="middle" fontSize="12.5" fill="var(--ink-muted)" fontFamily="'IBM Plex Mono',monospace">
              {y}
            </text>
          ))}
        </svg>
      </div>
      {tip && (
        <div className="cm-tooltip" style={{ left: tip.x, top: tip.y }}>
          <strong>{tip.p.name}</strong>
          <div>
            {tip.p.mwLabel} · {STATUS_ZH[tip.p.status]}
          </div>
          <div className="cm-tooltip-muted">
            {tip.p.region} · {tip.p.year}
            {tip.pinned ? ' · 點其他處關閉' : ''}
          </div>
        </div>
      )}
      {tip && tip.pinned && (
        <div className="tl-dismiss" onClick={() => setTip(null)} />
      )}
      <p className="tl-note">
        一顆點=一個案子(●營運中、○建置/規劃中、灰=規模未揭露);按啟用/預計年;滑過或點擊看案名。
      </p>
    </div>
  );
}

// 輔助:計算 tooltip 位置(避免在 JSX 內寫過長運算)
function tipOf(e, p, pinned, wrapRef) {
  const rect = wrapRef.current.getBoundingClientRect();
  return { x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12, p, pinned };
}
