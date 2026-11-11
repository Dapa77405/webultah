// 1. GENERATOR SPARKLES (Efek Bintang Jatuh / Berkilau Otomatis di Latar Belakang)
function createSparkles() {
    const container = document.getElementById('sparkleContainer');
    if (!container) return;
    
    // Buat 35 bintang berkilau secara acak
    for (let i = 0; i < 35; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        // Ukuran acak antara 3px - 7px
        const size = Math.random() * 4 + 3;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        
        // Posisi horizontal acak
        sparkle.style.left = Math.random() * 100 + 'vw';
        
        // Durasi jatuh acak antara 4s - 9s
        const duration = Math.random() * 5 + 4;
        sparkle.style.animationDuration = duration + 's';
        
        // Delay acak agar tidak jatuh bersamaan
        sparkle.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(sparkle);
    }
}
createSparkles();


// 2. Fungsi Navigasi Antar Layar
function goToScreen(targetId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
    }
}


// 3. Fitur Kado Terakhir (Gift) dengan Ledakan Confetti Mewah
let clicksNeeded = 5;
const finalGift = document.getElementById('finalGift');
const clickCounter = document.getElementById('clickCounter');
const finalMessage = document.getElementById('finalMessage');

finalGift.addEventListener('click', () => {
    if (clicksNeeded <= 0) return;
    
    clicksNeeded--;
    
    finalGift.style.transform = `scale(1.2) rotate(${Math.random() * 50 - 25}deg)`;
    setTimeout(() => { finalGift.style.transform = "scale(1) rotate(0deg)"; }, 150);

    if (clicksNeeded > 0) {
        clickCounter.innerText = `Klik ${clicksNeeded} kali lagi!`;
    } else {
        finalGift.style.display = 'none';
        clickCounter.style.display = 'none';
        finalMessage.classList.remove('hidden');
        
        fireBigMegaConfetti();
    }
});

function fireBigMegaConfetti() {
    var duration = 7 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 45, spread: 360, ticks: 120, zIndex: 9999 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      var particleCount = 60 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#38bdf8', '#3b82f6', '#60a5fa', '#fef08a', '#f472b6']
      }));
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#38bdf8', '#3b82f6', '#60a5fa', '#fef08a', '#f472b6']
      }));
    }, 250);
}
