// Cargador de testimonios dinámicos
class TestimonialsLoader {
  constructor() {
    this.container = null;
    this.reviewsService = window.reviewsService;
  }

  // Inicializar el cargador
  init(containerSelector = '.testimonios-section .row') {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error('Contenedor de testimonios no encontrado');
      return;
    }

    this.loadTestimonials();
  }

  // Cargar testimonios desde la API
  async loadTestimonials() {
    try {
      // Mostrar loading
      this.showLoading();

      // Obtener reseñas públicas
      const reviews = await this.reviewsService.getPublicReviews(6);

      if (reviews.length === 0) {
        this.showNoReviews();
        return;
      }

      // Renderizar testimonios
      this.renderTestimonials(reviews);

    } catch (error) {
      console.error('Error cargando testimonios:', error);
      this.showError();
    }
  }

  // Mostrar estado de carga
  showLoading() {
    this.container.innerHTML = `
      <div class="col-12 text-center">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Cargando testimonios...</span>
        </div>
        <p class="text-light mt-2">Cargando testimonios...</p>
      </div>
    `;
  }

  // Mostrar mensaje cuando no hay reseñas
  showNoReviews() {
    this.container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-info bg-dark text-light border-warning">
          <i class="fas fa-info-circle me-2"></i>
          Aún no hay testimonios publicados. ¡Sé el primero en compartir tu experiencia!
        </div>
      </div>
    `;
  }

  // Mostrar mensaje de error
  showError() {
    this.container.innerHTML = `
      <div class="col-12 text-center">
        <div class="alert alert-danger bg-dark text-light border-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error al cargar testimonios. Por favor, intenta más tarde.
        </div>
      </div>
    `;
  }

  // Renderizar testimonios
  renderTestimonials(reviews) {
    const testimonialsHTML = reviews.map(review => this.createTestimonialCard(review)).join('');
    
    this.container.innerHTML = testimonialsHTML;
  }

  // Crear tarjeta de testimonio
  createTestimonialCard(review) {
    const stars = this.reviewsService.generateStars(review.rating);
    const formattedDate = this.reviewsService.formatDate(review.created_at);
    
    // Obtener iniciales del nombre para mostrar
    const nameParts = review.user_name.split(' ');
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}. ${nameParts[nameParts.length - 1][0]}.`
      : review.user_name.substring(0, 2) + '.';

    return `
      <div class="col-md-4 mb-4">
        <div class="testimonial-elegant-card bg-dark p-4 rounded-4 h-100 text-center">
          <i class="fas fa-award" style="color: #ff3b3f; font-size: 2rem; margin-bottom: 0.5rem;"></i>
          <p class="testimonial-quote text-light mb-3">"${review.comment || 'Excelente servicio, muy recomendado.'}"</p>
          <div class="testimonial-footer" style="margin-top: auto;">
            <div class="testimonial-author text-warning fw-bold">${initials}</div>
            <div class="testimonial-stars" style="color: #ffd700; font-size: 1.2rem; margin-top: 0.2rem;">${stars}</div>
            <small class="text-muted d-block mt-1">${formattedDate}</small>
          </div>
        </div>
      </div>
    `;
  }

  // Recargar testimonios (para actualizar después de crear uno nuevo)
  reload() {
    this.loadTestimonials();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que el servicio de reviews esté disponible
  if (window.reviewsService) {
    const testimonialsLoader = new TestimonialsLoader();
    testimonialsLoader.init();
    
    // Hacer disponible globalmente
    window.testimonialsLoader = testimonialsLoader;
  } else {
    // Si el servicio no está disponible, mostrar testimonios estáticos
    console.warn('Servicio de reviews no disponible, mostrando testimonios estáticos');
  }
}); 