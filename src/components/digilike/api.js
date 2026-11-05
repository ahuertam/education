// Capa de red de Digilike: busca el Digimon en dos APIs y guarda el resultado.

import { FALLBACK_IMG } from './data';
import { mapLevelLabel } from './logic';

const digimonCache = new Map();

export const fetchDigimon = async (name) => {
  if (digimonCache.has(name)) return digimonCache.get(name);

  const tryDigiApi = async () => {
    const res = await fetch(`https://digi-api.com/api/v1/digimon/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const img = json?.images?.[0]?.href || json?.images?.[0]?.image || null;
    const level = json?.levels?.[0]?.level || null;
    const id = json?.id || null;
    return { source: 'digi-api', id, name: json?.name || name, img, level };
  };

  const tryVercel = async () => {
    const res = await fetch(`https://digimon-api.vercel.app/api/digimon/name/${encodeURIComponent(name.toLowerCase())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const item = Array.isArray(json) ? json[0] : json;
    if (!item) throw new Error('Empty');
    return { source: 'vercel', id: item?.name || name, name: item?.name || name, img: item?.img || null, level: item?.level || null };
  };

  try {
    const data = await tryDigiApi();
    const normalized = { ...data, img: data.img || FALLBACK_IMG, level: mapLevelLabel(data.level) };
    digimonCache.set(name, normalized);
    return normalized;
  } catch {
    try {
      const data = await tryVercel();
      const normalized = { ...data, img: data.img || FALLBACK_IMG, level: mapLevelLabel(data.level) };
      digimonCache.set(name, normalized);
      return normalized;
    } catch {
      const fallback = { source: 'fallback', id: name, name, img: FALLBACK_IMG, level: 'Desconocido' };
      digimonCache.set(name, fallback);
      return fallback;
    }
  }
};
