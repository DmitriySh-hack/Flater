const Router = require('express').Router;
const userController = require('../controllers/user-controller.cjs')
const advertisementController = require('../advertisement/advertisment-controller.cjs')
const router = new Router();
const {body} = require('express-validator')
const authMidddleware = require('../middleware/auth-middleware.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FavoriteAdvertisementController = require('../favorite-advertisement/favorite-advertisement-controller.cjs')

//Создание директории аватарки
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const adUploadsDir = path.join(__dirname, '..', 'uploads', 'advertisements');
if (!fs.existsSync(adUploadsDir)) {
    fs.mkdirSync(adUploadsDir, { recursive: true });
}

//Проверка, что файл подходит, как по размеру, так и по формату
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

//Всевозможные особенные переходы между страницами
router.post('/registration', body('email').isEmail(), body('password').isLength({min: 3, max: 16}), userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.put('/profile', authMidddleware, userController.updateProfile);
router.put('/change-password', authMidddleware, userController.changePassword);
router.post('/upload-avatar', authMidddleware, upload.single('avatar'), userController.uploadAvatar);

//Добавление объявления
router.post('/advertisements', authMidddleware, adUpload.array('images', 10), advertisementController.createAdvertisment);
router.get('/advertisements', authMidddleware, advertisementController.getAdvertismentUser);
router.put('/advertisements/:id', authMidddleware, advertisementController.getUpdateForAdvertisment);
router.delete('/advertisements/:id', authMidddleware, advertisementController.deleteAdvertisement);

router.get('/advertisements/all', advertisementController.getAllAdvertisements);
router.get('/advertisements/:id/with-user', advertisementController.getAdvertisementWithUser);

router.get('/advertisements/all-cities', advertisementController.getAllCities)

//Избранное
router.post('/favorites', authMidddleware, FavoriteAdvertisementController.addAdvertismentToFavorite);
router.get('/favorites', authMidddleware, FavoriteAdvertisementController.getFavorite);
router.delete('/favorites/:advertisementId', authMidddleware, FavoriteAdvertisementController.deleteFavoriteAdvertisement)

module.exports = router