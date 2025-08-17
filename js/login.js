// ===== login.js =====
// Credenciales demo
const DEMO_EMAIL = "kais17200@gmail.com";
const DEMO_PASS  = "12345";

document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const pass  = document.getElementById("loginPass");
  const msg   = document.getElementById("loginMsg");

  if (email) email.value = DEMO_EMAIL;
  if (pass)  pass.value  = DEMO_PASS;

  if (form){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const em = (email?.value || "").trim();
      const pw = (pass?.value  || "").trim();
      if (em === DEMO_EMAIL && pw === DEMO_PASS){
        writeUser({ name:"Cliente", email: DEMO_EMAIL });
        msg.textContent = "Sesión iniciada.";
        msg.className = "small success";
        updateCartBadge();
        setTimeout(()=> window.location.href = "index.html", 600);
      } else {
        msg.textContent = "Credenciales inválidas.";
        msg.className = "small error";
      }
    });
  }
});
