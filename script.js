// ===== PARTICLE BACKGROUND =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: 0, y: 0 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction - particles gently push away
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
            this.x += dx * 0.02;
            this.y += dy * 0.02;
        }

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 245, 212, ${0.08 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// ===== NAVIGATION =====
const nav = document.getElementById('main-nav');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });

    // Show/hide back to top button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
});

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});


// ===== STATS COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(target * eased).toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    });
}

// Observe hero stats
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);


// ===== SEVERITY BAR ANIMATION =====
const severityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.severity-fill');
            fills.forEach(fill => {
                const targetWidth = fill.getAttribute('data-width');
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = targetWidth;
                }, 200);
            });
            severityObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const threatsGrid = document.querySelector('.threats-grid');
if (threatsGrid) severityObserver.observe(threatsGrid);

// Store the target widths from inline styles into data attributes on load
document.querySelectorAll('.severity-fill').forEach(fill => {
    const inlineWidth = fill.style.width || '0%';
    fill.setAttribute('data-width', inlineWidth);
    fill.style.width = '0%';
});


// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`panel-${tab}`);
        panel.classList.add('active');

        // Ensure tip cards inside newly active panel are visible
        panel.querySelectorAll('.tip-card.reveal').forEach(card => {
            card.classList.add('visible');
        });
    });
});


// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Stagger animations for grid children
            const parent = entry.target.parentElement;
            if (parent) {
                const siblings = Array.from(parent.querySelectorAll('.reveal'));
                const index = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
            }
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.threat-card, .tip-card, .example-card, .quiz-start-card').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});


// ===== QUIZ =====
const quizQuestions = [
    {
        question: "What is phishing?",
        options: [
            "A technique to speed up your internet connection",
            "A fraudulent attempt to obtain sensitive information by pretending to be a trustworthy entity",
            "A type of firewall protection",
            "A method to encrypt your data"
        ],
        correct: 1,
        explanation: "Phishing is a social engineering attack where criminals impersonate trusted entities to trick you into revealing sensitive information like passwords and credit card numbers."
    },
    {
        question: "Which of the following is the strongest password?",
        options: [
            "password123",
            "MyDogRex",
            "K9#mP$vL2@xQ!z",
            "12345678"
        ],
        correct: 2,
        explanation: "Strong passwords use a mix of uppercase, lowercase, numbers, and special characters. 'K9#mP$vL2@xQ!z' is the most complex and hardest to crack."
    },
    {
        question: "What does ransomware do?",
        options: [
            "Speeds up your computer",
            "Encrypts your files and demands payment for the decryption key",
            "Protects you from viruses",
            "Backs up your data automatically"
        ],
        correct: 1,
        explanation: "Ransomware encrypts your files making them inaccessible, then demands a ransom payment (usually in cryptocurrency) for the decryption key."
    },
    {
        question: "What should you do if you receive a suspicious email claiming your bank account is compromised?",
        options: [
            "Click the link in the email immediately",
            "Reply with your account details",
            "Contact your bank directly using their official website or phone number",
            "Forward it to all your contacts as a warning"
        ],
        correct: 2,
        explanation: "Never click links or provide information through suspicious emails. Always contact your bank directly through verified channels to confirm any issues."
    },
    {
        question: "What does HTTPS indicate in a website URL?",
        options: [
            "The website is free to use",
            "The connection between your browser and the website is encrypted",
            "The website loads faster",
            "The website is owned by the government"
        ],
        correct: 1,
        explanation: "HTTPS (Hypertext Transfer Protocol Secure) means data between your browser and the website is encrypted, making it harder for attackers to intercept."
    },
    {
        question: "Which of these is a sign of a phishing email?",
        options: [
            "The email is from a known contact about a planned meeting",
            "The email has a personalized greeting with your name",
            "The email creates urgency and asks you to click a link immediately",
            "The email is from your company's IT department about a scheduled update"
        ],
        correct: 2,
        explanation: "Phishing emails typically create false urgency to pressure you into acting quickly without thinking. They often contain threats like 'your account will be closed.'"
    },
    {
        question: "What is two-factor authentication (2FA)?",
        options: [
            "Using two different passwords for the same account",
            "A security process requiring two different forms of identification to access an account",
            "Having two email accounts",
            "Logging in from two different devices"
        ],
        correct: 1,
        explanation: "2FA adds an extra security layer by requiring something you know (password) plus something you have (phone/token) or something you are (fingerprint)."
    },
    {
        question: "What percentage of cyber attacks are estimated to be caused by human error?",
        options: [
            "About 25%",
            "About 50%",
            "About 75%",
            "About 95%"
        ],
        correct: 3,
        explanation: "Studies show that approximately 95% of cybersecurity breaches are caused by human error, which is why awareness training is crucial."
    },
    {
        question: "Why should you avoid using public Wi-Fi for banking?",
        options: [
            "Public Wi-Fi is too slow for banking",
            "Banks don't allow public Wi-Fi connections",
            "Attackers can intercept unencrypted data on public networks",
            "Public Wi-Fi costs extra money"
        ],
        correct: 2,
        explanation: "Public Wi-Fi networks are often unsecured, allowing attackers to perform 'man-in-the-middle' attacks and intercept sensitive data like login credentials."
    },
    {
        question: "What is the best practice for software updates?",
        options: [
            "Only update once a year",
            "Ignore updates as they slow down your device",
            "Enable automatic updates and install them promptly",
            "Only update if your device stops working"
        ],
        correct: 2,
        explanation: "Software updates often include critical security patches. Enabling automatic updates ensures you're protected against known vulnerabilities as soon as fixes are available."
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;

    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'none';
    document.getElementById('quiz-active').style.display = 'block';

    loadQuestion();

    // Scroll to quiz active area
    setTimeout(() => {
        document.getElementById('quiz-active').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function loadQuestion() {
    answered = false;
    const q = quizQuestions[currentQuestion];

    document.getElementById('quiz-question-num').textContent = `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
    document.getElementById('quiz-score-live').textContent = `Score: ${score}`;
    document.getElementById('quiz-progress-fill').style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
    document.getElementById('quiz-question-text').textContent = q.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((option, index) => {
        const optionEl = document.createElement('button');
        optionEl.className = 'quiz-option';
        optionEl.id = `quiz-option-${index}`;
        optionEl.innerHTML = `<span class="option-letter">${letters[index]}</span><span>${option}</span>`;
        optionEl.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(optionEl);
    });

    document.getElementById('quiz-feedback').style.display = 'none';

    // Scroll to question card
    setTimeout(() => {
        document.getElementById('quiz-question-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function selectAnswer(index) {
    if (answered) return;
    answered = true;

    const q = quizQuestions[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');

    options.forEach(opt => opt.classList.add('disabled'));

    if (index === q.correct) {
        score++;
        options[index].classList.add('correct');
        showFeedback(true, q.explanation);
    } else {
        options[index].classList.add('wrong');
        options[q.correct].classList.add('correct');
        showFeedback(false, q.explanation);
    }

    document.getElementById('quiz-score-live').textContent = `Score: ${score}`;
}

function showFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('quiz-feedback');
    const icon = document.getElementById('feedback-icon');
    const text = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('quiz-next-btn');

    icon.textContent = isCorrect ? '✅' : '❌';
    text.textContent = explanation;

    if (currentQuestion === quizQuestions.length - 1) {
        nextBtn.innerHTML = `View Results <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    } else {
        nextBtn.innerHTML = `Next Question <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    }

    feedback.style.display = 'flex';

    // Scroll feedback into view
    setTimeout(() => {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= quizQuestions.length) {
        showResults();
    } else {
        loadQuestion();
    }
}

function showResults() {
    document.getElementById('quiz-active').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'flex';

    const percent = Math.round((score / quizQuestions.length) * 100);
    const wrong = quizQuestions.length - score;

    document.getElementById('result-correct').textContent = score;
    document.getElementById('result-wrong').textContent = wrong;
    document.getElementById('result-total').textContent = quizQuestions.length;

    // Animate score circle
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 54; // r=54

    // Reset first
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = circumference;

    const offset = circumference - (percent / 100) * circumference;

    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s ease';
        circle.style.strokeDashoffset = offset;
    }, 50);

    // Animate percent number
    const percentEl = document.getElementById('score-percent');
    percentEl.textContent = '0';
    let current = 0;
    const totalFrames = 60;
    const step = percent / totalFrames;
    let frame = 0;
    const countInterval = setInterval(() => {
        frame++;
        current += step;
        if (frame >= totalFrames || current >= percent) {
            current = percent;
            clearInterval(countInterval);
        }
        percentEl.textContent = Math.round(current);
    }, 16);

    // Result message
    let title, message;
    if (percent >= 90) {
        title = '🏆 Outstanding!';
        message = "You're a cybersecurity expert! Your knowledge can help protect yourself and others online.";
    } else if (percent >= 70) {
        title = '🌟 Great Job!';
        message = "You have strong cybersecurity awareness. Review the topics you missed to perfect your knowledge.";
    } else if (percent >= 50) {
        title = '💪 Good Effort!';
        message = "You have a basic understanding. We recommend revisiting the safety tips and threat sections above.";
    } else {
        title = '📚 Keep Learning!';
        message = "Cybersecurity knowledge is crucial. Review all sections above and retake the quiz to improve your score.";
    }

    document.getElementById('results-title').textContent = title;
    document.getElementById('results-message').textContent = message;

    // Scroll to results
    setTimeout(() => {
        document.getElementById('quiz-results').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function retakeQuiz() {
    startQuiz();
}


// ===== CERTIFICATE =====
function showCertificate() {
    const modal = document.getElementById('certificate-modal');
    modal.style.display = 'flex';

    const percent = Math.round((score / quizQuestions.length) * 100);

    document.getElementById('cert-score').textContent = `${score}/${quizQuestions.length}`;

    let grade;
    if (percent >= 90) grade = 'A+';
    else if (percent >= 80) grade = 'A';
    else if (percent >= 70) grade = 'B';
    else if (percent >= 60) grade = 'C';
    else if (percent >= 50) grade = 'D';
    else grade = 'F';

    document.getElementById('cert-grade').textContent = grade;

    const now = new Date();
    document.getElementById('cert-date-text').textContent = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const certId = `CS-${now.getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    document.getElementById('cert-id-text').textContent = certId;

    document.body.style.overflow = 'hidden';
}

function closeCertificate() {
    document.getElementById('certificate-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function downloadCertificate() {
    const name = document.getElementById('cert-name-input').value.trim() || 'Participant';
    const certScore = document.getElementById('cert-score').textContent;
    const certGrade = document.getElementById('cert-grade').textContent;
    const certDate = document.getElementById('cert-date-text').textContent;
    const certId = document.getElementById('cert-id-text').textContent;
    const percent = Math.round((score / quizQuestions.length) * 100);

    // Create a canvas-based certificate image
    const certCanvas = document.createElement('canvas');
    certCanvas.width = 1200;
    certCanvas.height = 850;
    const c = certCanvas.getContext('2d');

    // Background
    const bgGrad = c.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#0d1117');
    bgGrad.addColorStop(1, '#161b22');
    c.fillStyle = bgGrad;
    c.fillRect(0, 0, 1200, 850);

    // Border gradient
    const borderGrad = c.createLinearGradient(0, 0, 1200, 850);
    borderGrad.addColorStop(0, '#00f5d4');
    borderGrad.addColorStop(0.5, '#7b61ff');
    borderGrad.addColorStop(1, '#f472b6');
    c.strokeStyle = borderGrad;
    c.lineWidth = 4;
    c.strokeRect(20, 20, 1160, 810);

    // Inner border
    c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.lineWidth = 1;
    c.strokeRect(40, 40, 1120, 770);

    // Shield icon (simplified)
    c.save();
    c.translate(600, 100);
    c.beginPath();
    c.moveTo(0, -35);
    c.lineTo(30, -20);
    c.lineTo(30, 5);
    c.quadraticCurveTo(30, 30, 0, 45);
    c.quadraticCurveTo(-30, 30, -30, 5);
    c.lineTo(-30, -20);
    c.closePath();
    c.strokeStyle = borderGrad;
    c.lineWidth = 2.5;
    c.stroke();
    // Checkmark
    c.beginPath();
    c.moveTo(-10, 5);
    c.lineTo(-2, 13);
    c.lineTo(14, -5);
    c.strokeStyle = '#00f5d4';
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.stroke();
    c.restore();

    // Title
    c.fillStyle = '#00f5d4';
    c.font = 'bold 36px Inter, Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('CYBERSHIELD', 600, 180);

    // Subtitle
    c.fillStyle = '#94a3b8';
    c.font = '500 16px Inter, Arial, sans-serif';
    c.letterSpacing = '3px';
    c.fillText('CERTIFICATE OF CYBERSECURITY AWARENESS', 600, 215);

    // Decorative line
    const lineGrad = c.createLinearGradient(250, 0, 950, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.3, '#00f5d4');
    lineGrad.addColorStop(0.7, '#7b61ff');
    lineGrad.addColorStop(1, 'transparent');
    c.strokeStyle = lineGrad;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(250, 240);
    c.lineTo(950, 240);
    c.stroke();

    // "This certifies that"
    c.fillStyle = '#64748b';
    c.font = '400 18px Inter, Arial, sans-serif';
    c.fillText('This certifies that', 600, 290);

    // Name
    c.fillStyle = '#f1f5f9';
    c.font = 'bold 42px Inter, Arial, sans-serif';
    c.fillText(name, 600, 345);

    // Name underline
    const nameWidth = c.measureText(name).width;
    c.strokeStyle = '#00f5d4';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(600 - nameWidth / 2 - 20, 360);
    c.lineTo(600 + nameWidth / 2 + 20, 360);
    c.stroke();

    // Detail text
    c.fillStyle = '#94a3b8';
    c.font = '400 17px Inter, Arial, sans-serif';
    c.fillText('has successfully completed the CyberShield', 600, 410);
    c.fillText('Cybersecurity Awareness Quiz', 600, 435);

    // Score box
    c.fillStyle = 'rgba(0, 245, 212, 0.08)';
    c.strokeStyle = 'rgba(0, 245, 212, 0.2)';
    c.lineWidth = 1;
    const boxW = 400, boxH = 60, boxX = 400, boxY = 470;
    c.beginPath();
    c.roundRect(boxX, boxY, boxW, boxH, 10);
    c.fill();
    c.stroke();

    c.fillStyle = '#64748b';
    c.font = '400 15px Inter, Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('Score', 520, 505);
    c.fillText('Grade', 680, 505);

    c.fillStyle = '#00f5d4';
    c.font = 'bold 22px "JetBrains Mono", monospace, Arial';
    c.fillText(certScore, 520, 525);
    c.fillText(certGrade, 680, 525);

    // Separator in box
    c.strokeStyle = 'rgba(255,255,255,0.1)';
    c.beginPath();
    c.moveTo(600, boxY + 10);
    c.lineTo(600, boxY + boxH - 10);
    c.stroke();

    // Bottom line
    c.strokeStyle = lineGrad;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(250, 580);
    c.lineTo(950, 580);
    c.stroke();

    // Date
    c.fillStyle = '#64748b';
    c.font = '400 13px Inter, Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('Date Issued', 300, 640);
    c.fillStyle = '#94a3b8';
    c.font = '500 15px Inter, Arial, sans-serif';
    c.fillText(certDate, 300, 620);
    c.strokeStyle = 'rgba(255,255,255,0.1)';
    c.beginPath();
    c.moveTo(200, 625);
    c.lineTo(400, 625);
    c.stroke();

    // Verified seal
    c.beginPath();
    c.arc(600, 630, 32, 0, Math.PI * 2);
    c.strokeStyle = borderGrad;
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = '#00f5d4';
    c.font = 'bold 11px Inter, Arial, sans-serif';
    c.fillText('VERIFIED', 600, 634);

    // Certificate ID
    c.fillStyle = '#64748b';
    c.font = '400 13px Inter, Arial, sans-serif';
    c.fillText('Certificate ID', 900, 640);
    c.fillStyle = '#94a3b8';
    c.font = '500 15px "JetBrains Mono", monospace, Arial';
    c.fillText(certId, 900, 620);
    c.strokeStyle = 'rgba(255,255,255,0.1)';
    c.beginPath();
    c.moveTo(800, 625);
    c.lineTo(1000, 625);
    c.stroke();

    // Motivational quote
    c.fillStyle = '#475569';
    c.font = 'italic 14px Inter, Arial, sans-serif';
    c.fillText('"Security is not a product, but a process." — Bruce Schneier', 600, 720);

    // CyberShield watermark
    c.fillStyle = 'rgba(0, 245, 212, 0.04)';
    c.font = 'bold 80px Inter, Arial, sans-serif';
    c.fillText('CYBERSHIELD', 600, 780);

    // Download as PNG
    certCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CyberShield_Certificate_${name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Close modal on overlay click
document.getElementById('certificate-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeCertificate();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCertificate();
        closeFakeLoginModal();
        closePhishingModal();
        closeSmsModal();
    }
});


// ===== FAKE LOGIN DEMO =====
function handleFakeLogin() {
    const email = document.getElementById('fake-email').value.trim();
    const password = document.getElementById('fake-password').value.trim();

    // Show what was "captured"
    const displayEmail = email || '(empty — but a keylogger would still capture keystrokes)';
    const displayPassword = password ? '•'.repeat(password.length) + ' (' + password.length + ' chars captured)' : '(empty — but a real site would record this)';

    document.getElementById('captured-email').textContent = displayEmail;
    document.getElementById('captured-password').textContent = displayPassword;

    // Show warning modal
    const modal = document.getElementById('fake-login-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Clear the fake form
    document.getElementById('fake-email').value = '';
    document.getElementById('fake-password').value = '';
}

function closeFakeLoginModal() {
    const modal = document.getElementById('fake-login-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close fake login modal on overlay click
document.getElementById('fake-login-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeFakeLoginModal();
    }
});

// Allow pressing Enter in fake login form to submit
document.getElementById('fake-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleFakeLogin();
    }
});

document.getElementById('fake-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('fake-password').focus();
    }
});


// ===== PHISHING LINK DEMO =====
function handlePhishingLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const modal = document.getElementById('phishing-link-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePhishingModal() {
    const modal = document.getElementById('phishing-link-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

document.getElementById('phishing-link-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closePhishingModal();
    }
});


// ===== SMS LINK DEMO =====
function handleSmsLinkClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const modal = document.getElementById('sms-link-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSmsModal() {
    const modal = document.getElementById('sms-link-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

document.getElementById('sms-link-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeSmsModal();
    }
});


// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const offset = 80; // nav height
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});


// ===== BACK TO TOP =====
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ===== TYPING EFFECT FOR HERO BADGE =====
function typeWriter(element, text, speed = 40) {
    element.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Add a subtle typing effect to the badge when visible
const heroBadge = document.querySelector('.hero-badge');
if (heroBadge) {
    const badgeText = heroBadge.textContent.trim();
    // Keep badge-dot, just animate the text part
}


// ===== RED FLAG TOOLTIP TOUCH SUPPORT =====
document.querySelectorAll('.red-flag[data-tooltip]').forEach(flag => {
    flag.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove all other active tooltips
        document.querySelectorAll('.red-flag.tooltip-active').forEach(f => {
            if (f !== flag) f.classList.remove('tooltip-active');
        });
        flag.classList.toggle('tooltip-active');
    });
});

document.addEventListener('click', () => {
    document.querySelectorAll('.red-flag.tooltip-active').forEach(f => {
        f.classList.remove('tooltip-active');
    });
});


// ===== KEYBOARD NAVIGATION FOR QUIZ =====
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quiz-active').style.display === 'block') {
        if (!answered) {
            const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
            const key = e.key.toLowerCase();
            if (key in keyMap) {
                selectAnswer(keyMap[key]);
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            nextQuestion();
        }
    }
});
