document.addEventListener("DOMContentLoaded", function () {
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

