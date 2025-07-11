# Sintesa Backend

Backend API teroptimasi untuk aplikasi Sintesa dengan Socket.IO terintegrasi.

## Fitur Utama

- ✅ **Express.js** - Framework web yang cepat dan minimalis
- ✅ **Socket.IO** - Real-time bidirectional event-based communication
- ✅ **MySQL/Sequelize** - Database ORM dengan connection pooling
- ✅ **JWT Authentication** - Sistem autentikasi yang aman
- ✅ **Rate Limiting** - Perlindungan dari abuse
- ✅ **Security Headers** - Helmet.js untuk keamanan
- ✅ **Compression** - Kompresi response untuk performa
- ✅ **Error Handling** - Penanganan error yang comprehensive
- ✅ **Logging** - Sistem logging yang detail
- ✅ **Graceful Shutdown** - Shutdown yang aman
- ✅ **PM2 Ready** - Siap untuk production dengan PM2

## Instalasi

1. **Clone atau copy project**
2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit file `.env` sesuai dengan konfigurasi Anda.

4. **Jalankan server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Struktur Folder

```
backend_baru/
├── config/          # Konfigurasi database & middleware
├── middleware/      # Custom middleware
├── routes/          # Route handlers
├── socket/          # Socket.IO handlers
├── utils/           # Utility functions
├── public/          # Static files
├── logs/            # Log files (auto-created)
└── index.js         # Main server file
```

## API Endpoints

### Authentication

- `POST /api/auth/registrasi` - Registrasi user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profil` - Get user profile
- `PUT /api/auth/profil` - Update user profile
- `PUT /api/auth/ubah-password` - Change password

### Users Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PATCH /api/users/:id/status` - Update user status (admin only)
- `POST /api/users/:id/reset-password` - Reset user password (admin only)

### Socket Management

- `GET /api/socket/stats` - Get socket statistics
- `GET /api/socket/online-users` - Get online users
- `POST /api/socket/broadcast` - Broadcast message to all users
- `POST /api/socket/broadcast-room` - Broadcast to specific room
- `POST /api/socket/message-user` - Send message to specific user
- `POST /api/socket/disconnect-user` - Force disconnect user (admin only)

### General

- `GET /api/health` - Health check
- `GET /api/info` - API information
- `GET /api/test` - Test endpoint

## Socket.IO Events

### Client to Server

- `user_online` - Set user as online
- `user_offline` - Set user as offline
- `join_room` - Join a room
- `leave_room` - Leave a room
- `kirim_pesan` - Send message
- `kirim_notifikasi` - Send notification
- `broadcast` - Broadcast message

### Server to Client

- `koneksi_berhasil` - Connection success
- `update_user_list` - Updated online users list
- `pesan_masuk` - Incoming message
- `notifikasi_masuk` - Incoming notification
- `broadcast_masuk` - Incoming broadcast
- `user_joined_room` - User joined room
- `user_left_room` - User left room

## Environment Variables

```env
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sintesa_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
SESSION_SECRET=your_session_secret
CORS_ORIGINS=http://localhost:3000,https://sintesa.kemenkeu.go.id
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
MAX_FILES=10
```

## Development

```bash
# Install dependencies
npm install

# Start development server dengan auto-reload
npm run dev

# Start production server
npm start
```

## Production Deployment

### Dengan PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start dengan PM2
pm2 start ecosystem.config.json

# Monitor
pm2 monit

# Logs
pm2 logs sintesa-backend

# Restart
pm2 restart sintesa-backend

# Stop
pm2 stop sintesa-backend
```

### Dengan Docker (opsional)

```bash
# Build image
docker build -t sintesa-backend .

# Run container
docker run -p 8080:8080 sintesa-backend
```

## Optimasi & Keamanan

### Performance

- Connection pooling untuk database
- Compression untuk response
- Rate limiting untuk mencegah abuse
- Caching untuk data yang sering diakses

### Security

- Helmet.js untuk security headers
- JWT untuk authentication
- Input validation
- CORS configuration
- Session management

### Monitoring

- Request/response logging
- Error tracking
- Performance metrics
- Socket connection monitoring

## Troubleshooting

### Common Issues

1. **Port sudah digunakan**

   - Ubah PORT di .env file
   - Atau hentikan proses yang menggunakan port tersebut

2. **Database connection error**

   - Periksa konfigurasi database di .env
   - Pastikan MySQL service running
   - Periksa credentials database

3. **Socket connection issues**
   - Periksa CORS configuration
   - Pastikan firewall tidak memblokir port
   - Check network connectivity

## License

MIT License - Copyright (c) 2024 DJPB
