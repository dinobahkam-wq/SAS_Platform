/**
 * SAS shared visual identity registry.
 * These assets are already supplied under public/icons by the platform editor.
 * The registry describes identities; media publisher != organization making a statement.
 * The filename alone does not establish the provenance or usage permission of an emblem.
 */
export type IdentityKind = "government" | "media" | "international" | "regional";
export type Identity = {
  id: string;
  name: string;
  kind: IdentityKind;
  image: string;
  aliases: readonly string[];
  provenance: "user_supplied";
};

export const visualIdentities: readonly Identity[] = [
  { id:"ye-republic", name:"الجمهورية اليمنية", kind:"government", image:"/icons/Emblem_of_Yemen_(2).svg", aliases:["النسر الجمهوري","الجمهورية اليمنية","الحكومة اليمنية","مجلس القيادة الرئاسي","الرئاسة اليمنية"], provenance:"user_supplied" },
  { id:"sa-government", name:"المملكة العربية السعودية", kind:"government", image:"/icons/saudi_icon_goverment.png", aliases:["السعودية","المملكة العربية السعودية","الحكومة السعودية","وزارة الخارجية السعودية","وكالة الأنباء السعودية","واس"], provenance:"user_supplied" },
  { id:"ae-government", name:"الإمارات العربية المتحدة", kind:"government", image:"/icons/New_Coat_of_arms_of_United_Arab_Emirates.png", aliases:["الإمارات","الإمارات العربية المتحدة","الحكومة الإماراتية","وام"], provenance:"user_supplied" },
  { id:"qa-government", name:"دولة قطر", kind:"government", image:"/icons/qatar_gov.jpg", aliases:["قطر","دولة قطر","الحكومة القطرية"], provenance:"user_supplied" },
  { id:"gcc", name:"مجلس التعاون الخليجي", kind:"regional", image:"/icons/GGC_icon.png", aliases:["مجلس التعاون الخليجي","مجلس التعاون لدول الخليج العربية","الأمانة العامة لمجلس التعاون"], provenance:"user_supplied" },
  { id:"eu", name:"الاتحاد الأوروبي", kind:"regional", image:"/icons/Flag_of_Europe.svg.webp", aliases:["الاتحاد الأوروبي","المفوضية الأوروبية","الاتحاد الاوروبي"], provenance:"user_supplied" },
  { id:"un", name:"الأمم المتحدة", kind:"international", image:"/icons/UN_emblem_blue.svg.webp", aliases:["الأمم المتحدة","الامم المتحدة","مجلس الأمن الدولي","مكتب المبعوث الأممي","الأمم المتحده"], provenance:"user_supplied" },
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
