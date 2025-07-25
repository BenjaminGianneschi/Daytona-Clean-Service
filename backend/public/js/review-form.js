// Manejo del formulario de reseñas
let selectedRating = 0;
let reviewModal = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
  
  // Configurar estrellas de rating
  setupRatingStars();
  
  // Verificar si el usuario está logueado para mostrar el botón
  checkUserLoginStatus();
});

// Configurar estrellas de rating
function setupRatingStars() {
  const stars = document.querySelectorAll('.star-rating');
  
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.dataset.rating);
      setRating(rating);
    });
    
    star.addEventListener('mouseenter', function() {
      const rating = parseInt(this.dataset.rating);
      highlightStars(rating);
    });
  });
  
  // Resetear estrellas cuando el mouse sale del contenedor
  document.querySelector('.rating-stars').addEventListener('mouseleave', function() {
    highlightStars(selectedRating);
  });
}

// Establecer rating seleccionado
function setRating(rating) {
  selectedRating = rating;
  document.getElementById('ratingValue').value = rating;
  highlightStars(rating);
}

// Resaltar estrellas según el rating
function highlightStars(rating) {
  const stars = document.querySelectorAll('.star-rating');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.style.color = '#ffd700'; // Dorado
    } else {
      star.style.color = '#6c757d'; // Gris
    }
  });
}

// Verificar estado de login del usuario
function checkUserLoginStatus() {
  if (window.reviewsService && window.reviewsService.isLoggedIn()) {
    // Mostrar botón de reseña
    document.getElementById('reviewButtonContainer').style.display = 'block';
  }
}

// Mostrar formulario de reseña
async function showReviewForm() {
  if (!window.reviewsService || !window.reviewsService.isLoggedIn()) {
    alert('Debes iniciar sesión para dejar un testimonio');
    return;
  }
  
  try {
    // Cargar turnos reseñables
    const appointments = await window.reviewsService.getReviewableAppointments();
    
    const select = document.getElementById('appointmentSelect');
    select.innerHTML = '<option value="">Selecciona un turno completado...</option>';
    
    if (appointments.length === 0) {
      select.innerHTML = '<option value="" disabled>No tienes turnos completados para reseñar</option>';
    } else {
      appointments.forEach(appointment => {
        const option = document.createElement('option');
        option.value = appointment.id;
        option.textContent = `${appointment.service_type} - ${appointment.appointment_date} ${appointment.appointment_time}`;
        select.appendChild(option);
      });
    }
    
    // Resetear formulario
    document.getElementById('reviewForm').reset();
    selectedRating = 0;
    highlightStars(0);
    
    // Mostrar modal
    reviewModal.show();
    
  } catch (error) {
    console.error('Error cargando turnos:', error);
    alert('Error al cargar los turnos. Por favor, intenta más tarde.');
  }
}

// Enviar reseña
async function submitReview() {
  const appointmentId = document.getElementById('appointmentSelect').value;
  const rating = document.getElementById('ratingValue').value;
  const comment = document.getElementById('reviewComment').value;
  
  // Validaciones
  if (!appointmentId) {
    alert('Por favor selecciona un turno');
    return;
  }
  
  if (!rating || rating < 1) {
    alert('Por favor selecciona una calificación');
    return;
  }
  
  try {
    // Deshabilitar botón durante el envío
    const submitBtn = document.querySelector('#reviewModal .btn-warning');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
    submitBtn.disabled = true;
    
    // Enviar reseña
    const result = await window.reviewsService.createReview({
      appointmentId: parseInt(appointmentId),
      rating: parseInt(rating),
      comment: comment.trim() || null
    });
    
    if (result.success) {
      // Cerrar modal
      reviewModal.hide();
      
      // Mostrar mensaje de éxito
      showSuccessMessage('¡Gracias por tu testimonio! Será revisado y publicado pronto.');
      
      // Recargar testimonios si el cargador está disponible
      if (window.testimonialsLoader) {
        window.testimonialsLoader.reload();
      }
      
    } else {
      alert('Error: ' + result.message);
    }
    
  } catch (error) {
    console.error('Error enviando reseña:', error);
    alert('Error al enviar el testimonio. Por favor, intenta más tarde.');
  } finally {
    // Restaurar botón
    const submitBtn = document.querySelector('#reviewModal .btn-warning');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
  // Crear toast de Bootstrap
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
  toastContainer.style.zIndex = '9999';
  
  toastContainer.innerHTML = `
    <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas fa-check-circle me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  document.body.appendChild(toastContainer);
  
  // Mostrar toast
  const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
  toast.show();
  
  // Remover después de que se oculte
  toastContainer.addEventListener('hidden.bs.toast', function() {
    document.body.removeChild(toastContainer);
  });
}

// Función para eliminar reseña (solo para usuarios que quieran eliminar las suyas)
async function deleteReview(reviewId) {
  if (!confirm('¿Estás seguro de que quieres eliminar tu testimonio?')) {
    return;
  }
  
  try {
    const result = await window.reviewsService.deleteReview(reviewId);
    
    if (result.success) {
      showSuccessMessage('Testimonio eliminado correctamente');
      
      // Recargar testimonios
      if (window.testimonialsLoader) {
        window.testimonialsLoader.reload();
      }
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    alert('Error al eliminar el testimonio');
  }
} 