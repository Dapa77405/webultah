import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeftRight, ArrowRight, Check, Gift, Heart, RotateCcw, Sparkles, Star, Trophy, Wind,
} from "lucide-react";

const reveal: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 18 } } };

function ExtraHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <motion.div className="section-heading" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
      <span className="eyebrow"><Sparkles size={14} /> {eyebrow}</span>
      <h2>{title}</h2>
      <p>{note}</p>
    </motion.div>
  );
}

const BEST_SCORE_KEY = "miel-butterfly-catch-best";
const GAME_DURATION = 30;
type Target = { id: number; kind: "blue" | "gold" | "mist"; left: number; top: number; delay: number };
type PointEffect = { id: number; text: string; left: number; top: number; good: boolean };

function readBestScore() {
  try {
    const saved = Number(localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch (error) {
    console.error("Could not load the Butterfly Catch record.", error);
    return 0;
  }
}

export function ButterflyCatchSection() {
  const [best, setBest] = useState(readBestScore);
  const [score, setScore] = useState(0);
  const [remaining, setRemaining] = useState(GAME_DURATION);
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [effects, setEffects] = useState<PointEffect[]>([]);
  const [recordWarning, setRecordWarning] = useState(false);
  const deadlineRef = useRef(0);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (!active) return undefined;
    const spawnTimer = window.setInterval(() => {
      if (Date.now() >= deadlineRef.current) return;
      const kind = Math.random() < 0.13 ? "mist" : Math.random() < 0.11 ? "gold" : "blue";
      const target: Target = {
        id: nextIdRef.current++,
        kind,
        left: 7 + Math.random() * 82,
        top: 10 + Math.random() * 72,
        delay: Math.random() * 0.8,
      };
      setTargets((current) => [...current.filter((item) => item.id > target.id - 8), target]);
    }, 750);
    const clockTimer = window.setInterval(() => {
      const nextRemaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(nextRemaining);
      if (nextRemaining === 0) {
        setActive(false);
        setFinished(true);
        setTargets([]);
      }
    }, 150);
    return () => {
      window.clearInterval(spawnTimer);
      window.clearInterval(clockTimer);
    };
  }, [active]);

  useEffect(() => {
    if (effects.length === 0) return undefined;
    const timer = window.setTimeout(() => setEffects([]), 900);
    return () => window.clearTimeout(timer);
  }, [effects]);

  const startGame = () => {
    setScore(0);
    setRemaining(GAME_DURATION);
    setTargets([]);
    setEffects([]);
    setFinished(false);
    deadlineRef.current = Date.now() + GAME_DURATION * 1000;
    setActive(true);
  };

  const catchTarget = (target: Target) => {
    if (!active) return;
    const points = target.kind === "gold" ? 25 : target.kind === "mist" ? -5 : 10;
    setTargets((current) => current.filter((item) => item.id !== target.id));
    const nextScore = Math.max(0, score + points);
    setScore(nextScore);
    if (nextScore > best) {
      setBest(nextScore);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(nextScore));
      } catch (error) {
        console.error("Could not save the Butterfly Catch record.", error);
        setRecordWarning(true);
      }
    }
    setEffects((current) => [...current, {
      id: target.id,
      text: points > 0 ? `+${points}` : String(points),
      left: target.left,
      top: target.top,
      good: points > 0,
    }]);
  };

  const achieved = score >= 120 || best >= 120;
  return (
    <section id="butterfly-catch" className="content-section extra-section section-shell">
      <ExtraHeading eyebrow="ARCADE REFLEX GAME" title="Butterfly Catch" note="Tangkap kupu-kupu biru dan emas sebelum waktunya habis. Hati-hati, awan kabut mengurangi poin." />
      <motion.div className="catch-card glass-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="catch-toolbar">
          <div className="catch-stat"><span>SKOR</span><strong>{score}</strong></div>
          <div className="catch-stat"><span>WAKTU</span><strong className={remaining <= 5 && active ? "time-warning" : ""}>{remaining}<small> dtk</small></strong></div>
          <div className="catch-stat"><span>REKOR</span><strong>{best}</strong></div>
        </div>
        <div className="catch-arena" aria-label="Area permainan Butterfly Catch">
          {!active && !finished && <div className="catch-intro"><span className="catch-butterfly-art">🦋</span><p>Siap menangkap beberapa kupu-kupu?</p><button className="button button-primary" onClick={startGame}><Wind size={16} /> Mulai 30 detik</button></div>}
          {active && <span className="catch-hint">Ketuk kupu-kupu yang lewat</span>}
          {targets.map((target) => (
            <motion.button
              key={target.id}
              className={`catch-target catch-${target.kind}`}
              style={{ left: `${target.left}%`, top: `${target.top}%`, animationDelay: `${target.delay}s` }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.8, 1.12, 0.92], opacity: [0, 1, 1, 0], x: ["-9px", "12px", "-14px"], y: ["5px", "-14px", "9px"] }}
              transition={{ duration: target.kind === "gold" ? 2.1 : 3.2, ease: "easeInOut", repeat: Infinity }}
              onClick={() => catchTarget(target)}
              aria-label={target.kind === "mist" ? "Awan kabut, kurangi 5 poin" : `Kupu-kupu ${target.kind === "gold" ? "emas, tambah 25" : "biru, tambah 10"} poin`}
              disabled={!active}
            >
              {target.kind === "mist" ? <span className="mist-cloud">☁</span> : <span aria-hidden="true">{target.kind === "gold" ? "🦋" : "🦋"}</span>}
            </motion.button>
          ))}
          <AnimatePresence>
            {effects.map((effect) => <motion.span key={effect.id} className={`catch-points ${effect.good ? "points-good" : "points-bad"}`} style={{ left: `${effect.left}%`, top: `${effect.top}%` }} initial={{ opacity: 0, y: 8, scale: 0.7 }} animate={{ opacity: 1, y: -35, scale: 1.15 }} exit={{ opacity: 0 }}><Sparkles size={13} />{effect.text}</motion.span>)}
          </AnimatePresence>
          {finished && <div className="catch-result"><strong>Waktu habis!</strong><span>Skor akhir: {score}</span><button className="button button-soft" onClick={startGame}><RotateCcw size={15} /> Main lagi</button></div>}
        </div>
        <div className="catch-footer">
          <span><i className="legend-blue" /> +10 biru</span><span><i className="legend-gold" /> +25 emas</span><span><i className="legend-mist" /> -5 kabut</span>
          {achieved && <motion.div className="achievement-badge" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}><Trophy size={18} /><span><strong>Master of the Sanctuary</strong><small>Refleksmu secepat sayap kupu-kupu. Kayaknya kupu-kupunya yang perlu latihan.</small></span></motion.div>}
          {recordWarning && <span className="storage-warning">Rekor tersimpan sementara, tetapi browser tidak mengizinkan penyimpanan lokal.</span>}
        </div>
      </motion.div>
    </section>
  );
}

const VOUCHERS = [
  { title: "Matcha / kopi favorit", detail: "Satu minuman pilihanmu, bebas request.", tier: "blue" },
  { title: "Pilih tempat jalan", detail: "Kamu yang tentukan tujuan berikutnya.", tier: "silver" },
  { title: "Skip debat 1x", detail: "Satu kali auto-menang. Syarat: topiknya receh.", tier: "blue" },
  { title: "Foto bareng wajib", detail: "Satu sesi foto bareng, no mager.", tier: "silver" },
  { title: "Request lagu / nonton", detail: "Pilih lagu atau film buat dinikmati bareng.", tier: "blue" },
  { title: "Permintaan masuk akal", detail: "Satu permintaan bebas yang masih masuk akal.", tier: "gold" },
] as const;
type Voucher = { id: string; title: string; detail: string; tier: string; openedAt: number };
const COLLECTION_KEY = "miel-gachapon-collection";

function loadCollection(): Voucher[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? "[]");
    if (!Array.isArray(stored)) throw new Error("Gachapon collection should be a list.");
    return stored.filter((item): item is Voucher =>
      typeof item?.id === "string" && typeof item?.title === "string" && typeof item?.detail === "string"
      && typeof item?.tier === "string" && typeof item?.openedAt === "number");
  } catch (error) {
    console.error("Could not load the Gachapon collection.", error);
    return [];
  }
}

export function BirthdayGachaponSection() {
  const [collection, setCollection] = useState<Voucher[]>(loadCollection);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<Voucher | null>(null);
  const [collectionWarning, setCollectionWarning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setRevealed(null);
    const chosen = Math.random() < 0.08 ? VOUCHERS[VOUCHERS.length - 1] : VOUCHERS[Math.floor(Math.random() * (VOUCHERS.length - 1))];
    timerRef.current = window.setTimeout(() => {
      const voucher: Voucher = { ...chosen, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, openedAt: Date.now() };
      setRevealed(voucher);
      const updated = [voucher, ...collection];
      setCollection(updated);
      try {
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Could not save the Gachapon collection.", error);
        setCollectionWarning(true);
      }
      setSpinning(false);
      if (voucher.tier === "gold") confetti({ particleCount: 45, spread: 54, origin: { x: 0.5, y: 0.56 }, colors: ["#f5cb72", "#dceeff", "#ffffff"], zIndex: 160 });
    }, 1100);
  };

  return (
    <section id="birthday-gachapon" className="content-section extra-section section-shell">
      <ExtraHeading eyebrow="BIRTHDAY GACHAPON" title="Putar, siapa tahu dapat." note="Satu putaran, satu kejutan kecil. Kapsul yang sudah terbuka masuk ke koleksimu." />
      <motion.div className={`gachapon-card glass-card ${spinning ? "gachapon-spinning" : ""}`} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="gachapon-machine">
          <span className="gacha-machine-top"><Sparkles size={15} /> SURPRISE CAPSULES</span>
          <div className="gacha-globe">
            <div className="gacha-capsules" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => <span className={`gacha-ball ball-${index % 3}`} key={index} style={{ "--ball-index": index } as CSSProperties} />)}
            </div>
            <span className="gacha-globe-shine" />
          </div>
          <div className="gacha-machine-base">
            <span className="gacha-output">{spinning ? <motion.span animate={{ y: [0, 5, 0] }}>◉</motion.span> : revealed ? <span className={`gacha-prize gacha-${revealed.tier}`}>◉</span> : "◌"}</span>
            <button className="gacha-lever" onClick={spin} disabled={spinning} aria-label="Putar Gachapon"><span className={spinning ? "lever-turning" : ""} /></button>
          </div>
        </div>
        <div className="gacha-copy">
          <span className="eyebrow"><Gift size={15} /> CAPSULE DROP</span>
          <h3>{spinning ? "Mesinnya lagi mengacak..." : revealed ? "Kapsulmu terbuka!" : "Ada kejutan di dalam."}</h3>
          <p>{spinning ? "Sebentar, kapsul pilihanmu sedang turun." : revealed ? "Satu kejutan baru masuk ke koleksi." : "Putar tuas untuk mendapatkan voucher atau kartu kejutan."}</p>
          <button className="button button-primary" onClick={spin} disabled={spinning}><Sparkles size={16} /> {spinning ? "Tunggu sebentar..." : "Putar Gachapon"}</button>
          <AnimatePresence mode="wait">
            {revealed && <motion.article className={`gacha-reveal gacha-reveal-${revealed.tier}`} key={revealed.id} initial={{ opacity: 0, y: 12, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}>
              <span>{revealed.tier === "gold" ? "✦ GOLDEN RARE CARD" : "BIRTHDAY VOUCHER"}</span><strong>{revealed.title}</strong><p>{revealed.detail}</p>
            </motion.article>}
          </AnimatePresence>
        </div>
        <div className="gacha-collection">
          <div className="gacha-collection-heading"><span><Gift size={15} /> Koleksi kapsul didapat</span><small>{collection.length} kartu</small></div>
          {collectionWarning && <p className="storage-warning">Kartu ini tersimpan untuk sesi ini, tetapi browser tidak mengizinkan penyimpanan lokal.</p>}
          {collection.length === 0 ? <p className="collection-empty">Koleksimu masih kosong. Coba satu putaran.</p> : <div className="gacha-collection-grid">
            {collection.map((voucher) => <article className={`collection-card collection-${voucher.tier}`} key={voucher.id}><span>{voucher.tier === "gold" ? "✦ RARE" : "KARTU"}</span><strong>{voucher.title}</strong><small>{voucher.detail}</small></article>)}
          </div>}
        </div>
      </motion.div>
    </section>
  );
}

const CONSTELLATION_POINTS = [
  { x: 12, y: 75 }, { x: 22, y: 35 }, { x: 37, y: 62 },
  { x: 50, y: 18 }, { x: 63, y: 62 }, { x: 78, y: 35 },
  { x: 88, y: 75 }, { x: 68, y: 77 }, { x: 32, y: 77 },
];

export function StarlightConstellationSection() {
  const [connected, setConnected] = useState(0);
  const [dragging, setDragging] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const complete = connected === CONSTELLATION_POINTS.length;

  const connectStar = (index: number) => {
    setConnected((current) => {
      if (index === current) return current + 1;
      if (index === 0 && current > 0) return 1;
      return current;
    });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || !boardRef.current) return;
    const bounds = boardRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    const nextPoint = CONSTELLATION_POINTS[connected];
    if (!nextPoint) return;
    if (Math.hypot(nextPoint.x - x, nextPoint.y - y) < 8) connectStar(connected);
  };

  const handleStarPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    setDragging(true);
    if (boardRef.current) boardRef.current.setPointerCapture(event.pointerId);
    connectStar(index);
  };

  return (
    <section id="starlight-constellation" className="content-section extra-section section-shell">
      <ExtraHeading eyebrow="A LITTLE SKY PUZZLE" title="Starlight Constellation" note="Hubungkan bintang dari 1 sampai 9. Bisa ketuk satu per satu atau tarik garisnya langsung." />
      <motion.div className={`constellation-card ${complete ? "constellation-complete" : ""}`} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="constellation-meta"><span><Star size={15} /> THE HIDDEN CROWN</span><span>{Math.min(connected, CONSTELLATION_POINTS.length)} / {CONSTELLATION_POINTS.length} bintang</span></div>
        <div
          className="constellation-board"
          ref={boardRef}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onLostPointerCapture={() => setDragging(false)}
          style={{ touchAction: "none" }}
          aria-label="Teka-teki rasi bintang, hubungkan bintang sesuai urutan"
        >
          <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {Array.from({ length: Math.max(0, connected - 1) }, (_, index) => <line key={index} x1={CONSTELLATION_POINTS[index].x} y1={CONSTELLATION_POINTS[index].y} x2={CONSTELLATION_POINTS[index + 1].x} y2={CONSTELLATION_POINTS[index + 1].y} />)}
          </svg>
          {CONSTELLATION_POINTS.map((point, index) => (
            <button
              type="button"
              key={index}
              className={`constellation-star ${index < connected ? "star-connected" : ""}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onPointerDown={(event) => handleStarPointerDown(event, index)}
              onPointerUp={() => setDragging(false)}
              onClick={() => connectStar(index)}
              aria-label={`Bintang ${index + 1}${index < connected ? ", sudah terhubung" : ""}`}
            ><Star size={index === 3 ? 22 : 18} fill="currentColor" /><span>{index + 1}</span></button>
          ))}
          {Array.from({ length: 12 }, (_, index) => <i className="falling-star" key={index} style={{ "--fall-index": index } as CSSProperties} />)}
        </div>
        <div className="constellation-bottom">
          {!complete ? <p>Mulai dari bintang <strong>{Math.min(connected + 1, CONSTELLATION_POINTS.length)}</strong>, lalu ikuti urutannya.</p> : <motion.article className="starlight-note" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span><Sparkles size={16} /> HIDDEN STARLIGHT NOTE</span><p>Semoga tahun barumu penuh hal yang bikin penasaran, orang yang bikin nyaman, dan alasan kecil buat bilang, “hari ini ternyata oke juga.”</p></motion.article>}
          <button className="constellation-reset" onClick={() => setConnected(0)} aria-label="Ulangi teka-teki"><RotateCcw size={15} /> Ulangi</button>
        </div>
      </motion.div>
    </section>
  );
}

const VIBE_QUESTIONS = [
  { prompt: "Minuman penambah mood?", options: ["Matcha", "Kopi"], reactions: ["Pilihan adem, masuk.", "Oke, mode fokus aktif."] },
  { prompt: "Kalau diajak jalan?", options: ["Dadakan aja", "Rencana matang"], reactions: ["Spontan, tapi tetap bawa charger.", "Itinerary rapi itu menenangkan."] },
  { prompt: "Malam yang ideal?", options: ["Begadang nonton / scroll", "Tidur lebih cepat"], reactions: ["Satu episode lagi, katanya.", "Pilihan yang besok akan disyukuri."] },
  { prompt: "Foto yang disimpan?", options: ["Estetik", "Foto aib buat koleksi"], reactions: ["Cahaya bagus memang penting.", "Yang begini biasanya paling lucu."] },
  { prompt: "Camilan pilihan?", options: ["Sweet treats", "Savory / pedas"], reactions: ["Ada ruang buat dessert.", "Sedikit pedas, banyak cerita."] },
  { prompt: "Playlist tengah malam?", options: ["Lagu galau", "Lagu upbeat"], reactions: ["Biar dramatisnya pas.", "Energi masih ada, ternyata."] },
  { prompt: "Hari libur paling pas?", options: ["Keliling cari tempat baru", "Santai di tempat favorit"], reactions: ["Tempat baru, cerita baru.", "Nyaman itu juga rencana bagus."] },
] as const;

export function BirthdayVibeSection() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [reaction, setReaction] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const pointerStartRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const questionIndex = answers.length;
  const finished = questionIndex >= VIBE_QUESTIONS.length;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const choose = (choice: number) => {
    if (transitioning || finished) return;
    const question = VIBE_QUESTIONS[questionIndex];
    setSelectedChoice(choice);
    setReaction(question.reactions[choice]);
    setTransitioning(true);
    timerRef.current = window.setTimeout(() => {
      setAnswers((current) => [...current, choice]);
      setTransitioning(false);
      setReaction("");
      setSelectedChoice(null);
    }, 680);
  };

  const restart = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setAnswers([]);
    setReaction("");
    setTransitioning(false);
    setSelectedChoice(null);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    pointerStartRef.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerStartRef.current === null) return;
    const distance = event.clientX - pointerStartRef.current;
    pointerStartRef.current = null;
    if (Math.abs(distance) < 65 || (event.target as HTMLElement).closest("button")) return;
    choose(distance < 0 ? 0 : 1);
  };

  const leftCount = answers.filter((answer) => answer === 0).length;
  const vibeTitle = leftCount >= 5 ? "Spontan tapi tetap tahu maunya." : leftCount <= 2 ? "Tim nyaman, keputusan matang." : "Seimbang, lihat situasi.";
  return (
    <section id="birthday-vibe" className="content-section extra-section vibe-section section-shell">
      <ExtraHeading eyebrow="THIS OR THAT" title="Birthday Vibe Check" note="Pilih yang paling kamu banget. Nggak ada jawaban salah—ini bukan ujian." />
      <motion.div className="vibe-card glass-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {!finished ? <>
          <div className="vibe-progress"><span>PERTANYAAN {questionIndex + 1} / {VIBE_QUESTIONS.length}</span><div>{VIBE_QUESTIONS.map((question, index) => <i key={question.prompt} className={index < answers.length ? "vibe-step-done" : ""} />)}</div></div>
          <AnimatePresence mode="wait">
            <motion.div
              className="vibe-question"
              key={questionIndex}
              initial={{ opacity: 0, x: 18, rotate: 1 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -18, rotate: -1 }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              style={{ touchAction: "pan-y" }}
            >
              <span><Heart size={16} /> PILIHAN HARI INI</span>
              <h3>{VIBE_QUESTIONS[questionIndex].prompt}</h3>
              <div className="vibe-options">
                {VIBE_QUESTIONS[questionIndex].options.map((option, index) => <button className={`vibe-option ${selectedChoice === index ? "vibe-option-selected" : ""}`} key={option} onClick={() => choose(index)} disabled={transitioning}><span>{option}</span><ArrowRight size={16} /></button>)}
              </div>
              <AnimatePresence>{reaction && <motion.p className="vibe-reaction" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{reaction}</motion.p>}</AnimatePresence>
              <small className="vibe-swipe-hint"><ArrowLeftRight size={14} /> Bisa juga geser kartu ke kiri / kanan</small>
            </motion.div>
          </AnimatePresence>
        </> : <motion.div className="vibe-summary" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="eyebrow"><Check size={15} /> BIRTHDAY VIBE SUMMARY</span>
          <div className="vibe-summary-icon"><Sparkles size={26} /></div>
          <h3>{vibeTitle}</h3>
          <p>Kamu memilih {leftCount} opsi pertama dan {answers.length - leftCount} opsi kedua. Formula pas untuk hari yang isinya hal-hal favoritmu.</p>
          <div className="vibe-tags">{answers.map((answer, index) => <span key={index}>{VIBE_QUESTIONS[index].options[answer]}</span>)}</div>
          <button className="button button-soft" onClick={restart}><RotateCcw size={15} /> Main ulang</button>
        </motion.div>}
      </motion.div>
    </section>
  );
}

export const EXTRA_DOCK_LINKS = [
  { href: "#butterfly-catch", label: "Butterfly Catch", icon: Wind },
  { href: "#birthday-gachapon", label: "Gachapon", icon: Gift },
  { href: "#starlight-constellation", label: "Rasi bintang", icon: Star },
  { href: "#birthday-vibe", label: "Vibe check", icon: ArrowLeftRight },
] as const;

