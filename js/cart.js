// ===== cart.js =====
function renderCart() {
  const tbody = document.querySelector("#cartTable tbody");
  const tfoot = document.querySelector("#cartTable tfoot .totalCell");
  const payBtn = document.getElementById("btnPay");
  const items = readCart();

  if (!tbody) return;

  let total = 0;

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td><div style="font-weight:600;color:var(--primary)">—</div></td>
        <td class="right">
          <input class="input" type="number" min="1" value="1" disabled style="opacity:.6">
        </td>
        <td>—</td>
        <td class="right">—</td>
        <td class="right">$ 0</td>
        <td class="right"><button class="btn secondary" disabled>Quitar</button></td>
      </tr>
    `;
    if (tfoot) tfoot.textContent = fmtCOP(0);
    if (payBtn) { payBtn.disabled = true; payBtn.classList.add("secondary"); }
    return;
  }

  tbody.innerHTML = items.map((it, i) => {
    const p = getProductById(it.id);
    const sub = p.precio * it.qty;
    total += sub;
    return `
      <tr>
        <td>
          <div style="font-weight:600;color:var(--primary)">${p.nombre}</div>
        </td>
        <td class="right">
          <input class="input qtyInput" data-idx="${i}" type="number" min="1" value="${it.qty}">
        </td>
        <td>${it.size ?? "-"}</td>
        <td class="right">${fmtCOP(p.precio)}</td>
        <td class="right">${fmtCOP(sub)}</td>
        <td class="right"><button class="btn secondary rmItem" data-idx="${i}">Quitar</button></td>
      </tr>
    `;
  }).join("");

  if (tfoot) tfoot.textContent = fmtCOP(total);
  if (payBtn) { payBtn.disabled = false; payBtn.classList.remove("secondary"); }

  // Eventos cantidad
  tbody.querySelectorAll(".qtyInput").forEach(inp=>{
    inp.addEventListener("input", (e)=>{
      const idx = Number(e.target.dataset.idx);
      const arr = readCart();
      const val = Math.max(1, Number(e.target.value || 1));
      arr[idx].qty = val; writeCart(arr); renderCart(); updateCartBadge();
    });
  });

  // Eventos quitar
  tbody.querySelectorAll(".rmItem").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const idx = Number(btn.dataset.idx);
      const arr = readCart();
      arr.splice(idx,1);
      writeCart(arr);
      renderCart();
      updateCartBadge();
    });
  });
}

function doPay() {
  const items = readCart();
  if (!items.length) { alert("Tu carrito está vacío."); return; }
  const user = readUser() || { name: "Cliente", email: "kais17200@gmail.com", phone: "" };

  // 1) Enviar mail al vendedor
  mailtoSeller({customer: user, items});

  // 2) Limpiar carrito manteniendo maqueta
  clearCart(); updateCartBadge(); renderCart();

  // 3) Aviso + volver a catálogo
  setTimeout(()=> {
    alert("¡Gracias! Tu pedido fue preparado en tu correo. El carrito se limpió.");
    window.location.href = "catalogo.html";
  }, 300);
}

document.addEventListener("DOMContentLoaded", ()=>{
  renderCart();
  const payBtn = document.getElementById("btnPay");
  if (payBtn) payBtn.addEventListener("click", doPay);
});
