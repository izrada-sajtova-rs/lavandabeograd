// Preloader
window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }, 1000);
  preloader.style.transition = 'opacity 0.5s ease';
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');

if (mobileMenuBtn && mainNav) {
  mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
  });
}

// Smooth scroll za navigacione linkove
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Oduzimamo visinu headera
        behavior: 'smooth'
      });
      
      // Zatvaramo mobilni meni ako je otvoren
      if (window.innerWidth < 768 && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
      }
    }
  });
});

// Animacija na scroll
const animateElements = document.querySelectorAll('.animate-on-scroll');

const checkIfInView = () => {
  const windowHeight = window.innerHeight;
  const windowTopPosition = window.pageYOffset;
  const windowBottomPosition = windowTopPosition + windowHeight;

  animateElements.forEach(element => {
    const elementHeight = element.offsetHeight;
    const elementTopPosition = element.getBoundingClientRect().top + windowTopPosition;
    const elementBottomPosition = elementTopPosition + elementHeight;
    
    // Dodaj delay ako je specificiran
    const delay = element.getAttribute('data-delay') || 0;
    
    // Proveri da li je element vidljiv
    if (
      (elementBottomPosition >= windowTopPosition) &&
      (elementTopPosition <= windowBottomPosition)
    ) {
      setTimeout(() => {
        element.classList.add('animate');
      }, delay);
    }
  });
};

// Inicijalno proveri elemente
window.addEventListener('load', checkIfInView);
window.addEventListener('scroll', checkIfInView);
window.addEventListener('resize', checkIfInView);

// Brojači
const counters = document.querySelectorAll('.counter-number');

const animateCounters = () => {
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const duration = 2000; // Trajanje animacije u milisekundama
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime < duration) {
        const progress = elapsedTime / duration;
        const currentValue = Math.floor(startValue + progress * (target - startValue));
        counter.textContent = currentValue;
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    }
    
    requestAnimationFrame(updateCounter);
  });
};

// Pokretanje animacije brojača kada su vidljivi
const startCountersOnScroll = () => {
  const countersSection = document.querySelector('.counters-section');
  if (countersSection) {
    const sectionPosition = countersSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if (sectionPosition < screenPosition) {
      animateCounters();
      window.removeEventListener('scroll', startCountersOnScroll);
    }
  }
};

window.addEventListener('scroll', startCountersOnScroll);
window.addEventListener('load', startCountersOnScroll);

// Lightbox galerija
const galleryImages = [
  '../slike/lavanda-9.jpg',
  '../slike/lavanda-7.jpg',
  '../slike/lavanda-4.jpg',
  '../slike/lavanda-5.jpg',
  '../slike/lavanda-2.jpg',
  '../slike/lavanda-10.jpg',
  '../slike/lavanda-3.jpg',
  '../slike/majcina-dusica-2.jpg',
  '../slike/nana-1.jpg',
  '../slike/macina-dusica-1.jpg',
  '../slike/ruzmarin-1.jpg',
  '../slike/sumske-jagode-1.jpg'
];

let currentImageIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(index) {
  currentImageIndex = index;
  lightboxImg.src = galleryImages[currentImageIndex];
  lightbox.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Sprečava scroll
}

function closeLightbox() {
  lightbox.style.display = 'none';
  document.body.style.overflow = 'auto'; // Vraća scroll
}

function changeLightboxImage(direction) {
  currentImageIndex += direction;
  
  // Kružno kretanje kroz slike
  if (currentImageIndex < 0) {
    currentImageIndex = galleryImages.length - 1;
  } else if (currentImageIndex >= galleryImages.length) {
    currentImageIndex = 0;
  }
  
  lightboxImg.src = galleryImages[currentImageIndex];
}

// Dodavanje keyboard navigacije za lightbox
document.addEventListener('keydown', function(e) {
  if (lightbox.style.display === 'block') {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      changeLightboxImage(-1);
    } else if (e.key === 'ArrowRight') {
      changeLightboxImage(1);
    }
  }
});

// Testimonial slider
const testimonialSlides = document.querySelectorAll('.testimonial-slide');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
let currentTestimonialIndex = 0;

function showTestimonial(index) {
  // Sakrivanje svih slajdova
  testimonialSlides.forEach(slide => {
    slide.classList.remove('active');
  });
  
  // Uklanjanje active klase sa svih tačkica
  testimonialDots.forEach(dot => {
    dot.classList.remove('active');
  });
  
  // Prikazivanje trenutnog slajda
  testimonialSlides[index].classList.add('active');
  testimonialDots[index].classList.add('active');
}

function moveTestimonial(direction) {
  currentTestimonialIndex += direction;
  
  // Kružno kretanje kroz testimoniale
  if (currentTestimonialIndex < 0) {
    currentTestimonialIndex = testimonialSlides.length - 1;
  } else if (currentTestimonialIndex >= testimonialSlides.length) {
    currentTestimonialIndex = 0;
  }
  
  showTestimonial(currentTestimonialIndex);
}

function currentTestimonial(index) {
  currentTestimonialIndex = index;
  showTestimonial(currentTestimonialIndex);
}

// Inicijalno prikazivanje prvog testimoniala
showTestimonial(0);

// Auto-rotacija testimoniala
setInterval(() => {
  moveTestimonial(1);
}, 5000);

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    // Toggle active klase na kliknutom pitanju
    item.classList.toggle('active');
    
    // Opciono: zatvaranje ostalih otvorenih pitanja
    faqItems.forEach(otherItem => {
      if (otherItem !== item && otherItem.classList.contains('active')) {
        otherItem.classList.remove('active');
      }
    });
  });
});

// Music Player
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressFill = document.querySelector('.progress-fill');
const currentTimeDisplay = document.querySelector('.current-time');
const durationDisplay = document.querySelector('.duration');
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
audioPlayer.loop = true;
// Play/Pause funkcionalnost
playPauseBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    audioPlayer.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
});

// Ažuriranje progress bara
audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressFill.style.width = `${progress}%`;
  
  // Ažuriranje vremena
  const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
  const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
  currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
});

// Postavljanje trajanja kada se učita audio
audioPlayer.addEventListener('loadedmetadata', () => {
  const durationMinutes = Math.floor(audioPlayer.duration / 60);
  const durationSeconds = Math.floor(audioPlayer.duration % 60);
  durationDisplay.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
});

// Klik na progress bar
document.querySelector('.progress-bar').addEventListener('click', (e) => {
  const progressBar = e.currentTarget;
  const clickPosition = e.offsetX;
  const progressBarWidth = progressBar.clientWidth;
  const seekTime = (clickPosition / progressBarWidth) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

// Kontrola jačine zvuka
volumeSlider.addEventListener('input', () => {
  audioPlayer.volume = volumeSlider.value;
  if (audioPlayer.volume === 0) {
    muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  } else {
    muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
  }
});

// Mute/Unmute funkcionalnost
muteBtn.addEventListener('click', () => {
  if (audioPlayer.volume > 0) {
    audioPlayer.dataset.prevVolume = audioPlayer.volume;
    audioPlayer.volume = 0;
    volumeSlider.value = 0;
    muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  } else {
    const prevVolume = audioPlayer.dataset.prevVolume || 0.7;
    audioPlayer.volume = prevVolume;
    volumeSlider.value = prevVolume;
    muteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
  }
});


// Praćenje klikova na .trackcall dugmad - slanje na eksterni server
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".trackcall1").forEach(function (el) {
    el.addEventListener("click", function () {
      const payload = JSON.stringify({
        time: new Date().toISOString(),
        call: 1
      });

      fetch("https://bobanwebmaker.com/private/lavandabeograd.php", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true
      }).catch(() => {});
    });
  });
});
