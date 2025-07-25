// Administración de reseñas
class AdminReviewsManager {
  constructor() {
    this.reviewsService = window.reviewsService;
    this.reviews = [];
    this.currentReview = null;
    this.reviewModal = null;
  }

  // Inicializar
  async init() {
    // Verificar que el usuario es admin
    if (!this.reviewsService || !this.reviewsService.isAdmin()) {
      alert('Acceso denegado. Se requieren permisos de administrador.');
      window.location.href = '/';
      return;
    }

    this.reviewModal = new bootstrap.Modal(document.getElementById('reviewDetailModal'));
    
    // Cargar estadísticas y reseñas
    await this.loadStats();
    await this.loadReviews();
    
    // Configurar eventos
    this.setupEventListeners();
  }

  // Configurar eventos
  setupEventListeners() {
    // Filtros
    document.getElementById('statusFilter').addEventListener('change', () => this.loadReviews());
    document.getElementById('sortFilter').addEventListener('change', () => this.loadReviews());
    
    // Búsqueda
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.loadReviews();
      }
    });
  }

  // Cargar estadísticas
  async loadStats() {
    try {
      const stats = await this.reviewsService.getReviewStats();
      
      if (stats) {
        document.getElementById('totalReviews').textContent = stats.total_reviews || 0;
        document.getElementById('avgRating').textContent = (stats.average_rating || 0).toFixed(1);
        document.getElementById('fiveStarCount').textContent = stats.five_star_count || 0;
        document.getElementById('pendingReviews').textContent = stats.pending_reviews || 0;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  // Cargar reseñas
  async loadReviews() {
    try {
      const statusFilter = document.getElementById('statusFilter').value;
      const sortFilter = document.getElementById('sortFilter').value;
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();

      let reviews = [];

      // Obtener reseñas según el filtro
      if (statusFilter === 'pending') {
        reviews = await this.reviewsService.getPendingReviews();
      } else {
        reviews = await this.reviewsService.getAllReviews(100);
      }

      // Filtrar por búsqueda
      if (searchTerm) {
        reviews = reviews.filter(review => 
          review.user_name.toLowerCase().includes(searchTerm) ||
          (review.comment && review.comment.toLowerCase().includes(searchTerm))
        );
      }

      // Ordenar
      reviews = this.sortReviews(reviews, sortFilter);

      this.reviews = reviews;
      this.renderReviews();

    } catch (error) {
      console.error('Error cargando reseñas:', error);
      this.showError('Error al cargar las reseñas');
    }
  }

  // Ordenar reseñas
  sortReviews(reviews, sortBy) {
    switch (sortBy) {
      case 'oldest':
        return reviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'rating':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'newest':
      default:
        return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }

  // Renderizar reseñas
  renderReviews() {
    const container = document.getElementById('reviewsContainer');
    
    if (this.reviews.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No se encontraron reseñas</p>
        </div>
      `;
      return;
    }

    const reviewsHTML = this.reviews.map(review => this.createReviewCard(review)).join('');
    container.innerHTML = reviewsHTML;
  }

  // Crear tarjeta de reseña
  createReviewCard(review) {
    const stars = this.reviewsService.generateStars(review.rating);
    const formattedDate = this.reviewsService.formatDate(review.created_at);
    const statusBadge = this.getStatusBadge(review.is_approved);
    
    return `
      <div class="card bg-dark border-secondary mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-2">
              <div class="text-center">
                <div class="h4 text-warning mb-1">${review.rating}/5</div>
                <div class="text-warning">${stars}</div>
              </div>
            </div>
            <div class="col-md-4">
              <h6 class="mb-1">${review.user_name}</h6>
              <small class="text-muted">${review.user_email}</small>
              <br>
              <small class="text-muted">${review.service_type} - ${formattedDate}</small>
            </div>
            <div class="col-md-4">
              <p class="mb-1">${review.comment || '<em class="text-muted">Sin comentario</em>'}</p>
              ${statusBadge}
            </div>
            <div class="col-md-2">
              <button class="btn btn-sm btn-outline-info mb-1 w-100" onclick="adminReviewsManager.viewReview(${review.id})">
                <i class="fas fa-eye me-1"></i> Ver
              </button>
              ${this.getActionButtons(review)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Obtener badge de estado
  getStatusBadge(isApproved) {
    if (isApproved === null) {
      return '<span class="badge bg-warning">Pendiente</span>';
    } else if (isApproved) {
      return '<span class="badge bg-success">Aprobada</span>';
    } else {
      return '<span class="badge bg-danger">Rechazada</span>';
    }
  }

  // Obtener botones de acción
  getActionButtons(review) {
    if (review.is_approved === null) {
      return `
        <button class="btn btn-sm btn-success mb-1 w-100" onclick="adminReviewsManager.approveReview(${review.id})">
          <i class="fas fa-check me-1"></i> Aprobar
        </button>
        <button class="btn btn-sm btn-danger w-100" onclick="adminReviewsManager.rejectReview(${review.id})">
          <i class="fas fa-times me-1"></i> Rechazar
        </button>
      `;
    } else if (review.is_approved) {
      return `
        <button class="btn btn-sm btn-danger w-100" onclick="adminReviewsManager.rejectReview(${review.id})">
          <i class="fas fa-times me-1"></i> Rechazar
        </button>
      `;
    } else {
      return `
        <button class="btn btn-sm btn-success w-100" onclick="adminReviewsManager.approveReview(${review.id})">
          <i class="fas fa-check me-1"></i> Aprobar
        </button>
      `;
    }
  }

  // Ver reseña detallada
  async viewReview(reviewId) {
    try {
      const review = this.reviews.find(r => r.id === reviewId);
      if (!review) return;

      this.currentReview = review;
      
      const stars = this.reviewsService.generateStars(review.rating);
      const formattedDate = this.reviewsService.formatDate(review.created_at);
      
      const content = `
        <div class="row">
          <div class="col-md-6">
            <h6>Información del Usuario</h6>
            <p><strong>Nombre:</strong> ${review.user_name}</p>
            <p><strong>Email:</strong> ${review.user_email}</p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
          </div>
          <div class="col-md-6">
            <h6>Información del Servicio</h6>
            <p><strong>Tipo:</strong> ${review.service_type}</p>
            <p><strong>Fecha del turno:</strong> ${review.appointment_date}</p>
            <p><strong>Hora:</strong> ${review.appointment_time}</p>
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-12">
            <h6>Calificación</h6>
            <div class="h3 text-warning mb-2">${review.rating}/5</div>
            <div class="text-warning h4 mb-3">${stars}</div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <h6>Comentario</h6>
            <div class="p-3 bg-secondary rounded">
              ${review.comment || '<em class="text-muted">Sin comentario</em>'}
            </div>
          </div>
        </div>
      `;
      
      document.getElementById('reviewDetailContent').innerHTML = content;
      
      // Configurar botones de acción
      const actions = this.getModalActionButtons(review);
      document.getElementById('reviewDetailActions').innerHTML = actions;
      
      this.reviewModal.show();
      
    } catch (error) {
      console.error('Error viendo reseña:', error);
      this.showError('Error al cargar los detalles de la reseña');
    }
  }

  // Obtener botones de acción para el modal
  getModalActionButtons(review) {
    if (review.is_approved === null) {
      return `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-success" onclick="adminReviewsManager.approveReview(${review.id})">
          <i class="fas fa-check me-1"></i> Aprobar
        </button>
        <button type="button" class="btn btn-danger" onclick="adminReviewsManager.rejectReview(${review.id})">
          <i class="fas fa-times me-1"></i> Rechazar
        </button>
      `;
    } else if (review.is_approved) {
      return `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-danger" onclick="adminReviewsManager.rejectReview(${review.id})">
          <i class="fas fa-times me-1"></i> Rechazar
        </button>
      `;
    } else {
      return `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-success" onclick="adminReviewsManager.approveReview(${review.id})">
          <i class="fas fa-check me-1"></i> Aprobar
        </button>
      `;
    }
  }

  // Aprobar reseña
  async approveReview(reviewId) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta reseña?')) {
      return;
    }

    try {
      const result = await this.reviewsService.updateReviewStatus(reviewId, true);
      
      if (result.success) {
        this.showSuccess('Reseña aprobada correctamente');
        this.reviewModal.hide();
        await this.loadStats();
        await this.loadReviews();
      } else {
        this.showError('Error al aprobar la reseña: ' + result.message);
      }
    } catch (error) {
      console.error('Error aprobando reseña:', error);
      this.showError('Error al aprobar la reseña');
    }
  }

  // Rechazar reseña
  async rejectReview(reviewId) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta reseña?')) {
      return;
    }

    try {
      const result = await this.reviewsService.updateReviewStatus(reviewId, false);
      
      if (result.success) {
        this.showSuccess('Reseña rechazada correctamente');
        this.reviewModal.hide();
        await this.loadStats();
        await this.loadReviews();
      } else {
        this.showError('Error al rechazar la reseña: ' + result.message);
      }
    } catch (error) {
      console.error('Error rechazando reseña:', error);
      this.showError('Error al rechazar la reseña');
    }
  }

  // Mostrar mensaje de éxito
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  // Mostrar mensaje de error
  showError(message) {
    this.showToast(message, 'danger');
  }

  // Mostrar toast
  showToast(message, type) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    toastContainer.innerHTML = `
      <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle me-2"></i>
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    document.body.appendChild(toastContainer);
    
    const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toast.show();
    
    toastContainer.addEventListener('hidden.bs.toast', function() {
      document.body.removeChild(toastContainer);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (window.reviewsService) {
    window.adminReviewsManager = new AdminReviewsManager();
    window.adminReviewsManager.init();
  } else {
    console.error('Servicio de reviews no disponible');
  }
});

// Función global para cargar reseñas
function loadReviews() {
  if (window.adminReviewsManager) {
    window.adminReviewsManager.loadReviews();
  }
} 