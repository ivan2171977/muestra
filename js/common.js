// ===== common.js =====
const SELLER_EMAIL = "vendedor@tu-tienda.com"; // <-- cambia aquí el correo real del vendedor

// Formateo COP
window.fmtCOP = (n) => n.toLocaleString("es-CO", {style:"currency", currency:"COP", maximumFractionDigits:0});

// Cart storage
const CART_KEY = "cart_items_v1";
window.readCart  = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
window.writeCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));
window.clearCart = () => localStorage.removeItem(CART_KEY);

// User storage
const USER_KEY = "session_user_v1";
window.readUser  = () => JSON.parse(localStorage.getItem(USER_KEY) || "null");
window.writeUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
window.clearUser = () => localStorage.removeItem(USER_KEY);

// Productos deben venir desde data.js
window.getProductById = (id) => PRODUCTS.find(p => p.id === Number(id));

// Construye el cuerpo del pedido para enviar al vendedor
window.buildOrderSummary = (items) => {
  let total = 0;
  const lines = items.map((it, idx) => {
    const p = getProductById(it.id);
    const line = p.precio * it.qty;
    total += line;
    return `${idx+1}. ${p.nombre} | Talla: ${it.size ?? '-'} | Cant: ${it.qty} | Precio: ${fmtCOP(p.precio)} | Subtotal: ${fmtCOP(line)}`;
  });

  return {
    text: [
      "Nuevo pedido desde la tienda escolar",
      "",
      "Detalle de ítems:",
      ...lines,
      "",
      `Total: ${fmtCOP(total)}`,
      ""
    ].join("\n"),
    total
  };
};

// Abre mailto al vendedor con el resumen del pedido y datos del cliente
window.mailtoSeller = ({customer, items}) => {
  const {text} = buildOrderSummary(items);
  const subject = encodeURIComponent("Nuevo pedido - Tienda escolar");
  const bodyLines = [
    text,
    "Datos del cliente:",
    `Nombre: ${customer?.name || "-"}`,
    `Email: ${customer?.email || "-"}`,
    `Teléfono: ${customer?.phone || "-"}`,
    ""
  ];
  const body = encodeURIComponent(bodyLines.join("\n"));
  const href = `mailto:${SELLER_EMAIL}?subject=${subject}&body=${body}`;
  // Abrir correo del sistema
  window.location.href = href;
};

// Actualiza badge del carrito en el header
window.updateCartBadge = () => {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const qty = readCart().reduce((a,b)=>a + (b.qty||0), 0);
  el.textContent = String(qty);
};

// Renderiza el link de sesión (login/logout) en el header
window.renderAuthLink = () => {
  const link = document.getElementById("loginLink");
  if (!link) return;
  const user = readUser();
  if (user) {
    link.textContent = "Cerrar sesión";
    link.href = "#";
    // Evitar múltiples bindings
    link.onclick = (e) => {
      e.preventDefault();
      clearUser();
      alert("Sesión cerrada.");
      updateCartBadge();
      // Opcional: limpia carrito al cerrar sesión (comenta si no quieres)
      // clearCart();
      // Redirigir a inicio
      window.location.href = "index.html";
    };
  } else {
    link.textContent = "Iniciar sesión";
    link.href = "login.html";
    link.onclick = null;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderAuthLink();
});
