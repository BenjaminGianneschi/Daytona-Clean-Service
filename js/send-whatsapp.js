document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("whatsapp-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();

    if (!name || !service) {
      alert("Por favor, completá tu nombre y seleccioná un servicio.");
      return;
    }

    const phone = "5493482588383"; // Tu número de WhatsApp sin espacios
    const whatsappMessage = `Hola, soy ${name}. Quisiera consultar por el servicio de *${service}*.\n\n${message}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  });
});
