// BUILD: Filtros (Búsqueda, Categoría, Género) + Paginación
const PAGE_SIZE = 12;
let currentPage = 1;
let lastItems = [];

/* Preferimos estas categorías para tienda escolar */
const PREFERRED_CATEGORIES = ["Uniformes", "Calzado escolar", "Accesorios"];

/* Llenar el selector de categorías (unión de preferidas + las que existan en PRODUCTS) */
function buildCategoryOptions(){
  const cats = new Set(PREFERRED_CATEGORIES);
  PRODUCTS.forEach(p => cats.add(p.categoria));
  const sel = document.getElementById('fCat');
  if(!sel) return;
  sel.innerHTML = '<option value="">Todas</option>';
  [...cats]
    .filter(Boolean)
    .sort((a,b)=> (PREFERRED_CATEGORIES.indexOf(a) - PREFERRED_CATEGORIES.indexOf(b)) || a.localeCompare(b))
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
}

/* Aplicar filtros */
function applyFilters(){
  const q   = (document.getElementById('fQuery')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('fCat')?.value || '';
  const gen = document.getElementById('fGen')?.value || '';

  const items = PRODUCTS.filter(p => {
    const byName = !q   || p.nombre.toLowerCase().includes(q);
    const byCat  = !cat || p.categoria === cat;
    const byGen  = !gen || p.genero === gen;
    return byName && byCat && byGen;
  });
  return items;
}

/* Utilidad para obtener el slice de la página actual */
function slicePage(items){
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end   = start + PAGE_SIZE;
  return { pageItems: items.slice(start, end), totalPages };
}

/* Render de cards + acciones */
function render(items){
  const grid = document.getElementById('grid');
  if(!grid) return;

  if(items.length === 0){
    grid.innerHTML = `<div class="small">No hay resultados con esos filtros.</div>`;
    renderPager(0, 1);
    return;
  }

  const { pageItems, totalPages } = slicePage(items);
  grid.innerHTML = pageItems.map(p=>`
    <article class="card">
      <div class="media"><img src="${p.imagenes[0]}" alt="${p.nombre}"/></div>
      <div class="body">
        <h3>${p.nombre}</h3>
        <div class="small" style="color:var(--muted)">${p.categoria} · ${p.genero}</div>
        <div class="price">${fmtCOP(p.precio)}</div>
        <div class="actions">
          <a class="btn" href="detalle.html?id=${p.id}">Ver detalle</a>
          <button class="btn secondary" data-id="${p.id}">Añadir</button>
        </div>
      </div>
    </article>
  `).join('');

  // Añadir al carrito
  grid.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id   = Number(btn.dataset.id);
      const prod = getProductById(id);
      const items = readCart();
      const existing = items.find(i=>i.id===id && i.size===prod.tallas[0]);
      if(existing){ existing.qty += 1; }
      else { items.push({id, size: prod.tallas[0], qty: 1}); }
      writeCart(items);
    });
  });

  renderPager(items.length, totalPages);
}

/* Render del paginador */
function renderPager(totalItems, totalPages){
  const pager = document.getElementById('pager');
  if(!pager) return;
  if(totalItems === 0){ pager.innerHTML = ''; return; }

  const button = (label, page, disabled=false, active=false)=>{
    const cls = ['btn', active ? '' : 'secondary'].filter(Boolean).join(' ');
    return `<button class="${cls}" data-page="${page}" ${disabled?'disabled':''} style="padding:8px 12px">${label}</button>`;
  };

  let html = '';
  html += button('« Anterior', currentPage-1, currentPage===1);
  // Números (máx. 7 visibles centrados)
  const range = (from,to)=>Array.from({length:to-from+1},(_,i)=>from+i);
  let start = Math.max(1, currentPage-3);
  let end   = Math.min(totalPages, currentPage+3);
  if(currentPage <= 3) end = Math.min(totalPages, 7);
  if(currentPage >= totalPages-2) start = Math.max(1, totalPages-6);
  range(start, end).forEach(p=>{
    html += button(String(p), p, false, p===currentPage);
  });
  html += button('Siguiente »', currentPage+1, currentPage===totalPages);

  pager.innerHTML = html;

  pager.querySelectorAll('button[data-page]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const page = Number(b.dataset.page);
      if(!page || page===currentPage) return;
      currentPage = page;
      render(lastItems);
      updateResultsMeta(lastItems);
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
}

/* Meta resultados */
function updateResultsMeta(items){
  const meta = document.getElementById('resultsMeta');
  const { totalPages } = slicePage(items);
  if(meta) meta.textContent = `${items.length} resultado(s) · página ${currentPage} de ${totalPages}`;
}

/* Eventos de filtros */
function attachFilterEvents(){
  const onChange = ()=>{
    currentPage = 1; // reset de página
    lastItems = applyFilters();
    render(lastItems);
    updateResultsMeta(lastItems);
  };
  ['fQuery','fCat','fGen'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', onChange);
    el.addEventListener('change', onChange);
  });
  const clear = document.getElementById('fClear');
  if(clear){
    clear.addEventListener('click', ()=>{
      currentPage = 1;
      document.getElementById('fQuery').value = '';
      document.getElementById('fCat').value   = '';
      document.getElementById('fGen').value   = '';
      lastItems = applyFilters();
      render(lastItems);
      updateResultsMeta(lastItems);
    });
  }
}

/* Boot */
document.addEventListener('DOMContentLoaded', ()=>{
  buildCategoryOptions();
  lastItems = applyFilters();
  render(lastItems);
  updateResultsMeta(lastItems);
  attachFilterEvents();
});
