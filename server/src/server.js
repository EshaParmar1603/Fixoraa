const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getDb, persist } = require('./dataStore');
const { getOrCreateTracking, updateTrackingLocation, advanceSimulationStep } = require('./trackingStore');
const { optimizeSkillGraph, PROJECT_TEMPLATES, SKILL_ROLES, PROVIDER_POOL } = require('./skillGraphEngine');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'fixora_super_secret_jwt_key_2026';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket.IO] ${socket.id} joined room: ${room}`);
  });

  socket.on('technician_location_update', (data) => {
    if (data && data.bookingId) {
      const updated = updateTrackingLocation(data.bookingId, data);
      io.emit(`tracking_${data.bookingId}`, updated);
      io.emit('global_tracking_update', updated);
    }
  });

  socket.on('technician_advance_simulation', ({ bookingId }) => {
    if (bookingId) {
      const updated = advanceSimulationStep(bookingId);
      io.emit(`tracking_${bookingId}`, updated);
      io.emit('global_tracking_update', updated);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Auth Helper
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = getDb().users[0]; // Fallback to demo user
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = getDb().users[0];
      return next();
    }
    const user = getDb().users.find((u) => u.id === decoded.userId) || decoded;
    req.user = user;
    next();
  });
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fixora Backend & Socket.IO Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    providersCount: getDb().providers.length,
    bookingsCount: getDb().bookings.length
  });
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const db = getDb();
  let user = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user) {
    const isProv = email?.includes('prov') || email?.includes('tech') || email?.includes('design');
    const isAdmin = email?.includes('admin');
    user = {
      id: `user-${Date.now()}`,
      name: isProv ? 'Ar. Ananya Deshmukh (Partner)' : isAdmin ? 'Admin User' : 'Sophia Miller',
      email: email || 'user@fixora.com',
      role: isAdmin ? 'ADMIN' : isProv ? 'PROVIDER' : 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      isActive: true
    };
    db.users.push(user);
    persist();
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({
    success: true,
    data: {
      user,
      token
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, city, role = 'CUSTOMER', bio, hourlyRate } = req.body;
  const db = getDb();

  let existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const token = jwt.sign({ userId: existing.id, email: existing.email, role: existing.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, data: { user: existing, token } });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone,
    city: city || 'Bengaluru',
    role,
    avatar: role === 'PROVIDER'
      ? 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isActive: true
  };
  db.users.push(newUser);

  if (role === 'PROVIDER') {
    const newProv = {
      id: `prov-${Date.now()}`,
      userId: newUser.id,
      bio: bio || 'Fixora Certified Partner Pro',
      experienceYears: 5,
      hourlyRate: parseFloat(hourlyRate) || 450,
      rating: 5.0,
      reviewCount: 1,
      isVerified: true,
      isAvailable: true,
      city: city || 'Bengaluru',
      user: newUser
    };
    db.providers.push(newProv);
  }

  persist();

  const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    data: {
      user: newUser,
      token
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, data: req.user });
});

// ==========================================
// 3. PROVIDERS ROUTES
// ==========================================
app.get('/api/providers', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.providers });
});

app.get('/api/providers/:id', (req, res) => {
  const db = getDb();
  const prov = db.providers.find((p) => p.id === req.params.id || p.userId === req.params.id) || db.providers[0];
  res.json({ success: true, data: prov });
});

// ==========================================
// 4. BOOKINGS ROUTES (CONSULTATIONS & SERVICES)
// ==========================================
app.get('/api/bookings/my-bookings', authenticateToken, (req, res) => {
  const db = getDb();
  const { status } = req.query;

  let list = db.bookings;
  if (status && status !== 'ALL') {
    list = list.filter((b) => b.status === status);
  }

  res.json({
    success: true,
    data: list
  });
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const db = getDb();
  const body = req.body;

  // Resolve Provider
  let provider = db.providers.find((p) => p.id === body.providerId || p.userId === body.providerId);
  if (!provider) {
    provider = db.providers[0]; // Default to Ar. Ananya Deshmukh
  }

  // Create new booking record
  const newBooking = {
    id: `book-${Date.now()}`,
    bookingNumber: `FIX-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: req.user?.id || 'user-cust-1',
    providerId: provider.id,
    serviceId: body.serviceId || 'serv-interior-consult',
    scheduledAt: body.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
    address: body.address || 'Bengaluru, India',
    city: body.city || provider.city || 'Bengaluru',
    notes: body.notes || 'Interior Design Consultation',
    totalPrice: body.totalPrice !== undefined ? body.totalPrice : 0,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    service: body.service || {
      id: body.serviceId || 'serv-interior-consult',
      name: body.notes?.includes('Theme') ? body.notes.split('|')[0].trim() : 'Interior Design Consultation',
      basePrice: body.totalPrice || 0,
      image: '/interiors/simple_minimalist.jpg'
    },
    provider: {
      id: provider.id,
      user: {
        id: provider.user?.id || provider.userId,
        name: provider.user?.name || 'Ar. Ananya Deshmukh',
        avatar: provider.user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: provider.user?.phone || '+91 98451 22345'
      }
    }
  };

  db.bookings.unshift(newBooking);

  // Create notification for Provider
  const clientName = body.clientName || req.user?.name || 'A homeowner';
  const newNotification = {
    id: `notif-${Date.now()}`,
    userId: provider.userId || provider.user?.id || 'user-prov-1',
    providerId: provider.id,
    title: 'New Consultation Booking Received!',
    message: `${clientName} scheduled a free site consultation for ${newBooking.service.name} (${newBooking.address}) on ${new Date(newBooking.scheduledAt).toLocaleDateString()}. WhatsApp: ${body.clientPhone || '+91 98765 43210'}`,
    type: 'BOOKING',
    referenceId: newBooking.id,
    link: '/provider/dashboard',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.notifications.unshift(newNotification);
  persist();

  // Real-time broadcast via Socket.IO
  io.emit('booking_created', newBooking);
  io.emit('notification', newNotification);

  console.log(`[Fixora Server] Created Booking #${newBooking.bookingNumber} for Provider ${provider.user?.name || provider.id}`);

  res.status(201).json({
    success: true,
    data: newBooking,
    message: 'Booking & Consultation created and provider notified successfully'
  });
});

app.patch('/api/bookings/:id/status', authenticateToken, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status } = req.body;

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.status = status;

  // Add notification to customer
  const customerNotif = {
    id: `notif-${Date.now()}`,
    userId: booking.customerId,
    title: `Booking #${booking.bookingNumber} Updated`,
    message: `Your booking status has been updated to ${status}.`,
    type: 'BOOKING',
    referenceId: booking.id,
    link: '/my-bookings',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  db.notifications.unshift(customerNotif);
  persist();

  io.emit('booking_update', booking);
  io.emit('notification', customerNotif);

  res.json({
    success: true,
    data: booking,
    message: `Booking status updated to ${status}`
  });
});

// ==========================================
// 5. NOTIFICATIONS ROUTES
// ==========================================
app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = getDb();
  const notifications = db.notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({
    success: true,
    data: {
      notifications,
      total: notifications.length,
      unreadCount
    }
  });
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    persist();
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

app.post('/api/notifications/read-all', authenticateToken, (req, res) => {
  const db = getDb();
  db.notifications.forEach((n) => {
    n.isRead = true;
  });
  persist();
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ==========================================
// 6. RAZORPAY PAYMENT GATEWAY (DUMMY/SANDBOX)
// ==========================================
app.post('/api/payments/create-order', authenticateToken, (req, res) => {
  const { amount, currency = 'INR', bookingId } = req.body;
  const orderId = 'order_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  res.json({
    success: true,
    data: {
      id: orderId,
      orderId,
      amount: parseFloat(amount) || 0,
      currency,
      keyId: 'rzp_test_FixoraDummyKey2026',
      bookingId
    }
  });
});

app.post('/api/payments/process', authenticateToken, (req, res) => {
  const db = getDb();
  const {
    bookingId,
    amount,
    method = 'RAZORPAY',
    currency = 'INR',
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    description
  } = req.body;

  const txnId = razorpayPaymentId || ('pay_rzp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
  const ordId = razorpayOrderId || ('order_rzp_' + Math.random().toString(36).substring(2, 9));

  // Find and update booking if attached
  let booking = null;
  if (bookingId && bookingId !== 'standalone') {
    booking = db.bookings.find((b) => b.id === bookingId);
    if (booking) {
      booking.paymentStatus = 'PAID';
      if (booking.status === 'PENDING') {
        booking.status = 'CONFIRMED';
      }
      booking.payment = {
        id: 'pay-' + Date.now(),
        bookingId: booking.id,
        customerId: req.user?.id || booking.customerId,
        amount: parseFloat(amount) || booking.totalPrice,
        currency,
        method: 'RAZORPAY',
        status: 'PAID',
        transactionId: txnId,
        razorpayOrderId: ordId,
        paidAt: new Date().toISOString()
      };
    }
  }

  const paymentRecord = {
    id: 'pay-' + Date.now(),
    bookingId: bookingId || 'standalone',
    customerId: req.user?.id || 'user-cust-1',
    amount: parseFloat(amount) || (booking?.totalPrice || 499),
    currency,
    method: 'RAZORPAY',
    status: 'PAID',
    transactionId: txnId,
    razorpayOrderId: ordId,
    description: description || (booking ? booking.service?.name : 'Fixora Home Service Transaction'),
    mockReceiptUrl: `https://fixora.local/receipts/${txnId}.pdf`,
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  if (!db.payments) {
    db.payments = [];
  }
  db.payments.unshift(paymentRecord);

  // Customer notification
  const custNotif = {
    id: `notif-${Date.now()}`,
    userId: req.user?.id || 'user-cust-1',
    title: 'Razorpay Payment Confirmed',
    message: `Payment of ₹${paymentRecord.amount} (Ref: ${txnId}) received via Razorpay. Receipt generated.`,
    type: 'PAYMENT',
    referenceId: paymentRecord.id,
    link: '/my-bookings',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.unshift(custNotif);

  // Provider notification if assigned
  if (booking && (booking.provider?.userId || booking.provider?.user?.id)) {
    const provUserId = booking.provider.userId || booking.provider.user.id;
    const provNotif = {
      id: `notif-${Date.now() + 1}`,
      userId: provUserId,
      providerId: booking.provider.id,
      title: 'Payment Received via Razorpay',
      message: `₹${paymentRecord.amount} credited for booking #${booking.bookingNumber}.`,
      type: 'PAYMENT',
      referenceId: booking.id,
      link: '/provider/dashboard',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(provNotif);
    io.emit('notification', provNotif);
  }

  persist();

  io.emit('notification', custNotif);
  if (booking) {
    io.emit('booking_update', booking);
  }

  console.log(`[Fixora Server] Razorpay Payment Success: ${txnId} (Amount: ₹${paymentRecord.amount})`);

  res.status(201).json({
    success: true,
    data: paymentRecord,
    message: 'Razorpay payment processed and verified successfully'
  });
});

app.get('/api/payments/my-payments', authenticateToken, (req, res) => {
  const db = getDb();
  const payments = db.payments || [];
  const userPayments = payments.filter((p) => p.customerId === req.user?.id);
  res.json({
    success: true,
    data: userPayments.length > 0 ? userPayments : payments
  });
});

app.get('/api/payments/booking/:bookingId', authenticateToken, (req, res) => {
  const db = getDb();
  const payment = (db.payments || []).find((p) => p.bookingId === req.params.bookingId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }
  res.json({ success: true, data: payment });
});

// ==========================================
// 8. LIVE TECHNICIAN LOCATION TRACKING
// ==========================================
app.get('/api/tracking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const db = getDb();
  const booking = (db.bookings || []).find((b) => b.id === bookingId);
  const customProvider = booking?.provider ? {
    id: booking.provider.id,
    name: booking.provider.name,
    phone: booking.provider.phone || '+91 98450 77122',
    avatar: booking.provider.avatar,
    rating: booking.provider.rating || 4.9
  } : null;

  const session = getOrCreateTracking(bookingId, customProvider);
  res.json({ success: true, data: session });
});

app.post('/api/tracking/:bookingId/update', (req, res) => {
  const { bookingId } = req.params;
  const session = updateTrackingLocation(bookingId, req.body);
  io.emit(`tracking_${bookingId}`, session);
  io.emit('global_tracking_update', session);
  res.json({ success: true, data: session });
});

app.post('/api/tracking/:bookingId/advance-step', (req, res) => {
  const { bookingId } = req.params;
  const session = advanceSimulationStep(bookingId);
  io.emit(`tracking_${bookingId}`, session);
  io.emit('global_tracking_update', session);
  res.json({ success: true, data: session });
});

// ==========================================
// 9. CITYLINK SKILLGRAPH AI ENGINE
// ==========================================
app.get('/api/skillgraph/templates', (req, res) => {
  res.json({
    success: true,
    data: {
      templates: Object.values(PROJECT_TEMPLATES),
      roles: SKILL_ROLES,
      availableProvidersCount: PROVIDER_POOL.length
    }
  });
});

app.post('/api/skillgraph/optimize', (req, res) => {
  const { projectType, budgetLimit, targetDate, optimizationObjective } = req.body;
  const result = optimizeSkillGraph({
    projectType: projectType || 'WEDDING_CELEBRATION',
    budgetLimit: budgetLimit ? Number(budgetLimit) : 60000,
    targetDate: targetDate || new Date().toISOString(),
    optimizationObjective: optimizationObjective || 'MAX_SYNERGY'
  });

  res.json({
    success: true,
    data: result
  });
});

app.post('/api/skillgraph/book-team', authenticateToken, (req, res) => {
  const { projectType, targetDate, notes, bundledPrice, teamMembers } = req.body;
  const db = getDb();
  const teamBookingId = `team-sg-${Date.now()}`;

  const template = PROJECT_TEMPLATES[projectType] || PROJECT_TEMPLATES.WEDDING_CELEBRATION;

  const teamBookingRecord = {
    id: teamBookingId,
    bookingNumber: `FIX-TEAM-${Math.floor(100000 + Math.random() * 900000)}`,
    customerId: req.user?.id || 'user-cust-1',
    projectName: template.name,
    projectType,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    scheduledAt: targetDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    totalPrice: bundledPrice || 24650,
    teamSize: (teamMembers || []).length,
    members: teamMembers || [],
    notes: notes || 'Booked via CityLink SkillGraph AI Multi-Vendor Coordinator',
    createdAt: new Date().toISOString()
  };

  db.teamBookings = db.teamBookings || [];
  db.teamBookings.unshift(teamBookingRecord);

  // Also create linked individual bookings for provider records
  (teamMembers || []).forEach((m, idx) => {
    db.bookings.unshift({
      id: `bk-${teamBookingId}-${idx}`,
      bookingNumber: `FIX-${Math.floor(100000 + Math.random() * 900000)}`,
      teamBookingId,
      customerId: req.user?.id || 'user-cust-1',
      providerId: m.id,
      serviceId: `serv-${m.role.toLowerCase()}`,
      scheduledAt: teamBookingRecord.scheduledAt,
      address: 'Indiranagar, Bengaluru',
      city: 'Bengaluru',
      notes: `Coordinated Role: ${m.role} for ${template.name}`,
      totalPrice: m.baseRate,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      service: {
        id: `serv-${m.role.toLowerCase()}`,
        name: `${m.title || m.role} (SkillGraph Coordinated)`,
        basePrice: m.baseRate
      },
      provider: {
        id: m.id,
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        phone: '+91 98450 11223'
      }
    });
  });

  persist();

  // Socket notification
  io.emit('notification', {
    id: `notif-${Date.now()}`,
    userId: req.user?.id || 'user-cust-1',
    title: 'SkillGraph Dream Team Confirmed!',
    message: `Your coordinated ${template.name} team of ${teamBookingRecord.teamSize} specialists is locked in.`,
    type: 'BOOKING',
    link: '/my-bookings',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    data: teamBookingRecord,
    message: 'SkillGraph coordinated team booked successfully!'
  });
});

// ==========================================
// START SERVER
// ==========================================
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`   Fixora Real-time Backend & Socket.IO Engine     `);
  console.log(`   HTTP & WebSocket Port: ${PORT}                  `);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

module.exports = server;