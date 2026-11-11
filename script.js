// Fungsi Navigasi Antar Layar
function goToScreen(targetId) {
    // Sembunyikan semua screen
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Tampilkan screen yang dituju
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
    }
}

// Fitur Kado Terakhir (Gift)
let clicksNeeded = 5;
const finalGift = document.getElementById('finalGift');
const clickCounter = document.getElementById('clickCounter');
const finalMessage = document.getElementById('finalMessage');

finalGift.addEventListener('click', () => {
    if (clicksNeeded <= 0) return; // Udah kebuka
    
    clicksNeeded--;
    
    // Animasi goyang kencang
    finalGift.style.transform = `scale(1.15) rotate(${Math.random() * 40 - 20}deg)`;
    setTimeout(() => { finalGift.style.transform = "scale(1) rotate(0deg)"; }, 150);

    if (clicksNeeded > 0) {
        clickCounter.innerText = `Klik ${clicksNeeded} kali lagi!`;
    } else {
        // Kado Kebuka!
        finalGift.style.display = 'none';
        clickCounter.style.display = 'none';
        
        // Munculkan pesan (ganti class dari hidden ke aktif)
        finalMessage.classList.remove('hidden');
        
        // Luncurkan Confetti
        fireConfetti();
    }
});

function fireConfetti() {
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 40, spread: 360, ticks: 100, zIndex: 9999 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      var particleCount = 50 * (timeLeft / duration);
      
      // Warna dominan biru neon, biru tua, dan putih
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa', '#38bdf8']
      }));
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa', '#38bdf8']
      }));
    }, 250);
}
