/** Catálogo de productos usando las 12 imágenes SVG dentro de /img/ */
window.PRODUCTS = [
  {
    id: 1,
    nombre: "Camiseta Classic",
    precio: 59900,
    tallas: ["S","M","L","XL"],
    categoria: "Uniformes",
    genero: "Unisex",
    imagenes: ["img/p1_1.svg", "img/p1_2.svg"]
  },
  {
    id: 2,
    nombre: "Hoodie Urban",
    precio: 129900,
    tallas: ["S","M","L","XL"],
    categoria: "Uniformes",
    genero: "Unisex",
    imagenes: ["img/p2_1.svg", "img/p2_2.svg"]
  },
  {
    id: 3,
    nombre: "Jeans Slim",
    precio: 159900,
    tallas: ["28","30","32","34","36"],
    categoria: "Uniformes",
    genero: "Hombre",
    imagenes: ["img/p3_1.svg", "img/p3_2.svg"]
  },
  {
    id: 4,
    nombre: "Tenis Runner",
    precio: 199900,
    tallas: ["38","39","40","41","42","43"],
    categoria: "Calzado escolar",
    genero: "Hombre",
    imagenes: ["img/p4_1.svg", "img/p4_2.svg"]
  },
  {
    id: 5,
    nombre: "Gorra Snapback",
    precio: 49900,
    tallas: ["Única"],
    categoria: "Accesorios",
    genero: "Unisex",
    imagenes: ["img/p5_1.svg", "img/p5_2.svg"]
  },
  {
    id: 6,
    nombre: "Chaqueta Wind",
    precio: 179900,
    tallas: ["S","M","L","XL"],
    categoria: "Uniformes",
    genero: "Unisex",
    imagenes: ["img/p6_1.svg", "img/p6_2.svg"]
  }
];

/** Helper: obtener producto por ID */
window.getProductById = (id) => PRODUCTS.find(p => p.id === Number(id));
