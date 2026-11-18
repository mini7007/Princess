"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Gift, Heart, LetterText, Menu, Pause, Play,
  Repeat2, RotateCcw, SkipBack, SkipForward, Sparkles, Volume2, VolumeX, X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { princessDay } from "@/src/content/princess-day";

const scenes = ["Portal", "Introduction", "Memories", "Letters", "Radio", "25 Reasons", "Surprises", "Wishes", "Hug", "Future Dreams", "Your Message", "Farewell"];

function SparklesLayer() {
  return <div className="sparkle-field" aria-hidden="true">{Array.from({ length: 18 }).map((_, i) =>
    <span key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, animationDelay: `${(i % 7) * 0.35}s` }}>✦</span>
  )}</div>;
}

type SceneProps = {
  scene: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  track: number;
  setTrack: (track: number) => void;
  playing: boolean;
  toggleTrack: () => Promise<void>;
  changeTrack: (delta: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  progress: number;
  setProgress: (progress: number) => void;
  error: string;
  repeat: boolean;
  setRepeat: (repeat: boolean) => void;
  setPlaying: (playing: boolean) => void;
  go: (scene: number) => void;
};

function SceneContent(props: SceneProps) {
  const { scene } = props;
  const [openLetter, setOpenLetter] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [openGifts, setOpenGifts] = useState<number[]>([]);
  const [hugged, setHugged] = useState(false);
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitMessage = async () => {
    setSending(true); setSubmitError("");
    const response = await fetch("/api/princess-day-message", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, mood }),
    }).catch(() => null);
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setSubmitError(data?.error || "We could not send your message.");
    } else setSent(true);
    setSending(false);
  };

  if (scene === 1) return (
    <div className="profile-layout content-width">
      <div className="portrait-frame"><div className="portrait-placeholder"><Heart /><span>Royal portrait</span><small>Add her photo in media.ts</small></div></div>
      <div className="profile-copy"><p className="eyebrow">Meet the Princess</p><h2>{princessDay.recipientName}</h2><div className="royal-title">THE ONE &amp; ONLY</div>
        <p className="profile-compliment">{princessDay.introduction}</p><span className="signature">Since {princessDay.relationshipStart}</span></div>
    </div>
  );
  if (scene === 2) return (
    <div className="content-width"><div className="section-heading"><p className="eyebrow">Our little moments</p><h2>Little moments, endless memories.</h2></div>
      {princessDay.gallery.length === 0 ? <div className="empty-gallery"><div className="empty-polaroid">♡</div><h3>A gallery waiting for memories</h3><p>Add ImageKit photo URLs, titles and captions in <code>src/content/media.ts</code>.</p></div> :
        <div className="gallery-grid">{princessDay.gallery.map((photo) => <article key={photo.src} className="polaroid"><img src={photo.src} alt={photo.title} loading="lazy" decoding="async" /><strong>{photo.title}</strong>{photo.caption && <small>{photo.caption}</small>}</article>)}</div>}
    </div>
  );
  if (scene === 3) return (
    <div className="content-width"><div className="section-heading"><p className="eyebrow">Letters from Mohan</p><h2>Some things deserve to be written.</h2></div>
      <div className="letter-grid">{princessDay.letters.map((letter, i) => <button key={letter.title} className="envelope" onClick={() => setOpenLetter(openLetter === i ? null : i)}>
        <span className="seal">M</span><LetterText /><strong>{letter.title}</strong><small>{openLetter === i ? "Close letter" : "Open letter"}</small>
      </button>)}</div>
      <AnimatePresence>{openLetter !== null && <motion.div className="letter-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.article initial={{ y: 30, scale: 0.96 }} animate={{ y: 0, scale: 1 }}><button onClick={() => setOpenLetter(null)} aria-label="Close letter"><X /></button><p className="eyebrow">A letter for you</p><h3>{princessDay.letters[openLetter].title}</h3><p className="letter-body">{princessDay.letters[openLetter].body}</p><span className="signature">With love, Mohan ♡</span></motion.article>
      </motion.div>}</AnimatePresence>
    </div>
  );
  if (scene === 4) {
    const song = princessDay.music[props.track];
    const audioRef = props.audioRef;
    return (
      <div className="content-width radio-layout"><div className="section-heading"><p className="eyebrow">Our little radio</p><h2>A song for every little feeling.</h2></div>
        <div className="player"><div className="record"><div className="record-label">♫</div></div><div className="player-copy"><p>NOW PLAYING</p><h3>{song.title}</h3><span>{song.artist}</span></div>
          <audio ref={audioRef} src={song.url || undefined} preload="metadata" onTimeUpdate={(e) => props.setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
            onEnded={() => props.repeat ? audioRef.current?.play() : props.changeTrack(1)} onError={() => props.setPlaying(false)} />
          {props.error && <p className="player-error">{props.error}</p>}
          <input className="progress" type="range" min="0" max="100" value={props.progress * 100} onChange={(e) => { const audio = audioRef.current; if (audio?.duration) audio.currentTime = (Number(e.target.value) / 100) * audio.duration; }} />
          <div className="player-buttons"><button onClick={() => props.changeTrack(-1)}><SkipBack /></button><button className="play-main" onClick={props.toggleTrack}>{props.playing ? <Pause /> : <Play />}</button><button onClick={() => props.changeTrack(1)}><SkipForward /></button></div>
          <div className="player-tools"><button onClick={() => props.setRepeat(!props.repeat)} className={props.repeat ? "active" : ""}><Repeat2 /></button><button onClick={() => props.setMuted(!props.muted)}>{props.muted ? <VolumeX /> : <Volume2 />}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={props.volume} onChange={(e) => props.setVolume(Number(e.target.value))} /></div>
        </div>
        <div className="playlist">{princessDay.music.map((item, i) => <button key={item.title} className={i === props.track ? "active" : ""} onClick={() => { props.setTrack(i); props.setProgress(0); props.setPlaying(false); }}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.artist}</small></button>)}</div>
      </div>
    );
  }
  if (scene === 5) return (
    <div className="content-width"><div className="section-heading"><p className="eyebrow">25 little reasons</p><h2>Why you&apos;re so special.</h2></div><div className="reason-grid">{princessDay.reasons.map((reason, i) => <motion.button key={i} className={`reason-card ${flipped.includes(i) ? "flipped" : ""}`} onClick={() => setFlipped((old) => old.includes(i) ? old.filter((n) => n !== i) : [...old, i])} whileTap={{ scale: 0.97 }}><span>{String(i + 1).padStart(2, "0")}</span>{flipped.includes(i) ? <strong>{reason}</strong> : <><Heart /><small>Tap to reveal</small></>}</motion.button>)}</div></div>
  );
  if (scene === 6) return (
    <div className="content-width"><div className="section-heading"><p className="eyebrow">Open your surprises</p><h2>I kept some little surprises for you.</h2></div><div className="gift-grid">{princessDay.gifts.map((gift, i) => <motion.button key={i} className={`gift-box ${openGifts.includes(i) ? "open" : ""}`} onClick={() => setOpenGifts((old) => old.includes(i) ? old : [...old, i])} whileHover={{ y: -5 }}><Gift /><span>Surprise {i + 1}</span>{openGifts.includes(i) && <strong>{gift}</strong>}</motion.button>)}</div></div>
  );
  if (scene === 7) return (
    <div className="wishes-wrap"><div className="section-heading"><p className="eyebrow">My wishes for you</p><h2>If I could wish a thousand beautiful things...</h2></div><div className="wish-grid">{princessDay.wishes.map((wish, i) => <motion.div key={wish} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}><span>✦</span><p>{wish}</p></motion.div>)}</div></div>
  );
  if (scene === 8) return (
    <div className="hug-layout"><div className="section-heading"><p className="eyebrow">A little hug from me</p><h2>Consider this your virtual hug.</h2></div>
      <motion.button className={`teddy ${hugged ? "hugged" : ""}`} onClick={() => setHugged(!hugged)} aria-label="Give the teddy a hug"><div className="bear-ear left">•</div><div className="bear-ear right">•</div><div className="bear-face">◡</div><Heart className="bear-heart" /><span>Tap for a hug</span></motion.button>
      <AnimatePresence>{hugged && <motion.p className="hug-message" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Heart fill="currentColor" /> {princessDay.hugMessage}</motion.p>}</AnimatePresence>
      {hugged && <button className="replay-button" onClick={() => { setHugged(false); setTimeout(() => setHugged(true), 100); }}><RotateCcw /> Replay</button>}
    </div>
  );
  if (scene === 9) return (
    <div className="content-width"><div className="section-heading"><p className="eyebrow">Our future dreams</p><h2>Some beautiful things are still waiting to happen.</h2></div><div className="dream-grid">{princessDay.futureDreams.map((dream, i) => <motion.article key={dream.title} initial={{ rotate: i % 2 ? 2 : -2 }} whileHover={{ rotate: 0, y: -6 }}><span>{String(i + 1).padStart(2, "0")}</span><h3>{dream.title}</h3><p>{dream.text}</p></motion.article>)}</div></div>
  );
  if (scene === 10) return (
    <div className="message-layout"><div className="section-heading"><p className="eyebrow">Your turn, Princess</p><h2>Your message to Mohan.</h2><p>I made this little world for you. If anything made you smile, or if there&apos;s something you want to tell me, I&apos;d love to hear it.</p></div>
      {sent ? <motion.div className="sent-state" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Heart fill="currentColor" /><h3>Your little message was saved.</h3><p>Thank you for leaving something from your heart. <span>♡</span></p></motion.div> :
      <div className="message-form"><div className="mood-options">{["You made me smile.", "This was adorable.", "I loved the surprises.", "I have something to tell you.", "Just sending you a hug."].map((option) => <button key={option} className={mood === option ? "active" : ""} onClick={() => setMood(option)}>{option}</button>)}</div><textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} placeholder="Leave a little message for me..." /><button className="primary-button" disabled={sending || !message.trim()} onClick={submitMessage}>{sending ? "Saving..." : "Send a little message"} <Heart size={18} /></button>{submitError && <p className="form-error">{submitError}</p>}</div>}
    </div>
  );
  if (scene === 11) return (
    <div className="farewell"><motion.div className="farewell-heart" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}><Heart fill="currentColor" /></motion.div><p className="eyebrow">One last thing, my princess</p><h2>{princessDay.finalMessage}</h2><p className="farewell-signature">With lots of love,<br /><strong>Mohan ♡</strong></p><button className="primary-button" onClick={() => props.go(1)}><RotateCcw /> Visit My Kingdom Again</button></div>
  );
  return null;
}

export default function PrincessKingdom() {
  const [scene, setScene] = useState(0);
  const [entered, setEntered] = useState(false);
  const [menu, setMenu] = useState(false);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("kingdom-scene");
    if (saved) setScene(Math.min(Number(saved), scenes.length - 1));
  }, []);

  useEffect(() => { sessionStorage.setItem("kingdom-scene", String(scene)); }, [scene]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = muted ? 0 : volume; }, [volume, muted]);

  const go = (next: number) => {
    setScene(Math.max(0, Math.min(scenes.length - 1, next)));
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleTrack = async () => {
    const audio = audioRef.current;
    if (!audio?.src) { setError("A song has not been added yet."); return; }
    if (playing) audio.pause();
    else await audio.play().catch(() => setError("This song could not be played."));
    setPlaying(!playing);
  };
  const changeTrack = (delta: number) => {
    setTrack((value) => (value + delta + princessDay.music.length) % princessDay.music.length);
    setProgress(0); setPlaying(false);
  };

  return (
    <main className="kingdom-shell">
      <SparklesLayer />
      {!entered ? (
        <section className="portal scene">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="castle" aria-label="Pink castle">
            <div className="castle-crown">♕</div><div className="castle-window">♥</div>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="portal-copy">
            <p className="eyebrow">A magical gift for</p>
            <h1>Welcome, Princess {princessDay.recipientName} <span>👑</span></h1>
            <p>{princessDay.openingMessage}</p><p className="yes">Yes, that&apos;s you!</p>
            <button className="primary-button" onClick={() => { setEntered(true); go(1); }}>Enter My Little Kingdom <Sparkles size={18} /></button>
          </motion.div>
        </section>
      ) : (
        <>
          <header className="kingdom-nav">
            <button className="brand" onClick={() => go(0)}><span>♕</span> Bacha&apos;s Kingdom</button>
            <button className="menu-button" onClick={() => setMenu(true)} aria-label="Open scene navigation"><Menu /></button>
          </header>
          <AnimatePresence mode="wait">
            <motion.section key={scene} className="scene" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }}>
              <SceneContent scene={scene} audioRef={audioRef} track={track} setTrack={setTrack} playing={playing} toggleTrack={toggleTrack}
                changeTrack={changeTrack} muted={muted} setMuted={setMuted} volume={volume} setVolume={setVolume}
                progress={progress} setProgress={setProgress} error={error} repeat={repeat} setRepeat={setRepeat}
                setPlaying={setPlaying} go={go} />
            </motion.section>
          </AnimatePresence>
          <footer className="scene-controls">
            <button onClick={() => go(scene - 1)} disabled={scene <= 1}><ArrowLeft /> <span>Back</span></button>
            <div className="progress-dots">{scenes.slice(1).map((_, i) => <button key={i} className={i + 1 === scene ? "active" : ""} onClick={() => go(i + 1)} aria-label={`Go to ${scenes[i + 1]}`} />)}</div>
            <button onClick={() => go(scene + 1)} disabled={scene >= scenes.length - 1}><span>Next</span> <ArrowRight /></button>
          </footer>
          {playing && <button className="mini-player" onClick={() => go(4)}>♫ <span>Little Radio</span></button>}
        </>
      )}
      <AnimatePresence>{menu && <motion.aside className="nav-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
        <button className="drawer-close" onClick={() => setMenu(false)} aria-label="Close navigation"><X /></button>
        <p className="eyebrow">Explore the kingdom</p>
        {scenes.map((name, i) => <button key={name} className={scene === i ? "active" : ""} onClick={() => i === 0 ? go(0) : go(i)}><span>{String(i).padStart(2, "0")}</span>{name}</button>)}
      </motion.aside>}</AnimatePresence>
    </main>
  );
}
