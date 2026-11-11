// 1. Audio and Welcome Screen Logic
const welcomeScreen = document.getElementById('welcome-screen');
const mainContent = document.getElementById('main-content');
const openBtn = document.getElementById('openBtn');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;

openBtn.addEventListener('click', () => {
    // Hide welcome screen
    welcomeScreen.classList.add('slide-up');
    
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        
        // Play Music
        bgMusic.play().then(() => {
            isPlaying = true;
            musicToggle.innerText = '🎵 Pause';
        }).catch(err => console.log("Audio play failed:", err));

    }, 800); // Wait for transition
});

musicToggle.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicToggle.innerText = '🎵 Play';
    } else {
        bgMusic.play();
        musicToggle.innerText = '🎵 Pause';
    }
    isPlaying = !isPlaying;
});


// 2. Scroll Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-scroll');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.hidden-scroll').forEach((el) => observer.observe(el));


// 3. Modals Logic (Surat Rahasia)
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}


// 4. Ultimate Surprise Gift Box Logic
let clicksNeeded = 5;
const finalGift = document.getElementById('finalGift');
const clickCounter = document.getElementById('clickCounter');
const finalMessage = document.getElementById('finalMessage');

finalGift.addEventListener('click', () => {
    clicksNeeded--;
    
    // Animasi goyang
    finalGift.style.transform = `scale(1.1) rotate(${Math.random() * 20 - 10}deg)`;
    setTimeout(() => { finalGift.style.transform = "scale(1) rotate(0deg)"; }, 150);

    if (clicksNeeded > 0) {
        clickCounter.innerText = `Klik ${clicksNeeded} kali lagi!`;
    } else if (clicksNeeded === 0) {
        // Terbuka!
        finalGift.style.display = 'none';
        clickCounter.style.display = 'none';
        finalMessage.style.display = 'block';
        
        // Fire BIG Confetti
        fireBigConfetti();
    }
});

function fireBigConfetti() {
    var duration = 8 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      var particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa', '#d81b60']
      }));
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa', '#d81b60']
      }));
    }, 250);
}
