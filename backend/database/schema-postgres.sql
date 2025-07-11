-- Esquema de base de datos para PostgreSQL (Render)
-- Convertido desde MySQL para Daytona Clean Service

-- Definir tipos ENUM en PostgreSQL
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role admin_role DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de turnos
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES admins(id),
    service_type VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 120, -- duración en minutos
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER DEFAULT 120, -- duración en minutos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales

-- Insertar administrador por defecto (password: admin123)
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@daytona.com.ar', '$2a$10$E2HQ9WEDT3N.Mb3W20wphuB9BkO07XZVImbZtdNI3dPOtVsg/mvvK', 'Administrador Principal', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Insertar servicios por defecto
INSERT INTO services (name, description, price, duration) VALUES
('Limpieza Interior Completa', 'Limpieza completa del interior del vehículo incluyendo asientos, alfombras, tablero y consola', 15000.00, 120),
('Limpieza Exterior Completa', 'Lavado exterior completo incluyendo encerado y secado', 8000.00, 60),
('Limpieza de Motor', 'Limpieza del compartimento del motor', 12000.00, 90),
('Limpieza de Tapizados', 'Limpieza profunda de asientos y tapizados', 20000.00, 150),
('Limpieza de Alfombras', 'Limpieza profunda de alfombras del vehículo', 10000.00, 90),
('Limpieza Completa (Interior + Exterior)', 'Servicio completo de limpieza interior y exterior', 22000.00, 180),
('Limpieza de Colchones', 'Limpieza profunda de colchones con vapor', 25000.00, 120),
('Limpieza de Sillones', 'Limpieza profunda de sillones y muebles', 30000.00, 150)
ON CONFLICT DO NOTHING;

-- Insertar configuración por defecto
INSERT INTO settings (key, value, description) VALUES
('work_start_hour', '8', 'Hora de inicio de trabajo'),
('work_end_hour', '18', 'Hora de fin de trabajo'),
('work_days', '1,2,3,4,5,6', 'Días de trabajo (1=Lunes, 2=Martes, etc.)'),
('turn_duration', '120', 'Duración estándar de turnos en minutos'),
('reminder_time', '09:00', 'Hora para enviar recordatorios'),
('reminder_timezone', 'America/Argentina/Buenos_Aires', 'Zona horaria para recordatorios'),
('whatsapp_enabled', 'true', 'Habilitar notificaciones por WhatsApp'),
('max_appointments_per_day', '10', 'Máximo número de turnos por día')
ON CONFLICT DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear vista para turnos con información del usuario
CREATE OR REPLACE VIEW appointments_with_user AS
SELECT 
    a.*,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone
FROM appointments a
JOIN users u ON a.user_id = u.id;

-- Crear función para obtener turnos disponibles
CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE,
    p_duration INTEGER DEFAULT 120
)
RETURNS TABLE(
    time_slot TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    work_start TIME := '08:00';
    work_end TIME := '18:00';
    slot_interval INTEGER := 30; -- intervalos de 30 minutos
    current_slot_time TIME;
    slot_end TIME;
    conflicting_appointments INTEGER;
    start_ts TIMESTAMP;
    end_ts TIMESTAMP;
    slot_end_ts TIMESTAMP;
BEGIN
    current_slot_time := work_start;
    start_ts := make_timestamp(2000,1,1,EXTRACT(HOUR FROM current_slot_time),EXTRACT(MINUTE FROM current_slot_time),0);
    end_ts := make_timestamp(2000,1,1,EXTRACT(HOUR FROM work_end),EXTRACT(MINUTE FROM work_end),0);

    WHILE (start_ts + (p_duration || ' minutes')::INTERVAL) <= end_ts LOOP
        slot_end_ts := start_ts + (p_duration || ' minutes')::INTERVAL;
        slot_end := slot_end_ts::time;

        -- Verificar si hay turnos que se superponen
        SELECT COUNT(*) INTO conflicting_appointments
        FROM appointments
        WHERE appointment_date = p_date
        AND appointment_time < slot_end
        AND (make_timestamp(2000,1,1,EXTRACT(HOUR FROM appointment_time),EXTRACT(MINUTE FROM appointment_time),0) + (duration || ' minutes')::INTERVAL) > start_ts
        AND status IN ('pending', 'confirmed');

        RETURN QUERY SELECT current_slot_time, conflicting_appointments = 0;

        -- Avanzar al siguiente slot
        start_ts := start_ts + (slot_interval || ' minutes')::INTERVAL;
        current_slot_time := start_ts::time;
    END LOOP;
END;
$$ LANGUAGE plpgsql; 