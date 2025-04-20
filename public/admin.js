

let reservasGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
    const clave = prompt("🔐 Ingrese clave de acceso:");
    if (clave !== "tarot2025") {
      alert("Acceso denegado");
      return window.location.href = "/";
    }
  
    const tablaBody = document.getElementById("tabla-reservas-body");
  
    async function cargarReservas() {
      const res = await fetch("/api/admin/reserva");
      const reservas = await res.json();
  
      tablaBody.innerHTML = "";
      reservas.forEach(r => {
        const tr = document.createElement("tr");
  
        tr.innerHTML = `
          <td><a href="#" onclick="verDetalle('${r.id}', event)">${r.id}</a></td>
          <td>${r.nombre}</td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
          <td>${r.estado}</td>
          <td><a href="${r.url_archivo}" target="_blank">📎</a></td>
         <td>
  ${r.estado !== "confirmada" ? `<button onclick="cambiarEstado('${r.id}', 'confirmada')">✅</button>` : ""}
  ${r.estado !== "cancelada" ? `<button onclick="cambiarEstado('${r.id}', 'cancelada')">⛔</button>` : ""}
  <button onclick="eliminarReserva('${r.id}')">🗑️</button>
</td>

        `;
  
        tablaBody.appendChild(tr);
      });

      reservasGlobal = reservas;

    }
  
    window.cambiarEstado = async (id, nuevoEstado) => {
      const res = await fetch("/api/admin/reserva", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
  
      const data = await res.text();
      Swal.fire("✅ Éxito", `Reserva actualizada a "${nuevoEstado}"`, "success");
      cargarReservas();
    };
  
    window.eliminarReserva = async (id) => {
      const confirmar = confirm("¿Seguro que deseas eliminar esta reserva?");
      if (!confirmar) return;
  
      const res = await fetch("/api/admin/reserva", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
  
      const data = await res.text();
      Swal.fire("🗑️ Eliminada", data, "info");
      cargarReservas();
    };
  
    cargarReservas();
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
  