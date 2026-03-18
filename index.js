(function() {
    // === Mobile Menu Toggle ===
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // === Close Mobile Menu on Link Click ===
    const navAnchors = document.querySelectorAll('.nav-links a');
    navAnchors.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // === Download Button Interaction ===
    const downloadBtn = document.getElementById('downloadRegBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Create a fake anchor to simulate downloading a placeholder file
            const link = document.createElement('a');
            link.href = 'data:application/octet-stream,' + encodeURIComponent('Paul Morutse Institute – Registration form (dummy)\n\nPlease contact 075 011 3984 for the official PDF form.');
            link.download = 'application.pdf';  // Filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Optional subtle feedback
            const originalContent = downloadBtn.innerHTML;
            downloadBtn.innerHTML = ' <i class="fas fa-check"></i> Download started (simulated)';
            setTimeout(() => {
                downloadBtn.innerHTML = originalContent;
            }, 2000);
        });
    }

    // === Grade Tab Filtering ===
    const gradeTabs = document.querySelectorAll('.grade-tag');
    const subjectGroups = document.querySelectorAll('.subject-group');

    gradeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            gradeTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Get target ID
            const targetId = tab.getAttribute('data-target');

            // Hide all subject groups
            subjectGroups.forEach(group => {
                group.classList.remove('active-group');
            });

            // Show target group
            const targetGroup = document.getElementById(targetId);
            if (targetGroup) {
                targetGroup.classList.add('active-group');
            }
        });
    });

    // === Intersection Observer for Fade-Up Animations ===
    const sections = document.querySelectorAll('.section-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(s => observer.observe(s));

    // === Highlight Active Nav Link on Scroll ===
    const sectionsObserve = document.querySelectorAll('section, header');
    window.addEventListener('scroll', () => {
        let current = '';
        sectionsObserve.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Offset for sticky header
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navAnchors.forEach(link => {
            link.style.color = ''; // Reset
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = 'var(--accent-red)';
            }
        });
    });
})();