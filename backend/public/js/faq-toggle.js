// js/faq-toggle.js

document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll('.faq-item h3');

  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.parentElement;
      
      // Cerrar otros items abiertos (opcional - comportamiento acordeón)
      const otherOpenItems = document.querySelectorAll('.faq-item.open');
      otherOpenItems.forEach(openItem => {
        if (openItem !== parent) {
          openItem.classList.remove('open');
        }
      });
      
      // Toggle del item actual
      parent.classList.toggle('open');
      
      // Añadir efecto de scroll suave si el item se abre
      if (parent.classList.contains('open')) {
        setTimeout(() => {
          parent.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }, 300);
      }
    });
  });
});
