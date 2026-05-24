const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {

  header.addEventListener("click", () => {

    const content = header.nextElementSibling;

    if(content.style.maxHeight){
      content.style.maxHeight = null;
    }
    else{
      content.style.maxHeight = content.scrollHeight + "px";
    }

  });

});

const draggableRows = document.querySelectorAll('.draggable-row');
const galleryInfo = document.getElementById('galleryInfo');
const galleryText = {
  katutubo: 'Nagsimula ito sa anyong pasalin-dila (oral tradition). Ang ating mga ninuno ay nagpapahayag ng kanilang saloobin sa pamamagitan ng mga kuwentong-bayan, alamat, epiko, salawikain, at mga awiting-bayan. Sila ay may sarili na ring sistema ng pagsulat, ang Baybayin.',
  kastila: 'Dito nagbago ang anyo ng panitikan dahil ipinakilala ang panitikang Romano at Kristiyanismo. Nagsimulang maisulat ang mga akda gamit ang alpabetong Latin.',
  amerikano: 'Patuloy na nalinang ang panitikan sa pamamagitan ng paggamit ng wikang Ingles at Tagalog/Filipino, na sumasalamin sa modernisasyon at mga napapanahong isyung panlipunan.'
};

draggableRows.forEach(row => {
  let isDragging = false;
  let startX;
  let scrollLeft;

  row.addEventListener('mousedown', (e) => {
    isDragging = true;
    row.classList.add('active');
    startX = e.pageX - row.getBoundingClientRect().left;
    scrollLeft = row.scrollLeft;
  });

  row.addEventListener('mouseleave', () => {
    isDragging = false;
    row.classList.remove('active');
  });

  row.addEventListener('mouseup', () => {
    isDragging = false;
    row.classList.remove('active');
  });

  row.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    e.preventDefault();
    const x = e.pageX - row.getBoundingClientRect().left;
    const walk = (x - startX) * 1.2;
    row.scrollLeft = scrollLeft - walk;
  });

  row.addEventListener('click', (e) => {
    if(isDragging) return;
    const item = e.target.closest('.gallery-item');
    if(!item) return;
    const key = item.dataset.info;
    if(galleryText[key]){
      galleryInfo.textContent = galleryText[key];
    }
  });

  row.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - row.offsetLeft;
    scrollLeft = row.scrollLeft;
  });

  row.addEventListener('touchend', () => {
    isDragging = false;
  });

  row.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    const x = e.touches[0].pageX - row.offsetLeft;
    const walk = (x - startX) * 1.2;
    row.scrollLeft = scrollLeft - walk;
  });
});

let lastScrollY = window.scrollY;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }

  lastScrollY = currentScrollY;
});

const carouselContainers = document.querySelectorAll('.prosa-carousel, .patula-carousel');

const getVisibleSlides = () => {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 900) return 2;
  if (window.innerWidth < 1360) return 3;
  return 4;
};

carouselContainers.forEach(container => {
  const carouselTrack = container.querySelector('.carousel-track');
  const slides = carouselTrack ? Array.from(carouselTrack.querySelectorAll('.carousel-slide')) : [];
  const prevButton = container.querySelector('.carousel-button.prev');
  const nextButton = container.querySelector('.carousel-button.next');
  const dotsContainer = container.querySelector('.carousel-dots');
  const trackWrapper = container.querySelector('.carousel-track-wrapper');
  let currentSlide = 0;
  let slideWidth = 0;
  let pageCount = 1;
  let touchStartX = 0;
  let touchDeltaX = 0;
  let autoPlayId;
  const autoPlayDelay = 5500;

  const updateMeasurements = () => {
    const firstSlide = slides[0];
    if (!firstSlide) return;
    const style = window.getComputedStyle(firstSlide);
    const gap = parseFloat(style.marginRight) || 0;
    slideWidth = firstSlide.getBoundingClientRect().width + gap;

    const visibleCount = getVisibleSlides();
    pageCount = Math.max(1, slides.length - visibleCount + 1);
    if (currentSlide >= pageCount) {
      currentSlide = pageCount - 1;
    }
  };

  const moveToSlide = (index) => {
    if (index < 0) index = pageCount - 1;
    if (index >= pageCount) index = 0;

    currentSlide = index;
    if (carouselTrack) {
      carouselTrack.style.transform = `translateX(-${slideWidth * currentSlide}px)`;
    }
    updateDots();
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  };

  const renderDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < pageCount; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      if (i === currentSlide) dot.classList.add('active');
      dot.addEventListener('click', () => moveToSlide(i));
      dotsContainer.appendChild(dot);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayId = window.setInterval(() => {
      moveToSlide(currentSlide + 1);
    }, autoPlayDelay);
  };

  const stopAutoPlay = () => {
    if (autoPlayId) {
      window.clearInterval(autoPlayId);
    }
  };

  let isDragging = false;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let dragOffsetX = 0;

  const handleDragStart = (event) => {
    stopAutoPlay();
    isDragging = true;
    dragStartX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
    dragDeltaX = 0;
    dragOffsetX = -slideWidth * currentSlide;
    carouselTrack.style.transition = 'none';
    trackWrapper.classList.add('active');
  };

  const handleDragMove = (event) => {
    if (!isDragging) return;
    const clientX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
    dragDeltaX = clientX - dragStartX;
    carouselTrack.style.transform = `translateX(${dragOffsetX + dragDeltaX}px)`;
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    trackWrapper.classList.remove('active');
    carouselTrack.style.transition = '';

    if (dragDeltaX > 60) {
      moveToSlide(currentSlide - 1);
    } else if (dragDeltaX < -60) {
      moveToSlide(currentSlide + 1);
    } else {
      moveToSlide(currentSlide);
    }

    dragDeltaX = 0;
    startAutoPlay();
  };

  if (carouselTrack && slides.length) {
    updateMeasurements();
    renderDots();
    moveToSlide(currentSlide);

    window.addEventListener('resize', () => {
      updateMeasurements();
      renderDots();
      moveToSlide(currentSlide);
    });

    prevButton?.addEventListener('click', () => moveToSlide(currentSlide - 1));
    nextButton?.addEventListener('click', () => moveToSlide(currentSlide + 1));

    trackWrapper?.addEventListener('mousedown', handleDragStart);
    trackWrapper?.addEventListener('mousemove', handleDragMove);
    trackWrapper?.addEventListener('mouseup', handleDragEnd);
    trackWrapper?.addEventListener('mouseleave', handleDragEnd);

    trackWrapper?.addEventListener('touchstart', handleDragStart, { passive: true });
    trackWrapper?.addEventListener('touchmove', handleDragMove, { passive: true });
    trackWrapper?.addEventListener('touchend', handleDragEnd);
    trackWrapper?.addEventListener('touchcancel', handleDragEnd);

    trackWrapper?.addEventListener('mouseenter', stopAutoPlay);
    trackWrapper?.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }
});

const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
const closeMoreButtons = document.querySelectorAll('.close-more');

learnMoreButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    document.querySelectorAll('.card-more.show').forEach(openCard => {
      openCard.classList.remove('show');
    });
    document.querySelectorAll('.prosa-card.show-title, .prosa-card.show-detail').forEach(openCard => {
      openCard.classList.remove('show-title', 'show-detail');
    });

    const card = event.currentTarget.closest('.prosa-card');
    const cardMore = card?.querySelector('.card-more');
    card?.classList.add('show-title');
    cardMore?.classList.add('show');
  });
});

closeMoreButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const card = event.currentTarget.closest('.prosa-card');
    const cardMore = card?.querySelector('.card-more');
    cardMore?.classList.remove('show');
    card?.classList.remove('show-title', 'show-detail');
  });
});

document.querySelectorAll('.prosa-card').forEach(card => {
  card.addEventListener('mouseleave', () => {
    const cardMore = card.querySelector('.card-more');
    cardMore?.classList.remove('show');
    card.classList.remove('show-title', 'show-detail');
  });
});

document.querySelectorAll('.card-more').forEach(cardMore => {
  cardMore.addEventListener('click', (event) => {
    if (event.target === cardMore) {
      cardMore.classList.remove('show');
    }
  });
});
