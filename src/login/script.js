document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");
    const pwToggle = document.getElementById('pwToggle');

    function clearMessages(){ errorMessage.textContent=''; successMessage.textContent=''; }

    // password visibility toggle
    if(pwToggle){
      pwToggle.addEventListener('click', ()=>{
        const pwd = document.getElementById('password');
        const icon = pwToggle.querySelector('.fa');
        if(pwd.type === 'password'){ 
          pwd.type = 'text'; 
          pwToggle.setAttribute('aria-pressed','true'); 
          pwToggle.setAttribute('aria-label','Hide password'); 
          if(icon){ icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
        } else { 
          pwd.type = 'password'; 
          pwToggle.setAttribute('aria-pressed','false'); 
          pwToggle.setAttribute('aria-label','Show password'); 
          if(icon){ icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
        }
      });
    }

    form.addEventListener("input", clearMessages);

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = form.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = true;

    // show spinner
    if(submitBtn){
      submitBtn.classList.add('loading');
      const spinner = document.createElement('span'); spinner.className='btn-spinner';
      submitBtn.prepend(spinner);
    }

    setTimeout(()=>{
      if (username === "admin" && password === "admin") {
        localStorage.setItem('authToken', 'valid_token');
        sessionStorage.setItem('authToken', 'valid_token');
        clearMessages();
        successMessage.textContent = "Login successful — redirecting...";
        // compute absolute URL to admin page and redirect robustly
        try {
          const adminUrl = new URL('../admin/admin.html', window.location.href).href;
          setTimeout(()=> window.location.assign(adminUrl), 700);
        } catch (err) {
          // fallback to relative navigation if URL construction fails
          console.error('Redirect construction failed', err);
          setTimeout(()=> window.location.href = "../admin/admin.html", 700);
        }
      } else {
        successMessage.textContent = "";
        errorMessage.textContent = "Invalid username or password!";
        const card = document.querySelector('.login-card');
        if(card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
        document.getElementById('password').focus();
      }

      // cleanup spinner
      if(submitBtn){ submitBtn.disabled = false; const s = submitBtn.querySelector('.btn-spinner'); if(s) s.remove(); submitBtn.classList.remove('loading'); }
    }, 700); // simulate network/auth delay for UX
  });

    form.addEventListener('reset', ()=>{ setTimeout(()=> document.getElementById('username').focus(),50); clearMessages(); });
});