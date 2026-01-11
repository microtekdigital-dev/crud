const api = "https://crud-t5dd.onrender.com";

// Contenedor para mensajes
const mensajeDiv = document.createElement("div");
mensajeDiv.id = "mensaje";
mensajeDiv.style.textAlign = "center";
mensajeDiv.style.margin = "10px 0";
document.body.prepend(mensajeDiv);

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo = "success") {
    mensajeDiv.textContent = texto;
    mensajeDiv.style.color = tipo === "success" ? "green" : "red";
    setTimeout(() => { mensajeDiv.textContent = ""; }, 3000);
}

// Agregar producto
document.getElementById("agregar").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = Number(document.getElementById("precio").value);

    if (!nombre) return mostrarMensaje("El nombre no puede estar vacío", "error");
    if (isNaN(precio) || precio <= 0) return mostrarMensaje("Precio inválido", "error");

    try {
        await fetch(api + "/productos/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nombre, precio})
        });
        mostrarMensaje("Producto agregado exitosamente");
        document.getElementById("nombre").value = "";
        document.getElementById("precio").value = "";
        cargar();
    } catch (error) {
        mostrarMensaje("Error al agregar producto", "error");
    }
});

// Cargar productos
async function cargar() {
    try {
        const res = await fetch(api + "/productos/");
        const datos = await res.json();

        const tbody = document.querySelector("#tabla-productos tbody");
        tbody.innerHTML = "";

        datos.forEach((p, index) => {
            const tr = document.createElement("tr");

            // Número secuencial
            const tdIndex = document.createElement("td");
            tdIndex.textContent = index + 1;

            // Nombre
            const tdNombre = document.createElement("td");
            tdNombre.textContent = p.nombre;

            // Precio
            const tdPrecio = document.createElement("td");
            tdPrecio.textContent = `$${p.precio}`;

            // Botón Editar
            const tdEditar = document.createElement("td");
            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.classList.add("btn-editar");
            btnEditar.addEventListener("click", () => abrirModalEditar(p));
            tdEditar.appendChild(btnEditar);

            // Botón Eliminar
            const tdEliminar = document.createElement("td");
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("btn-eliminar");
            btnEliminar.addEventListener("click", async () => {
                if (confirm(`Eliminar ${p.nombre}?`)) {
                    await fetch(api + `/productos/${p.id}`, { method: "DELETE" });
                    mostrarMensaje("Producto eliminado");
                    cargar();
                }
            });
            tdEliminar.appendChild(btnEliminar);

            tr.appendChild(tdIndex);
            tr.appendChild(tdNombre);
            tr.appendChild(tdPrecio);
            tr.appendChild(tdEditar);
            tr.appendChild(tdEliminar);

            tbody.appendChild(tr);
        });

    } catch (error) {
        mostrarMensaje("Error al cargar productos", "error");
    }
}

// --- MODAL DE EDICIÓN ---
const modal = document.createElement("div");
modal.id = "modalEditar";
modal.style.display = "none";
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.backgroundColor = "rgba(0,0,0,0.5)";
modal.style.justifyContent = "center";
modal.style.alignItems = "center";

const modalContent = document.createElement("div");
modalContent.style.backgroundColor = "white";
modalContent.style.padding = "20px";
modalContent.style.borderRadius = "8px";
modalContent.style.minWidth = "300px";

modal.appendChild(modalContent);
document.body.appendChild(modal);

function abrirModalEditar(producto) {
    modalContent.innerHTML = `
        <h3>Editar Producto</h3>
        <input type="text" id="editarNombre" value="${producto.nombre}" placeholder="Nombre">
        <input type="number" id="editarPrecio" value="${producto.precio}" placeholder="Precio">
        <div style="margin-top:10px; text-align:right;">
            <button id="guardarEditar" class="btn-editar">Guardar</button>
            <button id="cerrarModal" class="btn-eliminar">Cancelar</button>
        </div>
    `;
    modal.style.display = "flex";

    document.getElementById("cerrarModal").addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("guardarEditar").addEventListener("click", async () => {
        const nuevoNombre = document.getElementById("editarNombre").value.trim();
        const nuevoPrecio = Number(document.getElementById("editarPrecio").value);

        if (!nuevoNombre || isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            mostrarMensaje("Datos inválidos", "error");
            return;
        }

        await fetch(api + `/productos/${producto.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({nombre: nuevoNombre, precio: nuevoPrecio})
        });

        mostrarMensaje("Producto actualizado");
        modal.style.display = "none";
        cargar();
    });
}

// Cargar productos al inicio
cargar();
