import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowUp, Heart, Sparkles,
} from "lucide-react";
import ButterflyCanvas from "./components/ButterflyCanvas";
import {
  CakeSection, GiftModal, GiftsSection, HeroSection, LetterSection, Lightbox,
  MemoriesSection, MicrophoneHelp, WishesSection, type AgeParts, type GiftInfo, type Wish,
} from "./components/BirthdaySections";
import {
  BirthdayGachaponSection, BirthdayVibeSection, ButterflyCatchSection,
  EXTRA_DOCK_LINKS, StarlightConstellationSection,
} from "./components/BirthdayExtras";
import { loadPhotos, savePhoto } from "./photoStorage";

const BIRTH_DATE = new Date(2010, 10, 22, 0, 0, 0);
const WISH_KEY = "miel-birthday-wishes";
const SPOTIFY_IFRAME_API = "https://open.spotify.com/embed/iframe-api/v1";
const SPOTIFY_TRACKS = [
  { id: "6H67gFuycHyTOROX2M4bbs", title: "bad", artist: "wave to earth" },
  { id: "7IVukH71OXfAu3KudrrizN", title: "Japanese Denim", artist: "Daniel Caesar" },
  { id: "5TpPSTItCwtZ8Sltr3vdzm", title: "Last Night on Earth", artist: "Green Day" },
  { id: "04tvOIuyk8y0QVA8Ta0UOd", title: "Untuk Mencintaimu", artist: "Seventeen" },
  { id: "6ZGgaShxOimGDfRz1T1zje", title: "Alexandra", artist: "Reality Club" },
  { id: "2QB8FwOszur18Ai7t2XnNi", title: "Anything You Want", artist: "Reality Club" },
  { id: "0QPdjsMOUhwouq1NS3HwfQ", title: "Coming Up Roses", artist: "Harry Styles" },
  { id: "0ClPIeT6MSgfSgQ9ZrJbAq", title: "Cheating on You", artist: "Charlie Puth" },
  { id: "2EIUQkawLEdWDytIL0mQV8", title: "Who are you?", artist: "Saga Faye" },
  { id: "1vg0ZHaTvBwlNxLxyYrEvP", title: "you!", artist: "LANY" },
  { id: "0bHer4P44xn8jcyMH0EMs8", title: "Neu Roses (Transgressor's Song)", artist: "Daniel Caesar" },
  { id: "3EOzLBxti9kA01UvwfbPxs", title: "TOO DEEP TO TURN BACK", artist: "Daniel Caesar" },
  { id: "6VaXKBNmGPX8WPNhMX3OEV", title: "I Lay My Love on You", artist: "Westlife" },
  { id: "2v0vKdardqBzAPhObJyAvd", title: "Panasea", artist: "rumahsakit" },
] as const;

type SpotifyEmbedController = {
  destroy: () => void;
  loadUri: (uri: string) => void;
  play: () => void;
};
type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

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
  const [age, setAge] = useState(() => getAgeParts(new Date()));
  const [candlesOn, setCandlesOn] = useState(true);
  const [blown, setBlown] = useState(false);
  const [gift, setGift] = useState<GiftInfo | null>(null);
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const [wishes, setWishes] = useState<Wish[]>(loadWishes);
  const [selectedTrack, setSelectedTrack] = useState<(typeof SPOTIFY_TRACKS)[number]>(SPOTIFY_TRACKS[0]);
  const [photos, setPhotos] = useState<(string | null)[]>(() => Array(6).fill(null) as (string | null)[]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const spotifyHostRef = useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = useRef<SpotifyEmbedController | null>(null);
  const selectedTrackRef = useRef<(typeof SPOTIFY_TRACKS)[number]>(SPOTIFY_TRACKS[0]);
  const musicRequestedRef = useRef(false);
  const micRef = useRef<{ stream: MediaStream; audio: AudioContext; interval: number; watchdog: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadPhotos().then((savedPhotos) => {
      if (cancelled) return;
      setPhotos(savedPhotos);
    }).catch((error: unknown) => {
      console.error("Could not load saved photos.", error);
      if (!cancelled) setNotice(error instanceof Error ? error.message : "Foto bersama tidak dapat dimuat.");
    }).finally(() => {
      if (!cancelled) setPhotosLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setAge(getAgeParts(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleApiError = () => {
      musicRequestedRef.current = false;
      setNotice("Pemutar Spotify tidak dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.");
    };
    const onSpotifyIframeApiReady = (api: SpotifyIframeApi) => {
      const host = spotifyHostRef.current;
      if (!host) return;
      const initialTrackId = selectedTrackRef.current.id;
      api.createController(host, {
        uri: `spotify:track:${initialTrackId}`,
        width: "100%",
        height: "80",
      }, (controller) => {
        spotifyControllerRef.current = controller;
        if (selectedTrackRef.current.id !== initialTrackId) {
          controller.loadUri(`spotify:track:${selectedTrackRef.current.id}`);
        }
        if (musicRequestedRef.current) controller.play();
      });
    };

    window.onSpotifyIframeApiReady = onSpotifyIframeApiReady;
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SPOTIFY_IFRAME_API}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SPOTIFY_IFRAME_API;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("error", handleApiError);

    return () => {
      script?.removeEventListener("error", handleApiError);
      if (window.onSpotifyIframeApiReady === onSpotifyIframeApiReady) {
        window.onSpotifyIframeApiReady = undefined;
      }
      spotifyControllerRef.current?.destroy();
      spotifyControllerRef.current = null;
    };
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
    if (micRef.current) {
      window.clearInterval(micRef.current.interval);
      micRef.current.stream.getTracks().forEach((track) => track.stop());
      void micRef.current.audio.close();
    }
  }, []);

  const startMusic = () => {
    musicRequestedRef.current = true;
    setNotice(null);
    spotifyControllerRef.current?.play();
  };

  const selectTrack = (trackId: string) => {
    const track = SPOTIFY_TRACKS.find((option) => option.id === trackId);
    if (!track) return;
    selectedTrackRef.current = track;
    setSelectedTrack(track);
    musicRequestedRef.current = true;
    setNotice(null);
    const controller = spotifyControllerRef.current;
    if (controller) {
      controller.loadUri(`spotify:track:${track.id}`);
      controller.play();
    }
  };

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

  const handleUpload = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = "";
    let result: Awaited<ReturnType<typeof savePhoto>>;
    try {
      result = await savePhoto(index, file);
    } catch (error) {
      console.error("Could not save uploaded photo.", error);
      setNotice(error instanceof Error ? error.message : "Foto gagal disimpan ke GitHub.");
      return;
    }
    setPhotos((previous) => {
      const updated = [...previous];
      updated[index] = result.url;
      return updated;
    });
    setNotice(result.cleanupWarning
      ? "Foto tersimpan dan terlihat oleh semua. Versi lama masih tersimpan di GitHub."
      : "Foto tersimpan di GitHub dan terlihat oleh semua.");
    window.setTimeout(() => setNotice(null), 2500);
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
      </header>

      <main>
        <HeroSection age={age} />
        <CakeSection candlesOn={candlesOn} blown={blown} onBlow={extinguishCandles} onRelight={() => { setCandlesOn(true); setBlown(false); }} onMic={() => void startMicrophone()} />
        <MemoriesSection
          images={photos}
          onUpload={handleUpload}
          onZoom={(image, title) => setLightbox({ image, title })}
          photosLoaded={photosLoaded}
        />
        <GiftsSection onOpen={openGift} />
        <LetterSection />
        <WishesSection wishes={wishes} onAdd={addWish} />
        <ButterflyCatchSection />
        <BirthdayGachaponSection />
        <StarlightConstellationSection />
        <BirthdayVibeSection />
      </main>

      <footer className="footer">
        <span className="footer-butterfly">🦋</span><p>Dibuat dengan sepenuh hati, khusus untuk merayakan hari spesialmu.</p><span className="footer-heart"><Heart size={14} fill="currentColor" /></span>
      </footer>

      <nav className="floating-dock" aria-label="Kontrol sound dan perayaan">
        <div className="dock-game-links" aria-label="Navigasi permainan dan kejutan">
          {EXTRA_DOCK_LINKS.map(({ href, label, icon: Icon }) => (
            <a href={href} key={href} aria-label={`Ke ${label}`} title={label}>
              <Icon size={16} /><span>{label}</span>
            </a>
          ))}
        </div>
        <select
          className="spotify-track-select"
          value={selectedTrack.id}
          onChange={(event) => selectTrack(event.currentTarget.value)}
          aria-label="Pilih lagu"
        >
          {SPOTIFY_TRACKS.map((track) => (
            <option key={track.id} value={track.id}>{track.title} — {track.artist}</option>
          ))}
        </select>
        <div className="spotify-embed" ref={spotifyHostRef} aria-label="Pemutar lagu Spotify" />
        <button className="celebration-button" onClick={fireConfetti} title="Rayakan" aria-label="Rayakan dengan confetti"><Sparkles size={19} /></button>
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
