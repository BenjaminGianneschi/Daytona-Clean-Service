// js/whatsapp-float.js
const a = document.createElement('a');
a.href = "https://wa.me/5493482588383?text=Hola%20Daytona%2C%20quiero%20hacer%20una%20consulta";
a.target = "_blank";
a.className = "whatsapp-float";
a.setAttribute("aria-label", "WhatsApp");

const icon = document.createElement('i');
icon.className = "fab fa-whatsapp";
a.appendChild(icon);

document.body.appendChild(a);
