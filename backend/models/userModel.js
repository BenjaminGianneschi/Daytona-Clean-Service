const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

// Registrar usuario
async function registerUser({ name, email, phone, password }) {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const result = await query(
    'INSERT INTO users (name, email, phone, password, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
    [name, email, phone, passwordHash]
  );
  return result[0].id;
}

// Buscar usuario por email
async function findUserByEmail(email) {
  const users = await query(
    'SELECT id, name, email, phone, password FROM users WHERE email = $1',
    [email]
  );
  return users[0];
}

// Buscar usuario por teléfono
async function findUserByPhone(phone) {
  const users = await query(
    'SELECT id, name, email, phone FROM users WHERE phone = $1',
    [phone]
  );
  return users[0];
}

// Validar login
async function validateLogin(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return null;
  return user;
}

// Obtener historial de turnos del usuario
async function getUserAppointments(userId) {
  const appointments = await query(
    'SELECT * FROM appointments WHERE user_id = $1 ORDER BY appointment_date DESC, start_time DESC',
    [userId]
  );
  return appointments;
}

module.exports = {
  registerUser,
  findUserByEmail,
  findUserByPhone,
  validateLogin,
  getUserAppointments
}; 