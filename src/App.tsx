import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowUp, AudioLines, Cake, Camera, Gift, Heart, Mail, Music2,
  Sparkles, Volume2, VolumeX,
} from "lucide-react";
import ButterflyCanvas from "./components/ButterflyCanvas";
import {
  CakeSection, GiftModal, GiftsSection, HeroSection, LetterSection, Lightbox,
  MemoriesSection, MicrophoneHelp, WishesSection, type AgeParts, type GiftInfo, type Wish,
} from "./components/BirthdaySections";

const BIRTH_DATE = new Date(2010, 10, 22, 0, 0, 0);
const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Sparkles },
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "memories", label: "Kenangan", icon: Camera },
  { id: "gifts", label: "Kado", icon: Gift },
  { id: "letter", label: "Surat", icon: Mail },
  { id: "wishes", label: "Harapan", icon: Heart },
];
const WISH_KEY = "miel-birthday-wishes";

function getAgeParts(now: Date): AgeParts {
  const elapsed = Math.max(0, now.getTime() - BIRTH_DATE.getTime());
  const totalSeconds = Math.floor(elapsed / 1000);
  const birthdayThisYear = new Date(now.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
  const years = now.getFullYear() - BIRTH_DATE.getFullYear() - (now < birthdayThisYear ? 1 : 0);
  const ageStart = new Date(now.getFullYear() - (now < birthdayThisYear ? 1 : 0), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
  const days = Math.floor((now.getTime() - ageStart.getTime()) / 86_400_000);
  return {
    years,
    days,
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
  };
}

function fireConfetti() {
  const colors = ["#1d4ed8", "#2563eb", "#38bdf8", "#93c5fd", "#ffffff"];
  confetti({ particleCount: 85, spread: 72, origin: { x: 0.06, y: 0.7 }, colors, scalar: 0.9, zIndex: 160 });
  confetti({ particleCount: 85, spread: 72, origin: { x: 0.94, y: 0.7 }, colors, scalar: 0.9, zIndex: 160 });
}

function loadWishes(): Wish[] {
  try {
    const saved = localStorage.getItem(WISH_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved wishes should be a list.");
    return parsed.filter((wish): wish is Wish => typeof wish?.id === "string" && typeof wish?.text === "string" && typeof wish?.createdAt === "number");
  } catch (error) {
    console.error("Could not load saved wishes.", error);
    return [];
  }
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [age, setAge] = useState(() => getAgeParts(new Date()));
  const [candlesOn, setCandlesOn] = useState(true);
  const [blown, setBlown] = useState(false);
  const [gift, setGift] = useState<GiftInfo | null>(null);
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const [wishes, setWishes] = useState<Wish[]>(loadWishes);
  const [photos, setPhotos] = useState<(string | null)[]>(() => Array(6).fill(null) as (string | null)[]);
  const [notice, setNotice] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);
  const micRef = useRef<{ stream: MediaStream; audio: AudioContext; interval: number; watchdog: number } | null>(null);
  const photoUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setAge(getAgeParts(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishes));
    } catch (error) {
      console.error("Could not save wishes.", error);
      setNotice("Harapan belum tersimpan. Periksa ruang penyimpanan browser.");
    }
  }, [wishes]);

  useEffect(() => () => {
    if (musicTimerRef.current !== null) window.clearInterval(musicTimerRef.current);
    if (micRef.current) {
      window.clearInterval(micRef.current.interval);
      micRef.current.stream.getTracks().forEach((track) => track.stop());
      void micRef.current.audio.close();
    }
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    void audioContextRef.current?.close();
  }, []);

  const playNote = useCallback((frequency: number, when = 0) => {
    const audio = audioContextRef.current;
    if (!audio || audio.state !== "running") return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.028, audio.currentTime + when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + 1.05);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(audio.currentTime + when);
    oscillator.stop(audio.currentTime + when + 1.1);
  }, []);

  const startMusic = useCallback(async () => {
    try {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) throw new Error("Browser ini belum mendukung Web Audio.");
      const audio = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = audio;
      if (audio.state === "suspended") await audio.resume();
      const melody = [392, 392, 440, 392, 523.25, 493.88, 392, 392, 440, 392, 587.33, 523.25, 392, 392, 783.99, 659.25, 523.25, 493.88, 440];
      noteIndexRef.current = 0;
      const playNext = () => {
        const index = noteIndexRef.current % melody.length;
        playNote(melody[index]);
        if (index % 4 === 0) playNote(melody[(index + 2) % melody.length] / 2, 0.12);
        noteIndexRef.current += 1;
      };
      playNext();
      musicTimerRef.current = window.setInterval(playNext, 560);
      setMusicOn(true);
      setNotice(null);
    } catch (error) {
      console.error("Could not start the birthday music.", error);
      setMusicOn(false);
      setNotice("Musik tidak dapat diputar di browser ini. Coba aktifkan kembali setelah interaksi.");
    }
  }, [playNote]);

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current !== null) window.clearInterval(musicTimerRef.current);
    musicTimerRef.current = null;
    setMusicOn(false);
  }, []);

  const openSurprise = () => {
    setOpened(true);
    fireConfetti();
    void startMusic();
    window.setTimeout(() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }), 450);
  };

  const extinguishCandles = () => {
    if (!candlesOn) return;
    setCandlesOn(false);
    setBlown(true);
    fireConfetti();
  };

  const stopMicrophone = useCallback(() => {
    const current = micRef.current;
    if (!current) return;
    window.clearInterval(current.interval);
    window.clearTimeout(current.watchdog);
    current.stream.getTracks().forEach((track) => track.stop());
    void current.audio.close();
    micRef.current = null;
  }, []);

  const startMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice("Mikrofon tidak tersedia. Coba tombol “Tiup lilin” sebagai gantinya.");
      return;
    }
    let stream: MediaStream | null = null;
    let audio: AudioContext | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audio = new AudioContext();
      const source = audio.createMediaStreamSource(stream);
      const analyser = audio.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      setNotice("Mikrofon aktif — tiup ke arah perangkatmu.");
      const interval = window.setInterval(() => {
        analyser.getByteTimeDomainData(samples);
        const volume = samples.reduce((sum, sample) => sum + Math.abs(sample - 128), 0) / samples.length;
        if (volume > 13) {
          stopMicrophone();
          setNotice("Harapanmu sudah terbang! ✨");
          extinguishCandles();
          window.setTimeout(() => setNotice(null), 3000);
        }
      }, 100);
      const watchdog = window.setTimeout(() => {
        if (micRef.current?.stream === stream) {
          stopMicrophone();
          setNotice("Belum terdengar tiupan. Coba lagi atau gunakan tombol tiup lilin.");
          window.setTimeout(() => setNotice(null), 3500);
        }
      }, 12_000);
      micRef.current = { stream, audio, interval, watchdog };
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (audio) void audio.close();
      console.error("Could not access the microphone.", error);
      setNotice("Akses mikrofon ditolak atau tidak tersedia. Kamu tetap bisa memakai tombol tiup lilin.");
    }
  };

  const addWish = (text: string) => {
    const wish: Wish = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: Date.now() };
    setWishes((previous) => [wish, ...previous]);
    confetti({ particleCount: 24, spread: 50, origin: { x: 0.5, y: 0.75 }, colors: ["#38bdf8", "#93c5fd", "#ffffff"], zIndex: 160 });
    return wish.id;
  };

  const handleUpload = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Pilih file gambar agar bisa ditambahkan ke polaroid.");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    const previousUrl = photos[index];
    if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
    photoUrlsRef.current.push(url);
    setPhotos((previous) => {
      const updated = [...previous];
      updated[index] = url;
      return updated;
    });
    setNotice("Foto berhasil ditambahkan ke kenanganmu.");
    window.setTimeout(() => setNotice(null), 2500);
    event.target.value = "";
  };

  const openGift = (selected: GiftInfo) => {
    setGift(selected);
    if (selected.label === "01 / KUPON") {
      confetti({ particleCount: 36, spread: 55, origin: { x: 0.5, y: 0.6 }, colors: ["#1d4ed8", "#38bdf8", "#ffffff"], zIndex: 160 });
    }
  };

  const summonSwarm = () => window.dispatchEvent(new Event("summon-swarm"));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setGift(null);
        setLightbox(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <ButterflyCanvas />
      <header className="topbar">
        <a className="brand-mark" href="#home" aria-label="Kembali ke awal"><span className="brand-icon" aria-hidden="true">🦋</span><span>miel malop<span className="brand-dot">.</span></span></a>
        <a className="topbar-date" href="#birthday">A LITTLE BIRTHDAY UNIVERSE <span>✦</span></a>
        <button className="sound-toggle" onClick={musicOn ? stopMusic : () => void startMusic()} aria-label={musicOn ? "Matikan musik" : "Putar musik"}>
          {musicOn ? <Volume2 size={16} /> : <VolumeX size={16} />}<span>{musicOn ? "Sound on" : "Sound off"}</span>
        </button>
      </header>

      <main>
        <HeroSection age={age} />
        <CakeSection candlesOn={candlesOn} blown={blown} onBlow={extinguishCandles} onRelight={() => { setCandlesOn(true); setBlown(false); }} onMic={() => void startMicrophone()} />
        <MemoriesSection images={photos} onUpload={handleUpload} onZoom={(image, title) => setLightbox({ image, title })} />
        <GiftsSection onOpen={openGift} />
        <LetterSection />
        <WishesSection wishes={wishes} onAdd={addWish} />
      </main>

      <footer className="footer">
        <span className="footer-butterfly">🦋</span><p>Dibuat dengan sepenuh hati, khusus untuk merayakan hari spesialmu.</p><span className="footer-heart"><Heart size={14} fill="currentColor" /></span>
      </footer>

      <nav className="floating-dock" aria-label="Navigasi bagian">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} title={label} aria-label={`Ke ${label}`}><Icon size={18} /><span>{label}</span></a>)}
        <span className="dock-divider" />
        <button onClick={musicOn ? stopMusic : () => void startMusic()} title={musicOn ? "Pause musik" : "Play musik"} aria-label={musicOn ? "Pause musik" : "Play musik"} className={musicOn ? "music-active" : ""}>{musicOn ? <AudioLines size={18} /> : <Music2 size={18} />}<span>{musicOn ? "Pause" : "Musik"}</span></button>
        <button onClick={fireConfetti} title="Rayakan" aria-label="Ledakkan confetti"><Sparkles size={18} /><span>Rayakan</span></button>
      </nav>
      <div className="swarm-control">
        <button onClick={summonSwarm} aria-label="Panggil lebih banyak kupu-kupu"><span aria-hidden="true">🦋</span><span>Panggil kupu-kupu</span></button>
      </div>
      <a className="back-top" href="#home" aria-label="Kembali ke atas"><ArrowUp size={18} /></a>

      <AnimatePresence>
        {!opened && <motion.div className="opening-curtain" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}>
          <div className="opening-grain" />
          <motion.div className="opening-card glass-card" initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.18, type: "spring", stiffness: 70, damping: 16 } }}>
            <span className="opening-kicker"><Sparkles size={14} /> A LITTLE SOMETHING FOR YOU</span>
            <div className="wax-seal"><span aria-hidden="true">🦋</span></div>
            <span className="opening-script">for Miel Malop</span>
            <h1>A day as lovely<br />as <em>you are.</em></h1>
            <p>Ada kejutan kecil, kenangan, dan banyak doa baik yang menunggumu di dalam.</p>
            <button className="button button-primary opening-button" onClick={openSurprise}>Buka kejutan spesial <Sparkles size={17} /></button>
            <span className="opening-footnote">MADE WITH LOVE · 22.11.26</span>
          </motion.div>
          <div className="opening-edge opening-edge-left">✧</div><div className="opening-edge opening-edge-right">✦</div>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {gift && <GiftModal gift={gift} onClose={() => setGift(null)} />}
        {lightbox && <Lightbox image={lightbox.image} title={lightbox.title} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
      <MicrophoneHelp state={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
