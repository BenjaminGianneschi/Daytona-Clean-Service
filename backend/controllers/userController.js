const userModel = require('../models/userModel');

// Registrar usuario
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }
    // Verificar si el email ya existe
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    // Verificar si el teléfono ya existe
    const existingPhone = await userModel.findUserByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'El teléfono ya está registrado' });
    }
    // Registrar usuario
    const userId = await userModel.registerUser({ name, email, phone, password });
    res.json({ success: true, message: 'Usuario registrado exitosamente', userId });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }
    const user = await userModel.validateLogin(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }
    // Crear sesión simple (en producción usar JWT)
    req.session.userId = user.id;
    req.session.userName = user.name;
    res.json({ success: true, message: 'Login exitoso', user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener historial de turnos del usuario
const getAppointments = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const appointments = await userModel.getUserAppointments(userId);
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error obteniendo historial de turnos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login,
  getAppointments
}; 