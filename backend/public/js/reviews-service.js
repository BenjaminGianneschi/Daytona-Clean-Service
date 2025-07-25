// Servicio para manejar reseñas
class ReviewsService {
  constructor() {
    this.baseURL = '/api/reviews';
    this.token = localStorage.getItem('token');
  }

  // Obtener el token de autenticación
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Obtener reseñas públicas (aprobadas)
  async getPublicReviews(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/public?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error obteniendo reseñas públicas:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error en getPublicReviews:', error);
      return [];
    }
  }

  // Obtener reseñas del usuario logueado
  async getUserReviews() {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error obteniendo reseñas del usuario:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error en getUserReviews:', error);
      return [];
    }
  }

  // Obtener turnos que el usuario puede reseñar
  async getReviewableAppointments() {
    try {
      const response = await fetch(`${this.baseURL}/user/reviewable-appointments`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error obteniendo turnos reseñables:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error en getReviewableAppointments:', error);
      return [];
    }
  }

  // Verificar si un usuario puede reseñar un turno específico
  async canReviewAppointment(appointmentId) {
    try {
      const response = await fetch(`${this.baseURL}/can-review/${appointmentId}`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data.canReview;
      } else {
        console.error('Error verificando si puede reseñar:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error en canReviewAppointment:', error);
      return false;
    }
  }

  // Crear una nueva reseña
  async createReview(reviewData) {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reviewData)
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en createReview:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Eliminar una reseña
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en deleteReview:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Obtener estadísticas (solo admin)
  async getReviewStats() {
    try {
      const response = await fetch(`${this.baseURL}/admin/stats`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error obteniendo estadísticas:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error en getReviewStats:', error);
      return null;
    }
  }

  // Obtener reseñas pendientes (solo admin)
  async getPendingReviews() {
    try {
      const response = await fetch(`${this.baseURL}/admin/pending`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        console.error('Error obteniendo reseñas pendientes:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error en getPendingReviews:', error);
      return [];
    }
  }

  // Aprobar o rechazar una reseña (solo admin)
  async updateReviewStatus(reviewId, isApproved) {
    try {
      const response = await fetch(`${this.baseURL}/admin/${reviewId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isApproved })
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error en updateReviewStatus:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Generar estrellas HTML
  generateStars(rating) {
    const fullStars = '★';
    const emptyStars = '☆';
    return fullStars.repeat(rating) + emptyStars.repeat(5 - rating);
  }

  // Verificar si el usuario está logueado
  isLoggedIn() {
    return !!this.token;
  }

  // Verificar si el usuario es admin
  isAdmin() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'admin';
    } catch (error) {
      return false;
    }
  }
}

// Instancia global del servicio
window.reviewsService = new ReviewsService(); 