const { query } = require('../config/database');

async function setupReviews() {
  try {
    console.log('🔧 Configurando sistema de reseñas...');

    // 1. Crear tabla de reseñas
    console.log('📝 Creando tabla reviews...');
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, appointment_id)
      )
    `);
    console.log('✅ Tabla reviews creada');

    // 2. Crear índices
    console.log('📊 Creando índices...');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_appointment_id ON reviews(appointment_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)');
    console.log('✅ Índices creados');

    // 3. Crear trigger para updated_at
    console.log('⚡ Creando trigger para updated_at...');
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    await query(`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at 
      BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Trigger creado');

    // 4. Crear vista para reseñas con detalles
    console.log('👁️ Creando vista reviews_with_details...');
    await query(`
      CREATE OR REPLACE VIEW reviews_with_details AS
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        a.service_type,
        a.appointment_date,
        a.appointment_time
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN appointments a ON r.appointment_id = a.id
      WHERE r.is_approved = TRUE
      ORDER BY r.created_at DESC
    `);
    console.log('✅ Vista creada');

    // 5. Crear función para verificar si un usuario puede reseñar
    console.log('🔍 Creando función can_user_review_appointment...');
    await query(`
      CREATE OR REPLACE FUNCTION can_user_review_appointment(
        p_user_id INTEGER,
        p_appointment_id INTEGER
      )
      RETURNS BOOLEAN AS $$
      DECLARE
        appointment_exists BOOLEAN;
        review_exists BOOLEAN;
      BEGIN
        -- Verificar que el turno existe y pertenece al usuario
        SELECT EXISTS(
          SELECT 1 FROM appointments 
          WHERE id = p_appointment_id 
          AND user_id = p_user_id 
          AND status = 'completed'
        ) INTO appointment_exists;
        
        -- Verificar que no existe ya una reseña para este turno
        SELECT EXISTS(
          SELECT 1 FROM reviews 
          WHERE user_id = p_user_id 
          AND appointment_id = p_appointment_id
        ) INTO review_exists;
        
        -- Retornar true solo si el turno existe, está completado y no tiene reseña
        RETURN appointment_exists AND NOT review_exists;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Función can_user_review_appointment creada');

    // 6. Crear función para estadísticas de reseñas
    console.log('📈 Creando función get_review_stats...');
    await query(`
      CREATE OR REPLACE FUNCTION get_review_stats()
      RETURNS TABLE(
        total_reviews INTEGER,
        average_rating DECIMAL(3,2),
        five_star_count INTEGER,
        four_star_count INTEGER,
        three_star_count INTEGER,
        two_star_count INTEGER,
        one_star_count INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(*)::INTEGER as total_reviews,
          ROUND(AVG(rating)::DECIMAL, 2) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END)::INTEGER as five_star_count,
          COUNT(CASE WHEN rating = 4 THEN 1 END)::INTEGER as four_star_count,
          COUNT(CASE WHEN rating = 3 THEN 1 END)::INTEGER as three_star_count,
          COUNT(CASE WHEN rating = 2 THEN 1 END)::INTEGER as two_star_count,
          COUNT(CASE WHEN rating = 1 THEN 1 END)::INTEGER as one_star_count
        FROM reviews 
        WHERE is_approved = TRUE;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Función get_review_stats creada');

    // 7. Verificar que todo funciona
    console.log('🧪 Probando funciones...');
    const stats = await query('SELECT * FROM get_review_stats()');
    console.log('✅ Estadísticas iniciales:', stats[0]);

    console.log('🎉 Sistema de reseñas configurado exitosamente!');
    console.log('');
    console.log('📋 Resumen de lo que se creó:');
    console.log('   - Tabla: reviews');
    console.log('   - Índices: 5 índices para optimizar consultas');
    console.log('   - Trigger: update_reviews_updated_at');
    console.log('   - Vista: reviews_with_details');
    console.log('   - Función: can_user_review_appointment');
    console.log('   - Función: get_review_stats');
    console.log('');
    console.log('🚀 El sistema está listo para recibir reseñas!');

  } catch (error) {
    console.error('❌ Error configurando sistema de reseñas:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupReviews()
    .then(() => {
      console.log('✅ Configuración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = setupReviews; 