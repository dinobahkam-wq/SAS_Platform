"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { PublishedBriefingAudio } from "@/lib/briefing-audio";
import "./briefing-audio-player.css";

function formatDuration(seconds: number): string {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
}

function AudioAiMark() {
  return <svg viewBox="0 0 32 32" width="29" height="29" fill="none" aria-hidden="true">
    <path d="M5 17v-4m5 8V9m5 16V7m5 14V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="m25.5 4 .9 3.1L29.5 8l-3.1.9-.9 3.1-.9-3.1L21.5 8l3.1-.9.9-3.1Z"
      fill="currentColor"/>
    <path d="m26.5 19 .6 1.9L29 21.5l-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6.6-1.9Z"
      fill="currentColor" opacity=".85"/>
  </svg>;
}

function PlayStateIcon({ playing }: { playing: boolean }) {
  return playing
    ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.3" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.3" fill="currentColor"/></svg>
    : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M8 5.4a1.6 1.6 0 0 1 2.4-1.39l10 6.6a1.66 1.66 0 0 1 0 2.78l-10 6.6A1.6 1.6 0 0 1 8 18.6V5.4Z" fill="currentColor"/></svg>;
}

function SmallIcon({ name }: { name: "download" | "volume" }) {
  return name === "download"
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4ZM17 9a4 4 0 0 1 0 6M20 6a8 8 0 0 1 0 12"/></svg>;
}

export function BriefingAudioPlayer({
  audio,
  compact = false,
}: {
  audio: PublishedBriefingAudio;
  compact?: boolean;
}) {
  const playerRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);

  const toggle = async () => {
    const player = playerRef.current;
    if (!player) return;
    if (!player.paused) { player.pause(); return; }
    try { setError(false); await player.play(); }
    catch { setError(true); }
  };

  const progress = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;
  const fileExtension = audio.fileName.toLowerCase().endsWith(".mp3") ? "mp3" : "m4a";
  const downloadName = "SAS-briefing-" + audio.editionSlug + "." + fileExtension;
  const downloadUrl = audio.url + (audio.url.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(downloadName);

  return (
    <section className={"sas-briefing-audio" + (compact ? " sas-briefing-audio--compact" : "")}
      aria-label="النسخة الصوتية للإحاطة اليومية">
      <div className="sas-briefing-audio__heading">
        <span aria-hidden="true" className="sas-briefing-audio__symbol"><AudioAiMark/></span>
        <div className="sas-briefing-audio__heading-copy">
          <strong>الإحاطة الصوتية</strong>
          <span>موجز إخباري بصوت مولّد بالذكاء الاصطناعي</span>
        </div>
        <span className="sas-briefing-audio__duration">{formatDuration(duration)}</span>
      </div>
      <audio ref={playerRef} preload="metadata" src={audio.url}
        onLoadedMetadata={event => {
          const next = event.currentTarget.duration;
          if (Number.isFinite(next) && next > 0) setDuration(next);
        }}
        onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setPosition(0); }}
        onError={() => setError(true)}/>
      <div className="sas-briefing-audio__controls">
        <button type="button" className="sas-briefing-audio__toggle" onClick={toggle}
          aria-label={playing ? "إيقاف الإحاطة الصوتية مؤقتًا" : "تشغيل الإحاطة الصوتية"}
          title={playing ? "إيقاف مؤقت" : "تشغيل"}>
          <PlayStateIcon playing={playing}/>
        </button>
        <div className="sas-briefing-audio__timeline">
          <input aria-label="موضع الاستماع" type="range" min="0" max={Math.max(1,duration)}
            step="0.1" value={Math.min(position,duration)}
            style={{"--sas-audio-progress": progress + "%"} as CSSProperties}
            onChange={event => {
              const next = Number(event.target.value);
              if (playerRef.current) playerRef.current.currentTime = next;
              setPosition(next);
            }}/>
          <div className="sas-briefing-audio__times" dir="ltr">
            <time>{formatDuration(position)}</time><time>{formatDuration(duration)}</time>
          </div>
        </div>
      </div>
      <div className="sas-briefing-audio__extras">
        <label className="sas-briefing-audio__speed">سرعة الاستماع
          <select aria-label="سرعة تشغيل التسجيل" value={speed} onChange={event => {
            const next = Number(event.target.value);
            setSpeed(next);
            if (playerRef.current) playerRef.current.playbackRate = next;
          }}>
            <option value={0.75}>0.75×</option><option value={1}>1×</option>
            <option value={1.25}>1.25×</option><option value={1.5}>1.5×</option>
          </select>
        </label>
        <label className="sas-briefing-audio__volume"><SmallIcon name="volume"/>
          <input type="range" aria-label="مستوى الصوت" min={0} max={1} step={0.05}
            value={volume} onChange={event => {
              const next = Number(event.target.value);
              setVolume(next);
              if (playerRef.current) playerRef.current.volume = next;
            }}/>
        </label>
        <a className="sas-briefing-audio__download" href={downloadUrl}
          target="_blank" rel="noopener noreferrer" download={downloadName}>
          <SmallIcon name="download"/> تنزيل
        </a>
      </div>
      {error ? <p role="alert">تعذر تشغيل التسجيل. يمكنك تجربة تنزيله مباشرة.</p> : null}
    </section>
  );
}
