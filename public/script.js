document.addEventListener("DOMContentLoaded", function () {
  const saludo = document.getElementById("saludo");
  const hora = new Date().getHours();

  let mensaje = "Hola, buenas energías para esta ";
  if (hora >= 6 && hora < 12) {
    mensaje += "mañana";
  } else if (hora >= 12 && hora < 18) {
    mensaje += "tarde";
  } else {
    mensaje += "noche";
  }

  saludo.textContent = mensaje;

  // Modal
  const modal = document.getElementById("modal");
  const btnAnular = document.getElementById("btn-anular");
  const cerrarModal = document.getElementById("cerrar-modal");
  const confirmar = document.querySelector(".confirmar");

  btnAnular.addEventListener("click", () => {
    modal.classList.remove("oculto");
  });

  cerrarModal.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  confirmar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // Redirecciones básicas
  document.getElementById("btn-reservar").onclick = () => window.location.href = "reserva.html";
  document.getElementById("btn-modificar").onclick = () => window.location.href = "modificar.html";
});
