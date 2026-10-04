// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
const navItems = document.querySelectorAll('.nav-link');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const subject = this.querySelectorAll('input[type="text"]')[1].value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && subject && message) {
            // Show success message (in real scenario, send to server)
            alert(`Thank you, ${name}! Your message has been received. We'll contact you shortly at ${email}`);
            
            // Reset form
            this.reset();
        } else {
            alert('Please fill in all fields');
        }
    });
}

// Newsletter / Subscription handling
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
            alert('Please enter a valid email address');
            return;
        }

        // 1) Try server-side endpoint first
        try {
            const resp = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (resp.ok) {
                alert('Subscription successful! A confirmation email has been sent to ' + email);
                newsletterForm.reset();
                return;
            }

            // If server returned client error, show message
            const data = await resp.json().catch(() => ({}));
            console.warn('Server subscription returned non-ok:', resp.status, data);
        } catch (err) {
            console.warn('Server subscription failed (will try client fallbacks):', err && err.message);
        }

        // 2) Fallback: EmailJS if configured
        if (window.emailjs && window.EMAILJS_USER_ID && window.EMAILJS_SERVICE_ID && window.EMAILJS_TEMPLATE_ID) {
            try {
                emailjs.init(window.EMAILJS_USER_ID);
                const templateParams = { subscriber_email: email };
                await emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, templateParams);
                alert('Subscription successful! A confirmation email has been sent to ' + email);
                newsletterForm.reset();
                return;
            } catch (err) {
                console.error('EmailJS failed, falling back to mailto:', err && err.message);
            }
        }

        // 3) Final fallback: open mail client with precomposed acknowledgement
        const mailto = `mailto:info@netwise.com?subject=${encodeURIComponent('Subscription Confirmation')}&body=${encodeURIComponent('Hello,%0D%0A%0D%0AI would like to subscribe with this email: ' + email + '%0D%0A%0D%0ABest regards,%0D%0A')}`;
        if (confirm('We can open your mail client to send a confirmation to Netwise (info@netwise.com). Continue?')) {
            window.location.href = mailto;
            newsletterForm.reset();
        } else {
            alert('Subscription recorded locally. Consider running the server to enable automatic confirmations.');
            newsletterForm.reset();
        }
    });
}
