/**
 * Wedding Website JavaScript
 * Handles navigation, gallery lightbox, RSVP form, and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initSmoothScroll();
    initGalleryLightbox();
    initRSVPForm();
    initScrollAnimations();
    initCountdown();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const nav = document.querySelector('.main-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Scroll behavior for navigation
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class when not at top
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile navigation toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Gallery lightbox functionality
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    // 如果你已经移除了 lightbox HTML，就不要初始化 lightbox，避免 JS 报错影响后续功能
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (!galleryItems.length) return;

    // lightbox 结构不存在：直接不启用点击放大（但不报错）
    if (!lightbox || !lightboxImg || !lightboxCaption || !closeBtn || !prevBtn || !nextBtn) {
        console.warn('[Lightbox] Lightbox markup not found. Skipping lightbox init.');
        return;
    }

    let currentIndex = 0;
    const images = [];
    
    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-overlay span');
        const src = img.src; // keep as-is for local images
        
        images.push({
            src: src,
            caption: caption ? caption.textContent : (img.alt || '')
        });
        
        
        item.addEventListener('click', () => {
            currentIndex = index;
            openLightbox();
        });
    });
    
    function openLightbox() {
        lightbox.classList.add('active');
        updateLightboxImage();
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function updateLightboxImage() {
        lightboxImg.src = images[currentIndex].src;
        lightboxCaption.textContent = images[currentIndex].caption;
    }
    
    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    }
    
    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    });
}

/**
 * RSVP Form handling
 */
function initRSVPForm() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    
    if (!form) return;
    const details = document.getElementById('rsvp-details');
    const attendanceRadios = form.querySelectorAll('input[name="attendance"]');

    function setDetailsVisibility() {
        const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
        if (attendance === 'yes') {
            details.classList.remove('hidden');
        } else {
            // hide + clear dependent fields
            details.classList.add('hidden');
            form.querySelectorAll('input[name="events"]').forEach(cb => cb.checked = false);
            const dietary = form.querySelector('#dietary');
            const message = form.querySelector('#message');
            if (dietary) dietary.value = '';
            if (message) message.value = '';
        }
    }

    attendanceRadios.forEach(r => r.addEventListener('change', setDetailsVisibility));
    setDetailsVisibility();
 
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
      
        if (!validateForm(form)) return;
      
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;
      
        try {
          const formData = new FormData(form);
      
          // ✅ 关键：真的发 POST 给 Netlify Forms
          await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString(),
          });
      
          // ✅ 按 attendance 改成功文案（你之前要的 yes/no 文案）
          const attendance = formData.get('attendance'); // "yes" or "no"
          const successTitle = successMessage.querySelector('h3');
          const successText = successMessage.querySelector('p');
      
          successTitle.textContent = 'Thank You!';
          successText.textContent =
            attendance === 'yes'
              ? "We can't wait to celebrate with you!"
              : 'Thank you for your response.';
      
          form.style.display = 'none';
          successMessage.classList.remove('hidden');
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
        } catch (err) {
          console.error(err);
          alert('There was an error submitting your RSVP. Please try again.');
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });
      
    
    // Form validation
    function validateForm(form) {
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
        const eventsChecked = form.querySelectorAll('input[name="events"]:checked');      
        // Clear previous errors
        clearErrors();
        
        let isValid = true;
        
        if (!name) {
            showError('name', 'Please enter your name');
            isValid = false;
        }
        
        if (!email) {
            showError('email', 'Please enter your email');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!attendance) {
            showError('attendance', 'Please choose Yes or No');
            isValid = false;
        }

        if (attendance === 'yes' && eventsChecked.length === 0) {
            showError('events', 'Please select at least one part to attend');
            isValid = false;
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(fieldName, message) {
        const field = form.querySelector(`#${fieldName}`) || 
                      form.querySelector(`[name="${fieldName}"]`);
        
        if (field) {
            const formGroup = field.closest('.form-group');
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = message;
            error.style.cssText = 'color: #E8C4C4; font-size: 0.85rem; display: block; margin-top: 0.5rem;';
            formGroup.appendChild(error);
            
            // Add error styling
            if (field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA') {
                field.style.borderColor = '#E8C4C4';
            }
        }
    }
    
    function clearErrors() {
        form.querySelectorAll('.error-message').forEach(error => error.remove());
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.style.borderColor = '';
        });
    }
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    document.body.classList.add('aos-enabled');
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add delay if specified
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Countdown timer to wedding date
 */
function initCountdown() {
    // Wedding: June 6, 2026 12:00 PM (local time)
    const weddingDate = new Date('2026-06-06T12:00:00');

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.warn('[Countdown] Missing countdown elements (#days/#hours/#minutes/#seconds).');
        return;
    }

    function updateCountdown() {
        const now = new Date();
        let diff = weddingDate - now;

        if (diff <= 0) {
            // Wedding day has arrived!
            daysEl.textContent = '0';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days);
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add parallax effect to hero section
 */
function initParallax() {
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', debounce(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
        }
    }, 10));
}

// Initialize parallax on load
window.addEventListener('load', initParallax);

/**
 * Lazy loading for images
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

