// Owner categories in fixed order. Five company hues is the ceiling that passes
// the all-pairs colorblind-separation and normal-vision floors on the dark map
// surface (validated set; yellow and magenta deliberately use the brighter steps
// so every pair stays distinguishable on near-black). Everyone else folds into
// the muted "other" bucket — identity for those still comes from tooltip,
// legend, and the owner filter.
export const OWNERS = [
  { key: 'microsoft', label: 'Microsoft', color: '#3987e5' },
  { key: 'amazon', label: 'Amazon', color: '#d95926' },
  { key: 'google', label: 'Google', color: '#eda100' },
  { key: 'meta', label: 'Meta', color: '#e87ba4' },
  { key: 'openai', label: 'OpenAI', color: '#199e70' },
  { key: 'other', label: 'Other', color: '#898781' },
];

export const ownerColor = Object.fromEntries(OWNERS.map((o) => [o.key, o.color]));

// MapLibre match expression: point color by owner key
export const ownerColorExpr = [
  'match',
  ['get', 'ownerKey'],
  ...OWNERS.filter((o) => o.key !== 'other').flatMap((o) => [o.key, o.color]),
  ownerColor.other,
];

export function formatPower(mw) {
  if (mw == null) return 'power unknown';
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${Math.round(mw)} MW`;
}
