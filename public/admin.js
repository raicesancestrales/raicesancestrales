let reservasGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
  const clave = prompt("🔐 Ingrese clave de acceso:");
  const acceso = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clave }),
  });

  const data = await acceso.json();
  if (!data.acceso) {
    alert("Acceso denegado");
    return window.location.href = "/";
  }

  const tablaBody = document.getElementById("tabla-reservas-body");
  const filtroEstado = document.getElementById("filtro-estado");

  async function cargarReservas() {
    const res = await fetch("/api/admin/reserva");
    const reservas = await res.json();

    const ultimoID = localStorage.getItem("ultimoID");
    const nuevoID = reservas[0]?.id;

    if (nuevoID && nuevoID !== ultimoID) {
      if (ultimoID) {
        document.getElementById("alerta-sonido").play();
        Swal.fire("📥 Nueva reserva recibida", `ID: ${nuevoID}`, "info");
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      localStorage.setItem("ultimoID", nuevoID);
    }

    reservasGlobal = reservas;
    mostrarReservasFiltradas();
  }

  function mostrarReservasFiltradas() {
    const estadoSeleccionado = filtroEstado.value;
    const filtradas = reservasGlobal.filter(r => {
      if (estadoSeleccionado === "todos") return true;
      return r.estado?.toLowerCase() === estadoSeleccionado;
    });

    tablaBody.innerHTML = "";
    filtradas.forEach(r => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><a href="#" onclick="verDetalle('${r.id}', event)">${r.id}</a></td>
        <td>${r.nombre}</td>
        <td>${r.fecha}</td>
        <td>${r.hora}</td>
        <td>${r.estado}</td>
        <td><a href="${r.url_archivo}" target="_blank">📎</a></td>
        <td>
          ${r.estado?.toLowerCase() === "pendiente" ? `<button onclick="cambiarEstado('${r.id}', 'confirmada')">✅ Confirmar</button>` : ""}
          ${r.estado?.toLowerCase() === "confirmada" ? `<button onclick="redirigirModificacion('${r.id}')">✏️</button>` : ""}
          ${r.estado?.toLowerCase() !== "cancelada" ? `<button onclick="cambiarEstado('${r.id}', 'cancelada')">⛔</button>` : ""}
          <button onclick="eliminarReserva('${r.id}')">🗑️</button>
        </td>
      `;

      tablaBody.appendChild(tr);
    });
  }

  filtroEstado.addEventListener("change", mostrarReservasFiltradas);

  window.cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch("/api/admin/reserva", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });

      const data = await res.text();
      Swal.fire("✅ Éxito", `Reserva actualizada a "${nuevoEstado}"`, "success");
      cargarReservas();
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      Swal.fire("❌ Error", "No se pudo cambiar el estado", "error");
    }
  };

  window.eliminarReserva = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar esta reserva?");
    if (!confirmar) return;

    try {
      const res = await fetch("/api/admin/reserva", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await res.text();
      Swal.fire("🗑️ Eliminada", data, "info");
      cargarReservas();
    } catch (err) {
      console.error("❌ Error al eliminar reserva:", err);
      Swal.fire("❌ Error", "No se pudo eliminar la reserva", "error");
    }
  };

  document.getElementById("btn-refrescar").addEventListener("click", cargarReservas);

  cargarReservas();
  setInterval(cargarReservas, 30000); // Actualización automática cada 30s
});

window.verDetalle = (id, e) => {
  e.preventDefault();
  const reserva = reservasGlobal.find(r => r.id === id);
  if (!reserva) return;

  const modal = document.getElementById("modal-detalle");
  const contenido = document.getElementById("contenido-detalle");

  contenido.innerHTML = `
    <p><strong>Nombre:</strong> ${reserva.nombre}</p>
    <p><strong>Correo:</strong> ${reserva.correo}</p>
    <p><strong>Teléfono:</strong> ${reserva.telefono}</p>
    <p><strong>Signo:</strong> ${reserva.signo}</p>
    <p><strong>País:</strong> ${reserva.pais}</p>
    <p><strong>Fecha:</strong> ${reserva.fecha}</p>
    <p><strong>Hora:</strong> ${reserva.hora}</p>
    <p><strong>Método de pago:</strong> ${reserva.metodo_pago}</p>
    <p><strong>Estado:</strong> ${reserva.estado}</p>
    ${reserva.url_archivo ? `<p><strong>Comprobante:</strong> <a href="${reserva.url_archivo}" target="_blank">📎 Ver archivo</a></p>` : ""}
  `;

  modal.classList.remove("oculto");
};

document.getElementById("cerrar-detalle").addEventListener("click", () => {
  document.getElementById("modal-detalle").classList.add("oculto");
});

window.redirigirModificacion = function(id) {
  const url = new URL("modificar.html", window.location.origin);
  url.searchParams.set("id", id);
  url.searchParams.set("admin", "true"); // Permite editar aunque esté confirmada
  window.location.href = url;
};
