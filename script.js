// Intersection Observer untuk animasi muncul saat di-scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-scroll');
        }
    });
}, {
    threshold: 0.1 // Animasi mulai saat elemen terlihat 10% di layar
});

// Pilih semua elemen dengan class hidden-scroll
const hiddenElements = document.querySelectorAll('.hidden-scroll');
hiddenElements.forEach((el) => observer.observe(el));


// Fungsi Confetti untuk tombol kejutan
document.getElementById('confettiBtn').addEventListener('click', function() {
    
    // Ubah teks tombol setelah diklik
    this.innerText = "Happy Birthday Miel! 💙🎉";
    this.style.backgroundColor = "#1e3a8a";
    this.style.color = "white";

    // Kembang api kertas (Confetti)
    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa'] // Warna dominan biru putih
      }));
      
      confetti(Object.assign({}, defaults, { 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ffffff', '#1e3a8a', '#3b82f6', '#60a5fa']
      }));
    }, 250);
});
