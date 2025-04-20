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
          <td>${r.id}</td>
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
  