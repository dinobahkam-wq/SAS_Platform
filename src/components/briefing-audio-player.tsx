"use client";

import { useRef, useState } from "react";
import type { PublishedBriefingAudio } from "@/lib/briefing-audio";
import "./briefing-audio-player.css";

function formatDuration(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds));
  return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
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
    try { await player.play(); }
    catch { setError(true); }
  };
  return (
    <section className={"sas-briefing-audio" + (compact ? " sas-briefing-audio--compact" : "")}
      aria-label="النسخة الصوتية للإحاطة اليومية">
      <div className="sas-briefing-audio__heading">
        <span aria-hidden="true" className="sas-briefing-audio__symbol">♫</span>
        <div><strong>الإحاطة الصوتية</strong><span>موجز إذاعي لأبرز تطورات العدد</span></div>
        <span className="sas-briefing-audio__duration">{formatDuration(duration)}</span>
      </div>
      <audio ref={playerRef} preload="metadata" src={audio.url}
        onLoadedMetadata={event => {
          const t = event.currentTarget.duration;
          if (Number.isFinite(t) && t > 0) setDuration(t);
        }}
        onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)} />
      <div className="sas-briefing-audio__controls">
        <button type="button" className="sas-briefing-audio__toggle" aria-label={playing ? "إيقاف مؤقت" : "تشغيل الإحاطة الصوتية"} onClick={toggle}>
          {playing ? "Ⅱ" : "▶"}
        </button>
        <div className="sas-briefing-audio__timeline">
          <input aria-label="موضع الاستماع" type="range" min="0" max={Math.max(1,duration)}
            step="0.1" value={Math.min(position,duration)}
            onChange={event => {
              const next = Number(event.target.value);
              if (playerRef.current) playerRef.current.currentTime = next;
              setPosition(next);
            }} />
          <div className="sas-briefing-audio__times" dir="ltr">
            <time>{formatDuration(position)}</time><time>{formatDuration(duration)}</time>
          </div>
        </div>
      </div>
      <div className="sas-briefing-audio__extras">
        <label>السرعة
          <select aria-label="سرعة تشغيل التسجيل" value={speed} onChange={event => {
            const next = Number(event.target.value); setSpeed(next);
            if (playerRef.current) playerRef.current.playbackRate = next;
          }}>
            <option value={0.75}>0.75×</option><option value={1}>1×</option>
            <option value={1.25}>1.25×</option><option value={1.5}>1.5×</option>
          </select>
        </label>
        <label>الصوت <input type="range" aria-label="مستوى الصوت" min={0} max={1} step={0.05}
          value={volume} onChange={event => {
            const next = Number(event.target.value); setVolume(next);
            if (playerRef.current) playerRef.current.volume = next;
          }}/></label>
        <a href={audio.url + "?download=" + encodeURIComponent("SAS-briefing-" + audio.editionSlug + ".m4a")}
          target="_blank" rel="noopener noreferrer" download>تنزيل التسجيل</a>
      </div>
      {error ? <p role="alert">تعذر تشغيل التسجيل. يمكنك تجربة تنزيله مباشرة.</p> : null}
    </section>
  );
}
