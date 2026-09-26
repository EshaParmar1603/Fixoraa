const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  console.log('--- Starting Fixora Database Seed ---');
  // Clear existing data in reverse order of foreign keys
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.billWarranty.deleteMany();
  await prisma.serviceReminder.deleteMany();
  await prisma.appliance.deleteMany();
  await prisma.providerAvailability.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned up existing database records.');
  // Password hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);
  // 1. Create Users