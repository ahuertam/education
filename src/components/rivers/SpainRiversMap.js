import { useMemo } from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { getRiverNameById } from '../data/spainRiversData';
import { Card } from './SpainRiversStyles';
import { SPAIN_MAINLAND_POLYGON_LONLAT, SPAIN_RIVER_POLYLINES_LONLAT } from './spainGeoShapes';

function MapLegend() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'white' }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: '#2563eb', display: 'inline-block' }} />
        <span style={{ fontWeight: 700 }}>Río</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'white' }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: '#16a34a', display: 'inline-block' }} />
        <span style={{ fontWeight: 700 }}>Correcto</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'white' }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: '#dc2626', display: 'inline-block' }} />
        <span style={{ fontWeight: 700 }}>Tu selección</span>
      </div>
    </div>
  );
}

export default function SpainRiversMap({ disabled, onSelectRiver, result, currentRiverId }) {
  const viewBox = useMemo(() => ({ width: 900, height: 560 }), []);

  const projection = useMemo(() => {
    const coords = SPAIN_MAINLAND_POLYGON_LONLAT;
    const lons = coords.map(([lon]) => lon);
    const lats = coords.map(([, lat]) => lat);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const padding = 40;
    const availableW = viewBox.width - padding * 2;
    const availableH = viewBox.height - padding * 2;
    const spanLon = maxLon - minLon || 1;
    const spanLat = maxLat - minLat || 1;

    const scale = Math.min(availableW / spanLon, availableH / spanLat);
    const offsetX = padding + (availableW - spanLon * scale) / 2;
    const offsetY = padding + (availableH - spanLat * scale) / 2;

    const project = ([lon, lat]) => {
      const x = offsetX + (lon - minLon) * scale;
      const y = offsetY + (maxLat - lat) * scale;
      return [x, y];
    };

    return { project };
  }, [viewBox.height, viewBox.width]);

  const spainOutlinePath = useMemo(() => {
    const pts = SPAIN_MAINLAND_POLYGON_LONLAT.map(projection.project);
    const [firstX, firstY] = pts[0];
    const d = [`M${firstX.toFixed(2)} ${firstY.toFixed(2)}`];
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      d.push(`L${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    d.push('Z');
    return d.join(' ');
  }, [projection.project]);

  const rivers = useMemo(() => {
    return SPAIN_RIVER_POLYLINES_LONLAT.map((river) => {
      const pts = river.points.map(projection.project);
      const [firstX, firstY] = pts[0];
      const d = [`M${firstX.toFixed(2)} ${firstY.toFixed(2)}`];
      for (let i = 1; i < pts.length; i++) {
        const [x, y] = pts[i];
        d.push(`L${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      return { id: river.id, d: d.join(' ') };
    });
  }, [projection.project]);

  const hoverable = !disabled && !result;
  const toneFor = (riverId) => {
    if (!result) return { stroke: '#2563eb', width: 4, opacity: 1 };
    if (result.correctId === riverId) {
      return { stroke: '#16a34a', width: 6, opacity: 1 };
    }
    if (result.chosenId === riverId && result.chosenId !== result.correctId) {
      return { stroke: '#dc2626', width: 6, opacity: 1 };
    }
    return { stroke: 'rgba(37,99,235,0.35)', width: 3, opacity: 0.7 };
  };

  return (
    <Card aria-label="Mapa de España con ríos seleccionables">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaMapMarkedAlt />
          <span>Mapa</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.95rem' }}>
          {disabled ? 'Vista previa' : 'Toca un río'}
        </div>
      </div>
      <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <svg
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          width="100%"
          height="auto"
          role="img"
          aria-label={
            disabled
              ? 'Mapa de España con ríos principales.'
              : result
                ? `Resultado mostrado. Río objetivo: ${getRiverNameById(currentRiverId)}`
                : `Mapa interactivo. Localiza: ${getRiverNameById(currentRiverId)}`
          }
          style={{ display: 'block' }}
        >
          <rect x="0" y="0" width={viewBox.width} height={viewBox.height} fill="#dbeafe" />
          <path d={spainOutlinePath} fill="#ffffff" stroke="#334155" strokeWidth="4" />

          {rivers.map(r => {
            const tone = toneFor(r.id);
            return (
              <g key={r.id}>
                <path
                  d={r.d}
                  fill="none"
                  stroke={tone.stroke}
                  strokeWidth={tone.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={tone.opacity}
                />
                <path
                  d={r.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ cursor: hoverable ? 'pointer' : 'default' }}
                  tabIndex={hoverable ? 0 : -1}
                  role="button"
                  aria-label={`Seleccionar ${getRiverNameById(r.id)}`}
                  onClick={() => {
                    if (!hoverable) return;
                    onSelectRiver(r.id);
                  }}
                  onKeyDown={(e) => {
                    if (!hoverable) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRiver(r.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <MapLegend />
    </Card>
  );
}
