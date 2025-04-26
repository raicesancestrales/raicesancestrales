document.addEventListener("DOMContentLoaded", function () {
 
  // 🔥 Bloquear fechas pasadas en el input de fecha
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date().toISOString().split("T")[0];
  fechaInput.setAttribute("min", hoy);
  
  const paisSelect = document.getElementById("pais");
  const metodoPeru = document.getElementById("metodo-pago-peru");
  const metodoEspana = document.getElementById("metodo-pago-espana");

  const form = document.getElementById("form-reserva");
  const modal = document.getElementById("modal-confirmacion");
  const resumen = document.getElementById("resumen");
  const cerrar = document.getElementById("cerrar-confirmacion");
  const confirmar = document.querySelector(".modal .confirmar");
  const cancelar = document.querySelector(".cancelar");
  const inputComprobante = document.getElementById("comprobante");
  const btnConfirmar = document.querySelector("button.confirmar[type='submit']");
  const checkTerminos = document.getElementById("terminos");

  const urlParams = new URLSearchParams(window.location.search);
  const fechaCita = urlParams.get("fecha") || "No seleccionada";
  const horaCita = urlParams.get("hora") || "No seleccionada";

  let idReservaGenerado = "";
  let metodoPagoSeleccionado = "";

  paisSelect.addEventListener("change", function () {
    const modalPeru = document.getElementById("modal-peru");
    const modalEspana = document.getElementById("modal-espana");

    if (this.value === "peru") {
      modalPeru.classList.remove("oculto");
    } else if (this.value === "espana") {
      modalEspana.classList.remove("oculto");
    }
  });

  document.getElementById("cerrar-peru").addEventListener("click", () => {
    document.getElementById("modal-peru").classList.add("oculto");
  });
  document.getElementById("confirmar-peru").addEventListener("click", () => {
    const seleccionado = document.querySelector('input[name="pago-peru"]:checked');
    if (!seleccionado) return alert("Selecciona un método de pago.");
    metodoPagoSeleccionado = seleccionado.value;
    document.getElementById("modal-peru").classList.add("oculto");
  });

  document.getElementById("cerrar-espana").addEventListener("click", () => {
    document.getElementById("modal-espana").classList.add("oculto");
  });
  document.getElementById("confirmar-espana").addEventListener("click", () => {
    const seleccionado = document.querySelector('input[name="pago-espana"]:checked');
    if (!seleccionado) return alert("Selecciona un método de pago.");
    metodoPagoSeleccionado = seleccionado.value;
    document.getElementById("modal-espana").classList.add("oculto");
  });

  function validarActivacionBoton() {
    btnConfirmar.disabled = !(inputComprobante.files.length > 0 && checkTerminos.checked);
  }

  inputComprobante.addEventListener("change", validarActivacionBoton);
  checkTerminos.addEventListener("change", validarActivacionBoton);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const idReserva = generarID();
    idReservaGenerado = idReserva;

    const nombre = document.getElementById("nombre").value;
    const nacimiento = document.getElementById("nacimiento").value;
    const codigo = document.getElementById("codigo-pais").value;
    const telefono = document.getElementById("telefono").value;
    const correo = document.getElementById("correo").value;
    const signo = document.getElementById("signo").value;
    const pais = paisSelect.value;
    const paisTexto = pais === "peru" ? "Perú" : "España";

    resumen.innerHTML = `
      <p><strong>ID de Reserva:</strong> ${idReserva}</p>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Fecha de nacimiento:</strong> ${nacimiento}</p>
      <p><strong>Teléfono:</strong> ${codigo} ${telefono}</p>
      <p><strong>Correo:</strong> ${correo}</p>
      <p><strong>Signo:</strong> ${signo}</p>
      <p><strong>País:</strong> ${paisTexto}</p>
      <p><strong>Fecha seleccionada:</strong> ${fechaCita}</p>
      <p><strong>Hora seleccionada:</strong> ${horaCita}</p>
      <p><strong>Método de pago:</strong> ${metodoPagoSeleccionado || "No seleccionado"}</p>
      <hr />
      <p style="color: red;"><strong>Nota:</strong> Guarda tu número de ID para futuras gestiones.</p>
    `;

    modal.classList.remove("oculto");
  });

  cerrar.addEventListener("click", () => modal.classList.add("oculto"));
  cancelar.addEventListener("click", () => modal.classList.add("oculto"));

  confirmar.addEventListener("click", () => {
    const formData = new FormData(form);
    const pais = paisSelect.value;
    const paisTexto = pais === "peru" ? "Perú" : "España";

    formData.append("idReserva", idReservaGenerado);
    formData.append("fecha", fechaCita);
    formData.append("hora", horaCita);
    formData.append("pais", paisTexto);
    formData.append("metodoPago", metodoPagoSeleccionado || "No seleccionado");

    const codigo = document.getElementById("codigo-pais").value;
    const telefono = document.getElementById("telefono").value;
    formData.append("telefono", `${codigo} ${telefono}`);

    fetch("/api/reserva", {
      method: "POST",
      body: formData
    })
    .then(async res => {
      const text = await res.text();
      if (!res.ok) throw new Error(text);
    
      Swal.fire("✅ Reserva enviada", text, "success");
      form.reset();
      modal.classList.add("oculto");
      btnConfirmar.disabled = true;
      metodoPagoSeleccionado = "";
    })
    .catch(err => {
      Swal.fire("⛔ Error", err.message, "error");
      console.error("Error al enviar la reserva:", err);
    });
  });

});

function generarID() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `RA-${timestamp}-${random}`.toUpperCase();
}

// 💥 CÓDIGO DE BLOQUEO DE HORARIOS ACTUALIZADO
document.getElementById("fecha").addEventListener("change", async function () {
  const fechaSeleccionadaValor = this.value;
  const horariosDiv = document.getElementById("horarios-nuevos");
  const contenedor = document.getElementById("seleccion-horario");

  if (!fechaSeleccionadaValor) return;

  const fechaSeleccionada = new Date(fechaSeleccionadaValor);
  const ahora = new Date();  // 👈 recalculamos justo aquí, para que esté actualizada la hora real
  
  horariosDiv.innerHTML = "";
  contenedor.classList.remove("oculto");

  const horariosDisponibles = [
    "10:00", "10:45", "11:30", "12:15", "13:00",
    "17:00", "17:45", "18:30", "19:15", "20:00", "20:45", "21:30"
  ];

  let ocupadas = [];

  try {
    const res = await fetch("/api/admin/reserva");
    const data = await res.json();

    ocupadas = data
      .filter(r => {
        const fechaBD = new Date(r.fecha).toISOString().split("T")[0];
        return (
          fechaBD === fechaSeleccionadaValor &&
          r.estado.trim().toLowerCase() !== "cancelada"
        );
      })
      .map(r => r.hora?.substring(0, 5));
  } catch (error) {
    console.error("❌ Error al cargar reservas:", error);
  }

  horariosDisponibles.forEach(hora => {
    const btn = document.createElement("button");
    btn.classList.add("horario-btn");
    btn.setAttribute("type", "button");
    btn.textContent = hora;

    const horaFecha = new Date(fechaSeleccionada);
    const [horaStr, minutoStr] = hora.split(":");
    horaFecha.setHours(parseInt(horaStr));
    horaFecha.setMinutes(parseInt(minutoStr));
    horaFecha.setSeconds(0);

    if (fechaSeleccionada.toDateString() < ahora.toDateString() ||
        (fechaSeleccionada.toDateString() === ahora.toDateString() && horaFecha.getTime() < ahora.getTime()) ||
        ocupadas.includes(hora)
    ) {
      btn.classList.add("disabled");
      btn.disabled = true;
      btn.textContent += " ⛔";
    } else {
      btn.onclick = () => {
        document.getElementById("hora").value = hora;
        contenedor.classList.add("oculto");
      };
    }

    horariosDiv.appendChild(btn);
  });
});
