// Footer moderno de Daytona Clean Service, sin div principal anidado
const footerHTML = `
  <div class="container" style="max-width:1100px; margin:auto; display:flex; flex-wrap:wrap; justify-content:space-between; gap:32px; padding-top:40px; color:#fff; background:#232323 !important;">
    <div style="flex:1 1 220px; min-width:220px; display:flex; flex-direction:column; align-items:flex-start;">
      <div style="font-weight:700; font-size:1.4rem; color:#fff; margin-bottom:10px;">Daytona Clean Service</div>
      <div style="font-size:0.97rem; color:#fff; margin-bottom:12px; text-align:left;">
        Tu cochera de limpieza en Reconquista.<br>Calidad, detalle y confianza para tu auto y mobiliaros.
      </div>
      <div style="display:flex; gap:12px;">
        <a href="https://www.instagram.com/daytona_clean_service" target="_blank" style="color:#fff;"><i class="fab fa-instagram"></i></a>
        <a href="https://www.facebook.com/daytona_clean_service" target="_blank" style="color:#fff;"><i class="fab fa-facebook"></i></a>
        <a href="https://wa.me/5493482588383" target="_blank" style="color:#fff;"><i class="fab fa-whatsapp"></i></a>
      </div>
    </div>
    <div style="flex:1 1 180px; min-width:180px; color:#fff;">
      <div style="font-weight:600; margin-bottom:10px; color:#fff; font-size:1.08rem;">Enlaces Rápidos</div>
      <ul style="list-style:none; padding:0; margin:0; color:#fff;">
        <li><a href="index.html#sobre-nosotros" style="color:#fff; text-decoration:none;">Sobre Nosotros</a></li>
        <li><a href="turnos.html" style="color:#fff; text-decoration:none;">Agendar Turno</a></li>
        <li><a href="index.html#contacto" style="color:#fff; text-decoration:none;">Contacto</a></li>
      </ul>
    </div>
    <div style="flex:1 1 220px; min-width:220px; color:#fff;">
      <div style="font-weight:600; margin-bottom:10px; color:#fff; font-size:1.08rem;">Contacto</div>
      <div style="font-size:0.97rem; color:#fff; margin-bottom:6px;">Reconquista, Santa Fe</div>
      <div style="font-size:0.97rem; color:#fff; margin-bottom:6px;"><i class="fab fa-whatsapp"></i> +54 9 3482 588383</div>
      <div style="font-size:0.97rem; color:#fff; margin-bottom:6px;"><i class="fas fa-envelope"></i> daytonacleanservice@gmail.com</div>
    </div>
  </div>
  <div style="border-top:1px solid #333; margin:32px auto 0 auto; max-width:1100px; padding:16px 0 8px 0; text-align:center; color:#fff; font-size:0.98rem; background:#232323 !important;">
    © 2025 Daytona Clean Service. Todos los derechos reservados.
  </div>
`;

const footer = document.querySelector('footer');
if (footer) {
  footer.style.background = '#232323';
  footer.style.color = '#fff';
  footer.style.borderTop = '1.5px solid #232323';
  footer.innerHTML = footerHTML;
} 