
document.addEventListener('DOMContentLoaded', ()=>{
  const grid = document.getElementById('grid');
  if(!grid) return;
  const first = PRODUCTS.slice(0, 6);
  grid.innerHTML = first.map(p=>`
    <article class="card">
      <div class="media"><img src="${p.imagenes[0]}" alt="${p.nombre}"/></div>
      <div class="body">
        <h3>${p.nombre}</h3>
        <div class="price">${fmtCOP(p.precio)}</div>
        <div class="actions">
          <a class="btn" href="detalle.html?id=${p.id}">Ver detalle</a>
          <button class="btn secondary" data-id="${p.id}">Añadir</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.dataset.id);
      const prod = getProductById(id);
      const items = readCart();
      const existing = items.find(i=>i.id===id && i.size===prod.tallas[0]);
      if(existing){ existing.qty += 1; } else { items.push({id, size: prod.tallas[0], qty: 1}); }
      writeCart(items);
    });
  });
});
