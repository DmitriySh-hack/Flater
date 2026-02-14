const Router = require('express').Router;
const userController = require('../controllers/user-controller.cjs');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware.cjs');
const advertisementController = require('../advertisement/advertisment-controller.cjs');
const FavoriteAdvertisementController = require('../favorite-advertisement/favorite-advertisement-controller.cjs');
const BookingAdvertisementController = require('../booking-advertisement/booking-controller.cjs');
const CalendarController = require('../calendar/calendar-controller.cjs');
const MessageController = require('../messages/message-controller.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создание директорий для загрузок
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const adUploadsDir = path.join(__dirname, '..', 'uploads', 'advertisements');
if (!fs.existsSync(adUploadsDir)) {
    fs.mkdirSync(adUploadsDir, { recursive: true });
}

// Конфигурация multer для аватарок
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения!'), false);
        }
    }
});

// Конфигурация multer для объявлений
const adUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, adUploadsDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения!'), false);
        }
    }
});

const router = new Router();

// Пользователи
router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 3, max: 16 }), userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

// Объявления
router.post('/advertisements', authMiddleware, adUpload.array('images', 10), advertisementController.createAdvertisment);
router.get('/advertisements', authMiddleware, advertisementController.getAdvertismentUser);
router.put('/advertisements/:id', authMiddleware, adUpload.array('images', 10), advertisementController.getUpdateForAdvertisment);
router.delete('/advertisements/:id', authMiddleware, advertisementController.deleteAdvertisement);
router.get('/advertisements/all', advertisementController.getAllAdvertisements);
router.get('/advertisements/:id/with-user', advertisementController.getAdvertisementWithUser);
router.get('/advertisements/all-cities', advertisementController.getAllCities);

// Избранное
router.post('/favorites', authMiddleware, FavoriteAdvertisementController.addAdvertismentToFavorite);
router.get('/favorites', authMiddleware, FavoriteAdvertisementController.getFavorite);
router.delete('/favorites/:advertisementId', authMiddleware, FavoriteAdvertisementController.deleteFavoriteAdvertisement);

// Бронирование (системный список)
router.post('/booking', authMiddleware, BookingAdvertisementController.bookingAdvertisement);
router.delete('/booking/:advertisementId', authMiddleware, BookingAdvertisementController.deleteBookingAdvertisemnt);
router.get('/booking', authMiddleware, BookingAdvertisementController.getBooking);

// Сообщения
router.get('/messages/:userId', authMiddleware, MessageController.getHistory);
router.get('/dialogs', authMiddleware, MessageController.getDialogs);
router.put('/messages/read/:messageId', authMiddleware, MessageController.markRead);

// Календарь бронирования
router.get('/calendar/:adId', CalendarController.getBooking);
router.post('/calendar/reserve', authMiddleware, CalendarController.createdBooking);
router.delete('/calendar/:adId', authMiddleware, CalendarController.deleteBooking);

router.get('/booking/entries', authMiddleware, CalendarController.getBookingEntries);
router.delete('/calendar/booking/:id', authMiddleware, CalendarController.deleteBookingEntries);

module.exports = router;