const api = "https://crud-vfxn.onrender.com";

// Agregar producto
document.getElementById("agregar").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const precio = Number(document.getElementById("precio").value);

    // Validaciones
    if (!nombre) {
        alert("El nombre no puede estar vacío");
        return;
    }

    if (isNaN(precio) || precio <= 0) {
        alert("El precio debe ser un número mayor que 0");
        return;
    }

    // Si pasa validaciones, enviar al backend
    await fetch(api + "/productos/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre, precio})
    });

    // Limpiar inputs
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";

    cargar();
});

// Cargar productos
async function cargar() {
    const res = await fetch(api + "/productos/");
    const datos = await res.json();

    const tbody = document.querySelector("#tabla-productos tbody");
    tbody.innerHTML = ""; // limpiar tabla

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
        btnEditar.classList.add("btn-editar"); // clase para estilo
        btnEditar.addEventListener("click", async () => {
            const nuevoNombre = prompt("Nuevo nombre:", p.nombre);
            const nuevoPrecio = Number(prompt("Nuevo precio:", p.precio));
            if (nuevoNombre && !isNaN(nuevoPrecio)) {
                await fetch(api + `/productos/${p.id}`, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({nombre: nuevoNombre, precio: nuevoPrecio})
                });
                cargar();
            }
        });
        tdEditar.appendChild(btnEditar);

        // Botón Eliminar
        const tdEliminar = document.createElement("td");
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn-eliminar"); // clase para estilo
        btnEliminar.addEventListener("click", async () => {
            await fetch(api + `/productos/${p.id}`, { method: "DELETE" });
            cargar();
        });
        tdEliminar.appendChild(btnEliminar);

        // Agregar celdas a la fila
        tr.appendChild(tdIndex);
        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdEditar);
        tr.appendChild(tdEliminar);

        tbody.appendChild(tr);
    });
}

// Cargar productos al inicio
cargar();
