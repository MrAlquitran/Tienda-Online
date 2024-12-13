let nProductos = 0;
let peticion = false;
let categoriaActual = null;
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const API = "https://api.escuelajs.co/api/v1/products";
const API_CATEGORIAS = "https://api.escuelajs.co/api/v1/categories";

window.onload = () => {
    document.getElementById("btn").addEventListener("click", () => {
        document.body.style.backgroundColor = "#9b9b9b";
        document.getElementById("btn").style.display = "none";
        mostrarCategorias();
    });
    document.getElementById("carrito").addEventListener("click", verCarrito);
    document.getElementById("cargarmas").addEventListener("click", () => {
        if (categoriaActual) {
            cargarProductosPorCategoria(categoriaActual);
        }
    });
    window.addEventListener('scroll', () => {
        let posicionScroll = window.scrollY;
        let alturaDocumento = document.body.offsetHeight;
        let alturaVentana = window.innerHeight;
        let zonaActivar = alturaDocumento - (alturaVentana * 0.4);
        let posicionActual = posicionScroll + alturaVentana;

        if (posicionActual >= zonaActivar && !peticion && categoriaActual) {
            cargarProductosPorCategoria(categoriaActual);
        }
    });
}

function mostrarCategorias() {
    let categoriasDiv = document.getElementById("categorias");
    categoriasDiv.innerHTML = "";

    fetch(API_CATEGORIAS, { method: "GET" })
    .then((res) => res.json())
    .then((categorias) => {
        for (let i = 0; i < Math.min(4, categorias.length); i++) {
            let categoria = categorias[i];

            let categoriaContainer = document.createElement("div");
            categoriaContainer.className = "categoria-container";

            let categoriaBtn = document.createElement("button");
            let categoriaImg = document.createElement("img");
            categoriaImg.src = categoria.image;
            categoriaBtn.textContent = categoria.name;

            categoriaBtn.onclick = () => {
                categoriaActual = categoria.id;
                nProductos = 0;
                cargarProductosPorCategoria(categoriaActual);
            };

            categoriaContainer.appendChild(categoriaImg);
            categoriaContainer.appendChild(categoriaBtn);
            categoriasDiv.appendChild(categoriaContainer);
        }
    })
    .catch((err) => console.error("error", err));
}

function cargarProductosPorCategoria(categoriaId) {
    if (!peticion) {
        peticion = true;
        fetch(API + "?categoryId=" + categoriaId, { method: "GET" })
        .then((res) => res.json())
        .then((productosRecibidos) => {
            let milista = document.getElementById("lista");

            if (nProductos === 0) {
                milista.innerHTML = "";
            }

            for (let i = nProductos; i < nProductos + 10 && i < productosRecibidos.length; i++) {
                let producto = productosRecibidos[i];
                let li = document.createElement("li");
                li.className = "producto";

                let img = document.createElement("img");
                img.src = producto.images[0];
                li.appendChild(img);

                li.innerHTML += `${producto.title} $${producto.price}`;

                let info = document.createElement("button");
                info.innerHTML = "Detalles";
                info.onclick = () => {
                    mostrarDetalleProducto(producto);
                };
                li.appendChild(info);

                let agregarCarrito = document.createElement("button");
                agregarCarrito.innerHTML = "Agregar al carrito";
                agregarCarrito.onclick = () => {
                    agregarAlCarrito(producto);
                };
                li.appendChild(agregarCarrito);

                milista.appendChild(li);
            }

            nProductos += 10;
            peticion = false;
        })
        .catch((err) => console.error("error", err))
        .finally(() => { peticion = false; });
    }
}

function mostrarDetalleProducto(producto) {
    let modal = document.getElementById("modal-detalle");
    let titulo = document.getElementById("titulo-producto");
    let descripcion = document.getElementById("descripcion-producto");
    let precio = document.getElementById("precio-producto");
    let imagen = document.getElementById("imagen-producto");
    let span = document.getElementsByClassName("close")[0];

    titulo.innerHTML = producto.title;
    descripcion.innerHTML = producto.description;
    precio.innerHTML = `$${producto.price}`;
    imagen.src = producto.images[0];

    modal.style.display = "block";

    span.onclick = function() {
        modal.style.display = "none";
    };
}

function verCarrito() {
    fetch(API, { method: "GET" })
        .then((res) => res.json())
        .then((productosRecibidos) => {
            let carritoModal = document.getElementById("modalCarrito");
            let listaCarrito = document.getElementById("lista-carrito");
            let totalCarrito = document.getElementById("total-carrito");
            let span = document.getElementsByClassName("closeCarrito")[0];

            carrito = JSON.parse(localStorage.getItem("carrito")) || [];

            listaCarrito.innerHTML = "";
            totalCarrito.innerHTML = "Total: $0";

            carrito.forEach(item => {
                let div = document.createElement("div");
                div.classList.add("carrito-item");
                div.innerHTML = `
                    <img src="${item.images[0]}" alt="${item.title}" class="carrito-item-imagen">
                    <div class="carrito-item-detalle">
                        <h3>${item.title}</h3>
                        <p>Cantidad: ${item.cantidad}</p>
                        <p>Precio: $${item.price}</p>
                        <p>Subtotal: $${item.price * item.cantidad}</p>
                    </div>
                `;
                listaCarrito.appendChild(div);
            });

            let total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0);
            totalCarrito.innerHTML = `<strong>Total:</strong> $${total}`;

            carritoModal.style.display = "block";

            span.onclick = function () {
                carritoModal.style.display = "none";
            };

            window.onclick = function (event) {
                if (event.target === carritoModal) {
                    carritoModal.style.display = "none";
                }
            };
        });
}

function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(objeto => objeto.id === producto.id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarNotificacion(`${producto.title} ha sido agregado al carrito.`);
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById("notificacion");
    notificacion.innerHTML = mensaje;
    notificacion.classList.add("mostrar");

    setTimeout(() => {
        notificacion.classList.remove("mostrar");
        notificacion.classList.add("ocultar");

        setTimeout(() => {
            notificacion.classList.remove("ocultar");
        }, 300);
    }, 2000);
}
