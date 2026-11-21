/**
 * A simplified country silhouette of Yemen, derived from Natural Earth 1:110m.
 * Natural Earth vector geography is public domain.
 * https://www.naturalearthdata.com/about/terms-of-use/
 *
 * Map is a spatial index, NOT a representation of contested de-facto control,
 * political alignments, sovereignty claims or governorate boundaries.
 */
export const YEMEN_MAP = {
  path: "M149.1,6.0 L166.0,41.8 L155.0,45.9 L151.7,57.8 L136.5,64.3 L112.2,71.4 L98.5,82.1 L87.3,82.1 L78.3,88.4 L68.6,91.3 L52.0,93.0 L48.7,97.0 L44.7,98.1 L42.3,102.0 L34.8,101.6 L29.9,103.7 L19.4,102.9 L15.4,94.0 L15.8,85.7 L10.4,69.9 L6.0,63.7 L9.0,62.9 L7.5,56.0 L9.3,53.0 L8.7,46.4 L15.3,41.5 L13.8,35.1 L17.8,27.6 L24.1,31.6 L45.8,29.9 L63.3,32.9 L69.1,32.1 L72.9,37.2 L80.1,34.7 L91.0,18.7 L105.2,11.8 L149.1,6.0 Z",
  minLong: 42.60487267433362,
  maxLong: 53.10857262554751,
  maxLat: 19.000003363516058,
  scale: 160/(53.10857262554751-42.60487267433362),
  width: 172,
  height: 110,
} as const;

/** Coordinates are mapped onto a low-resolution source outline; never event precision. */
export function yemenMapPoint(latitude:number,longitude:number) {
  if(latitude<12 || latitude>19.5 || longitude<42 || longitude>54) return null;
  return {
    x:(longitude-YEMEN_MAP.minLong)*YEMEN_MAP.scale+6,
    y:(YEMEN_MAP.maxLat-latitude)*YEMEN_MAP.scale+6,
  };
}
