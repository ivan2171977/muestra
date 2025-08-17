
document.addEventListener('DOMContentLoaded', ()=>{
  const f = document.getElementById('loginForm');
  if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const form = new FormData(f);
    const email = form.get('email');
    const password = form.get('password');
    // Demo: cualquier email/password válido
    localStorage.setItem('user', JSON.stringify({email}));
    const msg = document.getElementById('loginMsg');
    msg.textContent = 'Sesión iniciada.';
    msg.className = 'small success';
    setTimeout(()=>location.href='index.html', 650);
  });
});
