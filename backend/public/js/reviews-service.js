// Servicio de Reseñas (Reviews)
class ReviewsService {
  constructor() {
    this.baseURL = '/api/reviews';
    this.token = localStorage.getItem('token');
  }

  // Obtener el token de autenticación
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Obtener reseñas aprobadas (público)
  async getApprovedReviews(limit = 10, offset = 0) {
    try {
      const response = await fetch(`${this.baseURL}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      throw error;
    }
  }

  // Crear nueva reseña (requiere autenticación)
  async createReview(appointmentId, rating, comment) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          appointmentId,
          rating,
          comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creando reseña');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creando reseña:', error);
      throw error;
    }
  }

  // Obtener reseñas del usuario autenticado
  async getUserReviews() {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo reseñas del usuario:', error);
      throw error;
    }
  }

  // Obtener turnos completados que puede reseñar
  async getCompletedAppointmentsForReview() {
    try {
      const response = await fetch(`${this.baseURL}/appointments`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo turnos para reseñar:', error);
      throw error;
    }
  }

  // Actualizar reseña
  async updateReview(reviewId, rating, comment) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          rating,
          comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error actualizando reseña');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error actualizando reseña:', error);
      throw error;
    }
  }

  // Eliminar reseña
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error eliminando reseña');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      throw error;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Actualizar token (cuando el usuario hace login/logout)
  updateToken() {
    this.token = localStorage.getItem('token');
  }
}

// Crear instancia global
window.reviewsService = new ReviewsService(); 