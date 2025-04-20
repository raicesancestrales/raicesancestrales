async function consultarReserva() {
    const id = document.getElementById("idReserva").value.trim();
    const resultado = document.getElementById("resultado");
  
    if (!id) {
      return Swal.fire("⚠️ Atención", "Debes ingresar un ID de reserva válido", "warning");
    }
  
    try {
      const res = await fetch(`/api/reserva?id=${encodeURIComponent(id)}`);
      const data = await res.json();
  
      if (!data || !data.id) {
        return Swal.fire("❌ No encontrada", "No se encontró ninguna cita con ese ID.", "error");
      }
  
      resultado.classList.remove("oculto");
      resultado.innerHTML = `
        <hr>
        <p><strong>Nombre:</strong> ${data.nombre}</p>
        <p><strong>Correo:</strong> ${data.correo}</p>
        <p><strong>Teléfono:</strong> ${data.telefono}</p>
        <p><strong>Fecha:</strong> ${data.fecha}</p>
        <p><strong>Hora:</strong> ${data.hora}</p>
        <p><strong>Estado:</strong> ${data.estado}</p>
        ${data.url_archivo ? `<p><strong>Comprobante:</strong> <a href="${data.url_archivo}" target="_blank">📎 Ver archivo</a></p>` : ""}
      `;
    } catch (err) {
      console.error(err);
      Swal.fire("⚠️ Error", "Ocurrió un error al consultar tu cita", "error");
    }
  }
  