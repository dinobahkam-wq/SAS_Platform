import type { BriefingPlace } from "@/lib/public-briefing";
import { YEMEN_MAP,yemenMapPoint } from "@/lib/briefing-geo";

/** Cartographic marker only for explicitly reviewed geographic records in a published snapshot. */
export function BriefingLocationMark({ place, compact = false }:{
  place: BriefingPlace | null; compact?: boolean;
}) {
  if(!place || place.country_code!=="YE") return null;
  // Never imply we can pinpoint an entire governorate when no centre is documented.
  if(place.kind!=="country" && (place.latitude===null || place.longitude===null)) return null;
  const point=place.latitude!==null && place.longitude!==null
    ? yemenMapPoint(place.latitude,place.longitude) : null;
  if(place.kind!=="country" && !point) return null;
  const description=place.precision==="city_centroid" ? "الموقع التقريبي لمركز المدينة" :
    place.precision==="approximate" ? "الموقع التقريبي" :
    place.precision==="verified_site" ? "موقع موثق" : "نطاق الدولة";
  const label=`الموقع الجغرافي: ${place.name_ar} — ${description}`;
  return <span className={compact?"sas-place-badge sas-place-badge--compact":"sas-place-badge"} title={label}>
    <svg viewBox="0 0 172 110" role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      <path d={YEMEN_MAP.path} fill="#e6f0ea" stroke="#507e68" strokeWidth="2" strokeLinejoin="round"/>
      {point && <>
        <circle cx={point.x} cy={point.y} r="10" fill="#b14438" fillOpacity=".14"/>
        <circle cx={point.x} cy={point.y} r="4.2" fill="#b14438" stroke="#fff" strokeWidth="1.8"/>
      </>}
    </svg>
    {!compact && <span className="sas-place-label"><strong>{place.name_ar}</strong><small>{description}</small></span>}
  </span>;
}
