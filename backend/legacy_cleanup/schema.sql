-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS daytona_turnos;
USE daytona_turnos;

-- Tabla de administradores
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios (sistema híbrido)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de servicios
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('vehiculos', 'tapizados') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 120,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de horarios de trabajo
CREATE TABLE work_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_of_week INT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de días bloqueados (vacaciones, feriados, etc.)
CREATE TABLE blocked_dates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    reason VARCHAR(255),
    is_full_day BOOLEAN DEFAULT TRUE,
    start_time TIME NULL,
    end_time TIME NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- Tabla de turnos
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    admin_id INT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Tabla de servicios por turno
CREATE TABLE appointment_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Tabla de ubicaciones de servicio
CREATE TABLE service_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Tabla de notificaciones
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    type ENUM('confirmation', 'reminder', 'cancellation') NOT NULL,
    sent_via ENUM('whatsapp', 'email', 'sms') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    message TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_work_schedules_day ON work_schedules(day_of_week);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);

-- Insertar datos iniciales

-- Administrador por defecto (password: admin123)
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@daytona.com.ar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'super_admin');

-- Servicios por defecto
INSERT INTO services (name, category, base_price, duration_minutes) VALUES 
-- Vehículos
('Lavado de Auto', 'vehiculos', 20000.00, 60),
('Lavado de SUV', 'vehiculos', 27000.00, 90),
('Lavado de Pickup', 'vehiculos', 25000.00, 90),
('Limpieza de Motor Básica', 'vehiculos', 12000.00, 45),
('Limpieza de Motor Completa', 'vehiculos', 15000.00, 60),
('Limpieza de Motor Detallada', 'vehiculos', 18000.00, 90),
('Tapizado de Auto', 'vehiculos', 100000.00, 120),
('Tapizado de SUV', 'vehiculos', 115000.00, 150),
('Tapizado de Pickup', 'vehiculos', 125000.00, 150),

-- Tapizados
('Sillón 1 Cuerpo', 'tapizados', 65000.00, 80),
('Sillón 2 Cuerpos', 'tapizados', 125000.00, 120),
('Sillón 3 Cuerpos', 'tapizados', 150000.00, 150),
('Silla Simple', 'tapizados', 12500.00, 30),
('Silla Gamer', 'tapizados', 12500.00, 45),
('Silla Oficina', 'tapizados', 12500.00, 40),
('Silla Comedor', 'tapizados', 12500.00, 35),
('Colchón 1 Plaza', 'tapizados', 80000.00, 90),
('Colchón 2 Plazas', 'tapizados', 120000.00, 120),
('Alfombra Chica', 'tapizados', 20000.00, 60),
('Alfombra Mediana', 'tapizados', 25000.00, 90),
('Alfombra Grande', 'tapizados', 30000.00, 120),
('Alfombra Persa', 'tapizados', 35000.00, 150),
('Puff Simple', 'tapizados', 10500.00, 30),
('Puff Grande', 'tapizados', 15000.00, 45),
('Puff Especial', 'tapizados', 20000.00, 60);

-- Horarios de trabajo por defecto (Lunes a Sábado, 8:00 a 18:00)
INSERT INTO work_schedules (day_of_week, start_time, end_time) VALUES 
(1, '08:00:00', '18:00:00'), -- Lunes
(2, '08:00:00', '18:00:00'), -- Martes
(3, '08:00:00', '18:00:00'), -- Miércoles
(4, '08:00:00', '18:00:00'), -- Jueves
(5, '08:00:00', '18:00:00'), -- Viernes
(6, '08:00:00', '18:00:00'); -- Sábado 