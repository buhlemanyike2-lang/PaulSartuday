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

// === Toggle Password Visibility ===
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

// === OBFUSCATED ADMIN CREDENTIALS ===
// Simple obfuscation for budget solution
const _0xadmin = {
    _0xemail: atob('QWRtaW5AcGF1bG1vcnV0c2VpbnN0aXR1dGUuY28uemE='),
    _0xpass: atob('QWRtaW4yNEAh')
};

// === Login Form Submission ===
const loginForm = document.getElementById('loginForm');
const loginLoading = document.getElementById('loginLoading');
const loginSuccess = document.getElementById('loginSuccess');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Simple validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Validate admin email domain
        if (!email.includes('@paulmorutseinstitute.co.za')) {
            showError('Admin access only. Use official email.');
            return;
        }
        
        // Show loading state
        loginForm.style.display = 'none';
        loginLoading.classList.add('active');
         
        // Simulate login process
        setTimeout(() => {
            loginLoading.classList.remove('active');
            
            // Check credentials (both must match)
            if (email === _0xadmin._0xemail && password === _0xadmin._0xpass) {
                loginSuccess.classList.add('active');
                
                // Store auth token for admin page
                sessionStorage.setItem('pmi_admin_auth', 'pmi_admin_token_2025_secure');
                sessionStorage.setItem('pmi_admin_email', email);
                
                // Store remember me preference
                if (remember) {
                    localStorage.setItem('rememberedEmail', email);
                }
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                loginError.classList.add('active');
                
                setTimeout(() => {
                    loginError.classList.remove('active');
                    loginForm.style.display = 'flex';
                }, 2500);
            }
        }, 1500);
    });
}

// === Show Error Helper ===
function showError(message) {
    const errorP = loginError.querySelector('p:first-of-type');
    if (errorP) {
        errorP.textContent = message;
    }
    loginError.classList.add('active');
    
    setTimeout(() => {
        loginError.classList.remove('active');
    }, 2500);
}

// === Remember Me - Auto-fill Email ===
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember');
    
    if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
});

// === Input Focus Animations ===
const formInputs = document.querySelectorAll('.form-group input');
formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// === Fade-in Animation on Scroll ===
const sections = document.querySelectorAll('.section-animate');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => observer.observe(section));
})();
