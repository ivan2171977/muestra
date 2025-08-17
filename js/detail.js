
document.addEventListener('DOMContentLoaded', ()=>{
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const prod = getProductById(id);
  const mount = document.getElementById('detail');

  if(!prod){
    mount.innerHTML = `<p class="small error">Producto no encontrado.</p>`;
    return;
  }

  // Gallery UI
  const mainImg = prod.imagenes[0];
  mount.innerHTML = `
    <div class="gallery">
      <div class="main"><img id="mainImg" src="${mainImg}" alt="${prod.nombre}" style="width:100%;height:100%;object-fit:cover"/></div>
      <div class="thumbs">
        ${prod.imagenes.map(src => `<img data-src="${src}" src="${src}" alt="thumb"/>`).join('')}
      </div>
    </div>
    <div>
      <h2 style="margin:0 0 6px;color:var(--primary)">${prod.nombre}</h2>
      <div class="price">${fmtCOP(prod.precio)}</div>

      <div style="margin-top:10px">
        <div style="font-weight:600;margin-bottom:6px">Tallas</div>
        <div id="sizes" class="sizes">
          ${prod.tallas.map((t,i)=>`<div class="sizechip ${i===0?'active':''}" data-size="${t}">${t}</div>`).join('')}
        </div>
      </div>

      <div class="qtyrow">
        <label for="qty">Cantidad</label>
        <input id="qty" class="input" type="number" min="1" step="1" value="1" inputmode="numeric" pattern="[0-9]*"/>
      </div>

      <div style="display:flex;gap:10px;margin-top:16px">
        <button id="addBtn" class="btn">Añadir al carrito</button>
        <a class="btn secondary" href="index.html">Volver</a>
      </div>

      <p id="detailMsg" class="small"></p>
    </div>
  `;

  // Thumbs click
  const mainEl = document.getElementById('mainImg');
  mount.querySelectorAll('.thumbs img').forEach(img=>{
    img.addEventListener('click', ()=>{
      mainEl.src = img.dataset.src;
    });
  });

  // Size selection
  let currentSize = prod.tallas[0];
  const sizes = document.getElementById('sizes');
  sizes.addEventListener('click', (e)=>{
    const chip = e.target.closest('.sizechip');
    if(!chip) return;
    sizes.querySelectorAll('.sizechip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    currentSize = chip.dataset.size;
  });

  // Add to cart
  const qty = document.getElementById('qty');
  document.getElementById('addBtn').addEventListener('click', ()=>{
    const n = Math.max(1, parseInt(qty.value || '1', 10));
    const items = readCart();
    const existing = items.find(i=>i.id===prod.id && i.size===currentSize);
    if(existing){ existing.qty += n; } else { items.push({id: prod.id, size: currentSize, qty: n}); }
    writeCart(items);
    const msg = document.getElementById('detailMsg');
    msg.textContent = 'Producto añadido al carrito.';
    msg.className = 'small success';
  });
});
