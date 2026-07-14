document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. WELCOME GATE & SESSION STORAGE LOGIC
       ========================================================================== */
    const welcomeGate = document.getElementById('welcome-gate');
    const appContainer = document.getElementById('app');
    const enterBtn = document.getElementById('enter-btn');

    // Function to transition away the welcome gate
    function enterPortfolio() {
        welcomeGate.classList.add('slide-up');
        appContainer.classList.remove('hidden');
        sessionStorage.setItem('portfolio-entered', 'true');
        
        // Trigger initial check for visible elements once gate is gone
        setTimeout(() => {
            triggerScrollReveal();
            // Start scroll observation
            initScrollObserver();
            // Trigger skill bars animation if they are in view
            animateSkillBarsInView();
        }, 850);
    }

    // Check if the user has already entered the site during this session
    if (sessionStorage.getItem('portfolio-entered') === 'true') {
        welcomeGate.style.display = 'none';
        appContainer.classList.remove('hidden');
        // Initial setup for elements and triggers
        setTimeout(() => {
            triggerScrollReveal();
            initScrollObserver();
            animateSkillBarsInView();
        }, 100);
    } else {
        // First-time visit in this session: Wait for user input or trigger timeout
        enterBtn.addEventListener('click', enterPortfolio);
        
        // Auto-enter after 3.5 seconds as a fallback
        const autoEnterTimeout = setTimeout(enterPortfolio, 3500);

        // Clear timeout if user enters manually
        enterBtn.addEventListener('click', () => {
            clearTimeout(autoEnterTimeout);
        });
    }


    /* ==========================================================================
       2. SCROLL REVEAL (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    function triggerScrollReveal() {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elemTop = rect.top;
            const elemBottom = rect.bottom;

            // Simple calculation for viewport entry
            if (elemTop < window.innerHeight * 0.85 && elemBottom > 0) {
                el.classList.add('revealed');
                
                // If it is the achievements list, trigger child stagger reveals
                if (el.classList.contains('achievements-section')) {
                    const cards = el.querySelectorAll('.achievement-card');
                    cards.forEach((card, idx) => {
                        setTimeout(() => {
                            card.classList.add('reveal-item');
                        }, idx * 150); // Stagger interval
                    });
                }
            }
        });
    }

    // Scroll reveal fallback logic
    function initScrollObserver() {
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        
                        // Handle stagger for achievements cards
                        if (entry.target.classList.contains('achievements-section')) {
                            const cards = entry.target.querySelectorAll('.achievement-card');
                            cards.forEach((card, idx) => {
                                setTimeout(() => {
                                    card.classList.add('reveal-item');
                                }, idx * 150);
                            });
                        }
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            });

            revealElements.forEach(el => revealObserver.observe(el));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            window.addEventListener('scroll', triggerScrollReveal);
            triggerScrollReveal();
        }
    }


    /* ==========================================================================
       3. NAVIGATION STICKY & ACTIVE INDICATOR
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Sticky Navbar shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Show/hide Back to Top button
        const backToTopBtn = document.getElementById('back-to-top');
        if (window.scrollY > 600) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'auto';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.pointerEvents = 'none';
        }
    });

    // Back to top button action
    const backToTopBtn = document.getElementById('back-to-top');
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Active Link Highlighting using Intersection Observer
    if ('IntersectionObserver' in window) {
        const navObserverOptions = {
            root: null,
            threshold: 0.35, // Adjust this threshold depending on layouts
            rootMargin: '-70px 0px -20% 0px' // Adjust for navbar height
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, navObserverOptions);

        sections.forEach(section => navObserver.observe(section));
    }


    /* ==========================================================================
       4. MOBILE NAVIGATION MENU
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksList = document.getElementById('nav-links');

    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileToggle.classList.toggle('open');
        navLinksList.classList.toggle('open', isOpen);
    });

    // Close menu when a navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('open');
            navLinksList.classList.remove('open');
        });
    });


    /* ==========================================================================
       5. ACCORDION / EXPANDABLE EXPERIENCE ROWS
       ========================================================================== */
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // Auto-expand first experience item on page load for visual hint
    if (accordionItems.length > 0) {
        accordionItems[0].classList.add('active');
        accordionItems[0].querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
    }


    /* ==========================================================================
       6. SKILLS PROGRESS BARS ANIMATION
       ========================================================================== */
    const skillBars = document.querySelectorAll('.skill-bar');

    function animateSkillBarsInView() {
        if ('IntersectionObserver' in window) {
            const skillsSection = document.getElementById('skills');
            const skillsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        skillBars.forEach(bar => {
                            const targetWidth = bar.getAttribute('data-width');
                            bar.style.width = targetWidth;
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            if (skillsSection) {
                skillsObserver.observe(skillsSection);
            }
        } else {
            // Fallback: Animate immediately
            skillBars.forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }
    }


    /* ==========================================================================
       7. CERTIFICATE DETAILED MODAL DATA & CONTROLLER
       ========================================================================== */
    const certificateData = {
        'edge-ai': {
            title: 'Edge AI for Microcontrollers',
            issuer: 'Coursera · Edge Impulse',
            date: '2025',
            desc: 'Completed a 3-course specialization covering embedded machine learning, model design for resource-constrained microcontroller devices, and microcontroller-based computer vision using Edge Impulse tooling.',
            skills: ['Embedded ML', 'TinyML', 'Computer Vision', 'Microcontrollers', 'Model Optimization', 'Edge Impulse'],
            credId: 'COURSERA-EDGEAI-2025'
        },
        'google-ai': {
            title: 'Google Prompting Essentials & AI Essentials',
            issuer: 'Google / Coursera',
            date: '2025',
            desc: 'Dual specializations focused on AI productivity, advanced prompt engineering techniques, effective LLM interaction strategies, and responsible AI usage in professional contexts.',
            skills: ['Prompt Engineering', 'Generative AI', 'Responsible AI', 'AI Productivity', 'LLMs', 'Workflow Automation'],
            credId: 'GOOGLE-PE-JH27WA018AMV'
        },
        'hackerrank-ps': {
            title: 'Problem Solving (Intermediate)',
            issuer: 'HackerRank',
            date: '2025',
            desc: 'Validated proficiency in core data structures (HashMaps, Stacks, Queues, Linked Lists) and optimal algorithmic solution design for intermediate-level programming challenges.',
            skills: ['Data Structures', 'Algorithms', 'HashMap / Stack / Queue', 'Problem Solving', 'C++ / Python', 'Complexity Analysis'],
            credId: 'HACKERRANK-PS-ab4b872a6f59'
        },
        'anthropic-ai': {
            title: 'AI Fluency: Framework & Foundations + Claude 101',
            issuer: 'Anthropic',
            date: '2025',
            desc: 'Foundational knowledge in AI frameworks, large language model operations, prompting techniques, responsible AI principles, and effective interaction strategies with Claude AI models.',
            skills: ['LLM Operations', 'Prompt Design', 'Claude API', 'AI Frameworks', 'Responsible AI', 'AI Foundations'],
            credId: 'ANTHROPIC-CLAUDE101-2025'
        }
    };

    const certCards = document.querySelectorAll('.certificate-card');
    const certModal = document.getElementById('cert-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    // Modal Element references
    const modalTitle = document.getElementById('modal-details-title');
    const modalDesc = document.getElementById('modal-details-desc');
    const modalSkillsList = document.getElementById('modal-skills-list');
    const modalCredId = document.getElementById('modal-cred-id');
    const modalCertTitle = document.getElementById('modal-cert-title');
    const modalCertIssuer = document.getElementById('modal-cert-issuer');
    const modalCertDate = document.getElementById('modal-cert-date');
    const modalBadgeIssuer = document.getElementById('modal-badge-issuer');

    function openModal(certKey) {
        const data = certificateData[certKey];
        if (!data) return;

        // Populate text content
        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;
        modalCredId.textContent = data.credId;
        
        // Mock Certificate graphics population
        modalCertTitle.textContent = data.title;
        modalCertIssuer.textContent = data.issuer.toUpperCase();
        modalCertDate.textContent = data.date;
        modalBadgeIssuer.textContent = data.issuer;

        // Populate skills list
        modalSkillsList.innerHTML = '';
        data.skills.forEach(skill => {
            const pill = document.createElement('span');
            pill.className = 'skill-pill-small';
            pill.textContent = skill;
            modalSkillsList.appendChild(pill);
        });

        // Open modal — always perfectly centered via CSS flex
        certModal.classList.add('open');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        // Reset scroll to top each time modal opens
        certModal.scrollTop = 0;
        const container = certModal.querySelector('.cert-modal-container');
        if (container) container.scrollTop = 0;
    }

    function closeModal() {
        certModal.classList.remove('open');
        certModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }

    // Attach events — button gets direct listener (works reliably on mobile touch)
    // Card gets a fallback listener for desktop convenience
    certCards.forEach(card => {
        const btn = card.querySelector('.cert-view-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent double-firing with card listener
                const certKey = card.getAttribute('data-cert');
                openModal(certKey);
            });
        }
        card.addEventListener('click', () => {
            const certKey = card.getAttribute('data-cert');
            openModal(certKey);
        });
    });

    // Close button & overlay click
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Keyboard ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.classList.contains('open')) {
            closeModal();
        }
    });

});
