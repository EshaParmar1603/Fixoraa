const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
class AuthService {
  async register({ email, password, name, phone, role = 'CUSTOMER', address, city, state, postalCode, bio, experienceYears, hourlyRate }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await hashPassword(password);
    // Create user in a transaction if role is PROVIDER to also create ProviderProfile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name,
          phone,
          role,
          address,
          city,
          state,
          postalCode
        }
      });
      if (role === 'PROVIDER') {
        await tx.providerProfile.create({
          data: {
            userId: newUser.id,
            bio: bio || 'Professional service provider',
            experienceYears: experienceYears ? parseInt(experienceYears, 10) : 1,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 25.0,
            city: city || null,
            state: state || null,
            address: address || null
          }
        });
      }
      return newUser;
    });
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { providerProfile: true }
    });
    // Generate JWT
    const token = generateToken({
      userId: fullUser.id,
      email: fullUser.email,
      role: fullUser.role
    });
    const { password: _, ...userWithoutPassword } = fullUser;
    return {
      user: userWithoutPassword,
      token
    };
  }
async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        providerProfile: {
          include: {
            services: { include: { service: true } },
            availabilities: true
          }
        }
      }
    });
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }
    if (!user.isActive) {
      const err = new Error('Your account has been deactivated. Please reach out to support.');
      err.statusCode = 403;
      throw err;
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: {
          include: {
            services: { include: { service: true } },
            availabilities: true
          }
        }
      }
    });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
async updateProfile(userId, updateData) {
    const { name, phone, avatar, address, city, state, postalCode, bio, experienceYears, hourlyRate, isAvailable } = updateData;
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          avatar,
          address,
          city,
          state,
          postalCode
        }
      });
      if (updatedUser.role === 'PROVIDER') {
        const providerData = {};
        if (bio !== undefined) providerData.bio = bio;
        if (experienceYears !== undefined) providerData.experienceYears = parseInt(experienceYears, 10);
        if (hourlyRate !== undefined) providerData.hourlyRate = parseFloat(hourlyRate);
        if (isAvailable !== undefined) providerData.isAvailable = Boolean(isAvailable);
        if (city !== undefined) providerData.city = city;
        if (state !== undefined) providerData.state = state;
        if (address !== undefined) providerData.address = address;
if (Object.keys(providerData).length > 0) {
          await tx.providerProfile.upsert({
            where: { userId },
            update: providerData,
            create: {
              userId,
              ...providerData
            }
          });
        }
      }
      return updatedUser;
    });
    return this.getProfile(user.id);
  }
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
  
     const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password does not match.');
      err.statusCode = 400;
      throw err;
    }
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });
    return { message: 'Password updated successfully' };
  }
}
module.exports = new AuthService();