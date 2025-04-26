document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("buscar").addEventListener("click", async () => {
      const id = document.getElementById("idBusqueda").value.trim();
  
      if (!id) return Swal.fire("⚠️", "Ingresa un ID válido", "warning");
  
      try {
        const res = await fetch(`/api/reserva?id=${id}`);
        const data = await res.json();
  
        if (!data || !data.idreserva || !data.estado) {
          return Swal.fire("❌", "Reserva no encontrada o no válida", "error");
        }
  
        if (data.estado.trim().toLowerCase() === "confirmada") {
          return document.getElementById("modal-info").classList.remove("oculto");
        }
  
        // Rellenar formulario
        document.getElementById("form-modificar").classList.remove("oculto");
        document.getElementById("idReserva").value = data.idreserva;
        document.getElementById("nombre").value = data.nombre;
        document.getElementById("nacimiento").value = data.nacimiento;
        document.getElementById("telefono").value = data.telefono;
        document.getElementById("correo").value = data.correo;
        document.getElementById("signo").value = data.signo;
        document.getElementById("fecha").value = data.fecha;
        document.getElementById("hora").value = data.hora;
  
      } catch (err) {
        console.error(err);
        Swal.fire("⚠️ Error", "No se pudo consultar la reserva", "error");
      }
    });
  
    document.getElementById("form-modificar").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const form = e.target;
      const formData = {
        id: form.idReserva.value,
        nombre: form.nombre.value,
        nacimiento: form.nacimiento.value,
        telefono: form.telefono.value,
        correo: form.correo.value,
        signo: form.signo.value,
        fecha: form.fecha.value,
        hora: form.hora.value,
      };
  
      try {
        const res = await fetch("/api/admin/reserva", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
  
        if (!res.ok) throw new Error(await res.text());
  
        Swal.fire("✅ Cambios guardados", "Tu cita fue actualizada correctamente", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("❌ Error", err.message, "error");
      }
    });
  
    document.getElementById("anular").addEventListener("click", async () => {
      const id = document.getElementById("idReserva").value;
  
      const confirmar = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esto eliminará tu cita por completo",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, anular",
      });
  
      if (!confirmar.isConfirmed) return;
  
      try {
        const res = await fetch("/api/admin/reserva", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
  
        if (!res.ok) throw new Error(await res.text());
  
        Swal.fire("🗑️ Anulada", "Tu cita ha sido anulada correctamente", "success");
        document.getElementById("form-modificar").classList.add("oculto");
      } catch (err) {
        console.error(err);
        Swal.fire("❌ Error", "No se pudo anular la cita", "error");
      }
    });
  
  });
  