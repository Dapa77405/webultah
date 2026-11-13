import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown, ArrowUpRight, Camera, Cake, Check, Gift, Heart, ImagePlus,
  Mic, MoonStar, Sparkles, Star, Wind, X,
} from "lucide-react";

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 18 } },
};

function SectionHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <motion.div className="section-heading" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      <span className="eyebrow"><Sparkles size={14} /> {eyebrow}</span>
      <h2>{title}</h2>
      <p>{note}</p>
    </motion.div>
  );
}

export type AgeParts = { years: number; days: number; hours: number; minutes: number; seconds: number };
export type Wish = { id: string; text: string; createdAt: number };

export function HeroSection({ age }: { age: AgeParts }) {
  return (
    <section className="hero-section section-shell" id="home">
      <div className="hero-copy">
        <motion.span className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><MoonStar size={15} /> 22 NOVEMBER · A DAY TO KEEP</motion.span>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
          For the one who<br /><em>makes life bloom.</em>
        </motion.h1>
        <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.28 } }}>
          Hari ini, dunia terasa sedikit lebih indah—karena hari ini adalah tentang kamu, Miel Malop.
        </motion.p>
        <motion.a className="text-link" href="#birthday" whileHover={{ x: 5 }}>Jelajahi kejutan <ArrowDown size={16} /></motion.a>
      </div>
      <motion.div className="milestone-card glass-card" initial={{ opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0, transition: { delay: 0.2, type: "spring", stiffness: 80 } }} whileHover={{ rotateX: -2, rotateY: 3, y: -5 }}>
        <div className="milestone-art"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="milestone-butterfly">🦋</span><span className="milestone-spark">✦</span></div>
        <span className="card-overline">YOUR NEXT CHAPTER</span>
        <div className="age-mark"><span>Sweet</span><strong>16</strong><span>begins</span></div>
        <p>Enam belas tahun menjadi cahaya bagi banyak hati.</p>
        <div className="age-counter" aria-label="Lama perjalanan hidup">
          {[
            ["Tahun", age.years], ["Hari", age.days], ["Jam", age.hours],
            ["Menit", age.minutes], ["Detik", age.seconds],
          ].map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
        </div>
        <span className="age-footnote">perjalanan sejak 22 November 2010</span>
      </motion.div>
      <div className="hero-note"><span>01</span> BLUE BUTTERFLY SANCTUARY <span className="note-line" /></div>
    </section>
  );
}

export function CakeSection({ candlesOn, blown, onBlow, onRelight, onMic }: {
  candlesOn: boolean; blown: boolean; onBlow: () => void; onRelight: () => void; onMic: () => void;
}) {
  return (
    <section id="birthday" className="content-section cake-section section-shell">
      <SectionHeading eyebrow="MAKE A WISH" title="Satu lilin, sejuta harapan." note="Pejamkan mata sebentar. Ada harapan yang paling ingin kamu titipkan?" />
      <motion.div className="cake-stage glass-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="cake-scene">
          <div className={`candle-row ${candlesOn ? "" : "candles-out"}`}>
            {[0, 1, 2].map((candle) => <button key={candle} className="candle" onClick={onBlow} aria-label="Tiup lilin"><span className="flame" /><span className="wick" /><span className="candle-stick" /></button>)}
          </div>
          <div className="cake-tier cake-tier-top"><span className="icing-drip" /></div>
          <div className="cake-tier cake-tier-middle"><span className="icing-drip" /></div>
          <div className="cake-tier cake-tier-bottom"><span className="icing-drip" /></div>
          <div className="cake-plate" />
          {blown && <motion.div className="wish-banner" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}>Semoga semua harapanmu terkabul! <Sparkles size={17} /></motion.div>}
        </div>
        <div className="cake-controls">
          <span className="eyebrow"><Cake size={15} /> THE LITTLE CELEBRATION</span>
          <h3>{blown ? "Permintaanmu sudah terbang." : "Saatnya meniup lilin."}</h3>
          <p>Api kecil ini menyimpan ruang untuk semua hal baik yang akan datang.</p>
          <div className="button-row">
            {!blown ? <button className="button button-primary" onClick={onBlow}><Wind size={17} /> Tiup lilin</button> : <button className="button button-primary" onClick={onRelight}><Sparkles size={17} /> Nyalakan lagi</button>}
            {!blown && <button className="button button-soft" onClick={onMic}><Mic size={16} /> Tiup lewat mic</button>}
          </div>
          <span className="small-note">Akses mikrofon hanya aktif setelah kamu mengizinkan.</span>
        </div>
      </motion.div>
    </section>
  );
}

const memoryNotes = [
  ["A little magic", "Hari-hari biasa selalu terasa istimewa saat kamu ada.", "Momen kecil, selamanya."],
  ["Your bright laugh", "Tawa kamu punya cara sendiri untuk membuat ruangan terasa hangat.", "Simpan baik-baik."],
  ["A beautiful soul", "Kebaikanmu adalah hal yang paling mudah diingat orang.", "Teruslah jadi kamu."],
  ["New adventures", "Semoga tahun ini membawa cerita yang bahkan lebih indah.", "Bab baru dimulai."],
  ["All the little things", "Hal sederhana bersamamu selalu punya tempat tersendiri.", "Untuk dikenang."],
  ["Always celebrated", "Hari ini dan setiap hari, kamu layak dirayakan.", "Dengan sepenuh hati."],
];

export function MemoriesSection({ images, onUpload, onZoom }: {
  images: (string | null)[]; onUpload: (index: number, event: ChangeEvent<HTMLInputElement>) => void; onZoom: (image: string, title: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [uploadIndex, setUploadIndex] = useState(0);

  const openUpload = (index: number) => {
    setUploadIndex(index);
    fileInput.current?.click();
  };

  return (
    <section id="memories" className="content-section memories-section section-shell">
      <SectionHeading eyebrow="LITTLE TIME CAPSULE" title="Momen yang ingin disimpan." note="Buka sisi belakang polaroid, atau isi dengan fotomu sendiri." />
      <div className="memories-tools">
        <label className="button button-soft upload-button"><ImagePlus size={16} /> Unggah foto <input ref={fileInput} type="file" accept="image/*" hidden onChange={(event) => onUpload(uploadIndex, event)} /></label>
        <span>JPG, PNG, atau HEIC · tersimpan di sesi ini</span>
      </div>
      <div className="memory-grid">
        {memoryNotes.map(([title, note, date], index) => {
          const flipped = selectedPhoto === index;
          return (
            <motion.article className={`memory-card ${flipped ? "is-flipped" : ""}`} key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06, type: "spring", stiffness: 80 }}>
              <button className="memory-flip" onClick={() => setSelectedPhoto(flipped ? null : index)} aria-label={flipped ? "Balik ke foto" : `Buka catatan ${title}`}>
                <span className="memory-inner">
                  <span className="memory-face memory-front">
                    <span className="tape" />
                    {images[index] ? <img src={images[index] ?? ""} alt={`Kenangan Miel Malop ${index + 1}`} /> : <span className={`photo-placeholder photo-${index + 1}`}><Camera size={25} /><small>our memory</small></span>}
                    <span className="memory-caption">{title}</span>
                    <span className="memory-date">22 · 11 · 26</span>
                  </span>
                  <span className="memory-face memory-back"><Heart size={20} /><strong>{note}</strong><small>{date}</small></span>
                </span>
              </button>
              <div className="memory-actions">
                <button onClick={() => openUpload(index)} aria-label="Ganti foto"><ImagePlus size={15} /></button>
                <button onClick={() => onZoom(images[index] ?? "", title)} aria-label="Perbesar foto"><ArrowUpRight size={15} /></button>
              </div>
            </motion.article>
          );
        })}
      </div>
      <p className="section-footnote"><Camera size={14} /> Setiap foto punya cerita. Tap kartu untuk membacanya.</p>
    </section>
  );
}

export type GiftInfo = { title: string; label: string; icon: typeof Gift; description: string; detail: string };
export const gifts: GiftInfo[] = [
  { title: "A little treat", label: "01 / KUPON", icon: Gift, description: "Kupon traktir spesial", detail: "Satu kali traktiran pilihanmu—minuman, dessert, atau apa pun yang bikin harimu lebih manis. Berlaku kapan saja, tanpa tanggal kedaluwarsa." },
  { title: "Three little truths", label: "02 / ALASAN", icon: Heart, description: "3 alasan kamu spesial", detail: "Kamu selalu tahu cara membuat orang merasa diterima. Kamu berani mencoba hal baru, bahkan saat gugup. Dan tawamu adalah salah satu suara favorit kami." },
  { title: "For your future self", label: "03 / KAPSUL", icon: MoonStar, description: "Kapsul waktu & doa", detail: "Semoga kamu selalu menemukan keberanian untuk tumbuh, kelembutan untuk memeluk dirimu sendiri, dan orang-orang baik yang berjalan bersamamu." },
];

export function GiftsSection({ onOpen }: { onOpen: (gift: GiftInfo) => void }) {
  return (
    <section id="gifts" className="content-section gift-section section-shell">
      <SectionHeading eyebrow="THREE LITTLE SURPRISES" title="Ada sesuatu untukmu." note="Pilih satu kotak. Masing-masing menyimpan hal kecil yang berbeda." />
      <div className="gift-grid">
        {gifts.map((gift, index) => {
          const Icon = gift.icon;
          return <motion.button className="gift-card glass-card" key={gift.title} onClick={() => onOpen(gift)} whileHover={{ y: -9, rotate: index === 1 ? 0 : index === 0 ? -1.5 : 1.5 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
            <span className="gift-number">{gift.label}</span>
            <span className="gift-illustration"><span className="gift-ribbon-v" /><span className="gift-ribbon-h" /><span className="gift-bow">✧</span></span>
            <Icon className="gift-icon" size={20} />
            <span className="gift-name">{gift.title}</span><span className="gift-description">{gift.description}</span>
            <span className="gift-open">Buka kejutan <ArrowUpRight size={15} /></span>
          </motion.button>;
        })}
      </div>
    </section>
  );
}

export function LetterSection() {
  return (
    <section id="letter" className="content-section letter-section section-shell">
      <SectionHeading eyebrow="A NOTE, JUST FOR YOU" title="Dari hati, untuk Miel Malop." note="Simpan surat ini untuk dibaca kapan pun kamu butuh pengingat kecil." />
      <motion.article className="letter-card glass-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        <span className="letter-corner corner-one">✦</span><span className="letter-corner corner-two">✦</span>
        <div className="letter-topline"><span>22 NOVEMBER 2026</span><span className="letter-stamp"><Heart size={16} /></span></div>
        <h3>Miel Malop sayang,</h3>
        <p>Selamat ulang tahun yang ke-16, Sayang. Hari ini aku cuma ingin bilang: terima kasih sudah hadir di dunia dan membawa begitu banyak warna ke hidup orang-orang di sekitarmu.</p>
        <p>Kamu punya cara yang istimewa untuk membuat hal sederhana terasa berarti. Semoga di usia yang baru ini, kamu selalu dikelilingi hal-hal yang membuatmu merasa aman, dicintai, dan bebas menjadi dirimu sendiri.</p>
        <p>Semoga setiap mimpi yang kamu simpan pelan-pelan menemukan jalannya. Kalau ada hari yang terasa berat, ingat bahwa kamu tidak harus melewatinya sendirian. Aku akan selalu mendukungmu—hari ini, besok, dan seterusnya.</p>
        <p className="letter-signoff">I love you, kini dan nanti.<br /><strong>- Dapa Caesar</strong></p>
        <span className="letter-bottom-icon">🦋</span>
      </motion.article>
    </section>
  );
}

export function WishesSection({ wishes, onAdd }: { wishes: Wish[]; onAdd: (text: string) => string }) {
  const [text, setText] = useState("");
  const [flyingId, setFlyingId] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const wish = text.trim();
    if (!wish) return;
    const id = onAdd(wish);
    setText("");
    setFlyingId(id);
    window.setTimeout(() => setFlyingId(null), 1500);
  };

  return (
    <section id="wishes" className="content-section wishes-section section-shell">
      <SectionHeading eyebrow="A SKY FULL OF POSSIBILITY" title="Apa harapanmu tahun ini?" note="Tulis satu harapan, lalu lepaskan ke langit. Harapanmu akan tetap tersimpan di sini." />
      <motion.form className="wish-form glass-card" onSubmit={submit} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <label htmlFor="wish-input">Satu hal yang ingin kamu wujudkan...</label>
        <div className="wish-input-row"><input id="wish-input" value={text} onChange={(event) => setText(event.target.value)} maxLength={140} placeholder="Tulis harapanmu di sini..." /><button className="button button-primary" type="submit" disabled={!text.trim()}><ArrowUpRight size={16} /> Terbangkan</button></div>
        <span className="wish-count">{text.length}/140</span>
      </motion.form>
      <div className="wish-sky" aria-live="polite">
        {wishes.length === 0 ? <p className="sky-empty"><Star size={16} /> Langit ini menunggu harapan pertamamu.</p> : wishes.map((wish, index) =>
          <motion.button className={`wish-star ${flyingId === wish.id ? "wish-flying" : ""}`} key={wish.id} title={wish.text} aria-label={`Harapan tersimpan: ${wish.text}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ left: `${12 + ((index * 19) % 76)}%`, top: `${12 + ((index * 23) % 62)}%` }}>
            <Star size={21} fill="currentColor" /><span>{wish.text}</span>
          </motion.button>)}
      </div>
      <span className="wish-saved"><Check size={14} /> tersimpan otomatis di perangkat ini</span>
    </section>
  );
}

export function GiftModal({ gift, onClose }: { gift: GiftInfo | null; onClose: () => void }) {
  const [claimed, setClaimed] = useState(false);
  if (!gift) return null;
  const Icon = gift.icon;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <motion.div className="modal-card glass-card" role="dialog" aria-modal="true" aria-labelledby="gift-modal-title" onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        <span className="modal-icon"><Icon size={28} /></span><span className="eyebrow">{gift.label} · DIBUAT UNTUKMU</span>
        <h3 id="gift-modal-title">{gift.description}</h3><p>{gift.detail}</p>
        <button className="button button-primary" onClick={() => setClaimed(true)}>{claimed ? <><Check size={17} /> Sudah jadi milikmu</> : <><Heart size={16} /> {gift.title === "A little treat" ? "Klaim kupon" : "Simpan untukku"}</>}</button>
      </motion.div>
    </div>
  );
}

export function Lightbox({ image, title, onClose }: { image: string | null; title: string; onClose: () => void }) {
  if (image === null) return null;
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><motion.div className="lightbox glass-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
    <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={18} /></button>
    {image ? <img src={image} alt={title} /> : <div className="lightbox-placeholder"><Camera size={44} /><span>Unggah fotomu untuk mengisi kenangan ini</span></div>}
    <p>{title}</p>
  </motion.div></div>;
}

export function MicrophoneHelp({ state, onClose }: { state: string | null; onClose: () => void }) {
  if (!state) return null;
  return <div className="mic-toast" role="status"><span>{state}</span><button onClick={onClose} aria-label="Tutup pesan"><X size={14} /></button></div>;
}

