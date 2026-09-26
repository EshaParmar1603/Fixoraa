const authService = require('../services/authService');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return createdResponse(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res) => {
  // Clear any cookies if set
  res.clearCookie('token');
  return successResponse(res, null, 'Logged out successfully');
};
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword
};