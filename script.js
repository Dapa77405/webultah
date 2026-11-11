document.getElementById('giftBox').addEventListener('click', function() {
    // Sembunyikan halaman awal
    document.getElementById('intro').classList.add('hidden');
    
    // Tampilkan pesan
    const msg = document.getElementById('message');
    msg.classList.remove('hidden');
    
    // Mulai efek Confetti (Kertas warna-warni)
    var duration = 5 * 1000; // 5 detik
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
      // Confetti dari kiri
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      // Confetti dari kanan
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
});
