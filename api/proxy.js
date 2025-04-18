document.getElementById("form-reserva").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const data = {};
  
    formData.forEach((value, key) => {
      data[key] = value;
    });
  
    try {
      const response = await fetch('/api/proxy', { // Apunta al proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Configurar tipo JSON
        },
        body: JSON.stringify(data),  // Enviar los datos del formulario
      });
  
      const result = await response.json(); // Obtener la respuesta del servidor proxy
  
      if (result.message === '✅ Registro exitoso') {
        alert("¡Reserva enviada correctamente!");
      } else {
        alert("Error al enviar la reserva: " + result.message);
      }
  
    } catch (error) {
      alert("Hubo un problema con la solicitud.");
      console.error(error);
    }
  });
  