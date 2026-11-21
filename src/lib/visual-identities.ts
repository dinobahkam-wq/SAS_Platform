/**
 * SAS shared visual identity registry.
 * These assets are already supplied under public/icons by the platform editor.
 * The registry describes identities; media publisher != organization making a statement.
 * The filename alone does not establish the provenance or usage permission of an emblem.
 */
export type IdentityKind = "government" | "media" | "international" | "regional" | "country";
export type Identity = {
  id: string;
  name: string;
  kind: IdentityKind;
  image: string;
  aliases: readonly string[];
  provenance: "user_supplied" | "flag_icons_mit";
};

export const visualIdentities: readonly Identity[] = [
  { id:"ye-republic", name:"الجمهورية اليمنية", kind:"government", image:"/icons/Emblem_of_Yemen_(2).svg", aliases:["النسر الجمهوري","الجمهورية اليمنية","الحكومة اليمنية","مجلس القيادة الرئاسي","الرئاسة اليمنية"], provenance:"user_supplied" },
  { id:"sa-government", name:"المملكة العربية السعودية", kind:"government", image:"/icons/saudi_icon_goverment.png", aliases:["السعودية","المملكة العربية السعودية","الحكومة السعودية","وزارة الخارجية السعودية"], provenance:"user_supplied" },
  { id:"ae-government", name:"الإمارات العربية المتحدة", kind:"government", image:"/icons/New_Coat_of_arms_of_United_Arab_Emirates.png", aliases:["الإمارات","الإمارات العربية المتحدة","الحكومة الإماراتية","وام"], provenance:"user_supplied" },
  { id:"qa-government", name:"دولة قطر", kind:"government", image:"/icons/qatar_gov.jpg", aliases:["قطر","دولة قطر","الحكومة القطرية"], provenance:"user_supplied" },
  { id:"gcc", name:"مجلس التعاون الخليجي", kind:"regional", image:"/icons/GGC_icon.png", aliases:["مجلس التعاون الخليجي","مجلس التعاون لدول الخليج العربية","الأمانة العامة لمجلس التعاون"], provenance:"user_supplied" },
  { id:"eu", name:"الاتحاد الأوروبي", kind:"regional", image:"/icons/Flag_of_Europe.svg.webp", aliases:["الاتحاد الأوروبي","المفوضية الأوروبية","الاتحاد الاوروبي"], provenance:"user_supplied" },
  { id:"un", name:"الأمم المتحدة", kind:"international", image:"/icons/UN_emblem_blue.svg.webp", aliases:["الأمم المتحدة","الامم المتحدة","مجلس الأمن الدولي","مكتب المبعوث الأممي","الأمم المتحده"], provenance:"user_supplied" },
  { id:"sa-spa", name:"وكالة الأنباء السعودية (واس)", kind:"media", image:"/icons/WAS_saudi_press_agency.png", aliases:["وكالة الأنباء السعودية","واس","SPA","Saudi Press Agency","Saudi Press Agency (SPA)"], provenance:"user_supplied" },
  { id:"reuters", name:"رويترز", kind:"media", image:"/icons/Reuters.png", aliases:["رويترز","Reuters","Reuters News"], provenance:"user_supplied" },
  { id:"aljazeera", name:"الجزيرة", kind:"media", image:"/icons/Aljazeera.svg.webp", aliases:["الجزيرة","الجزيرة نت","Al Jazeera","Aljazeera"], provenance:"user_supplied" },
  { id:"anadolu", name:"الأناضول", kind:"media", image:"/icons/Anadolu_Ajansı_logo.png", aliases:["الأناضول","وكالة الأناضول","Anadolu","Anadolu Agency"], provenance:"user_supplied" },
  { id:"alarabiya", name:"العربية", kind:"media", image:"/icons/alarabiya_channel_icon.png", aliases:["العربية","العربية نت","Al Arabiya"], provenance:"user_supplied" },
  { id:"wsj", name:"وول ستريت جورنال", kind:"media", image:"/icons/wall-street-journal-logo.png", aliases:["وول ستريت جورنال","Wall Street Journal","The Wall Street Journal","WSJ"], provenance:"user_supplied" },
];

function normalized(value:string):string {
  return value.toLocaleLowerCase("en").normalize("NFKC").replace(/[\u064B-\u065F\u0670]/g,"").replace(/[أإآ]/g,"ا").replace(/[_.,،:()\-]+/g," ").replace(/\s+/g," ").trim();
}

/** Exact or delimited alias matches only: prevent unrelated organization collisions. */
export function findVisualIdentity(name:string|null|undefined):Identity|null {
  if(!name) return null;
  const key=normalized(name);
  if(!key) return null;
  const candidates=visualIdentities.flatMap(identity =>
    [identity.name,...identity.aliases].map(alias=>({identity,alias:normalized(alias)}))
  ).filter(x=>x.alias && (key===x.alias || key.startsWith(x.alias+" ") || key.endsWith(" "+x.alias)));
  candidates.sort((a,b)=>b.alias.length-a.alias.length);
  return candidates[0]?.identity??null;
}

/** The original published source remains authoritative; visual mapping is only presentation. */
export function findSourceIdentity(sourceName:string|null|undefined):Identity|null {
  return findVisualIdentity(sourceName);
}

/** Explicit identity IDs always take precedence over name matching. */
export function identityById(id:string|null|undefined):Identity|null {
 return allVisualAssets.find(item=>item.id===id)??null;
}

/** ISO 3166-1 alpha-2. Only curated country aliases; no guessing from article text. */
const countries:readonly {code:string;name:string;aliases:readonly string[]}[]=[
 {code:"ye",name:"اليمن",aliases:["الجمهورية اليمنية","اليمن"]},
 {code:"sa",name:"السعودية",aliases:["المملكة العربية السعودية","السعودية"]},
 {code:"ae",name:"الإمارات",aliases:["الإمارات العربية المتحدة","الامارات","الإمارات"]},
 {code:"qa",name:"قطر",aliases:["دولة قطر","قطر"]},
 {code:"om",name:"عُمان",aliases:["سلطنة عمان","عمان","عُمان"]},
 {code:"ir",name:"إيران",aliases:["الجمهورية الإسلامية الإيرانية","ايران","إيران"]},
 {code:"us",name:"الولايات المتحدة",aliases:["الولايات المتحدة الأمريكية","الولايات المتحدة","أمريكا"]},
 {code:"gb",name:"المملكة المتحدة",aliases:["بريطانيا","المملكة المتحدة"]},
 {code:"cn",name:"الصين",aliases:["الصين"]},
 {code:"ru",name:"روسيا",aliases:["روسيا"]},
 {code:"tr",name:"تركيا",aliases:["تركيا"]},
 {code:"eg",name:"مصر",aliases:["مصر"]},
 {code:"jo",name:"الأردن",aliases:["الأردن","الاردن"]},
 {code:"ly",name:"ليبيا",aliases:["ليبيا"]},
 {code:"ua",name:"أوكرانيا",aliases:["أوكرانيا","اوكرانيا"]},
 {code:"ps",name:"فلسطين",aliases:["فلسطين"]},
];
export function countryByName(name:string|null|undefined){
 const key=normalized(name??"");
 return countries.find(item=>item.aliases.some(alias=>normalized(alias)===key))??null;
}

/** Bundled subset of lipis/flag-icons (MIT), independent of remote CDNs. */
export const countryFlagAssets: readonly Identity[] = countries.map(country=>({
  id:"flag-"+country.code,
  name:country.name,
  kind:"country" as const,
  image:"/flags/"+country.code+".svg",
  aliases:country.aliases,
  provenance:"flag_icons_mit" as const,
}));
export const allVisualAssets: readonly Identity[] = [...visualIdentities,...countryFlagAssets];
