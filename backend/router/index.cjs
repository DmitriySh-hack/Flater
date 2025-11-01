const Router = require('express').Router;
const userController = require('../controllers/user-controller.cjs')
const router = new Router();
const {body} = require('express-validator')
const authMidddleware = require('../middleware/auth-middleware.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку для загрузок, если её нет
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
    storage: multer.memoryStorage(), 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Проверяем, что это изображение
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения!'), false);
        }
    }
});

router.post('/registration', body('email').isEmail(), body('password').isLength({min: 3, max: 16}), userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

router.get('/users', authMidddleware, userController.getUsers);

router.put('/profile', authMidddleware, userController.updateProfile);
router.put('/change-password', authMidddleware, userController.changePassword);
router.post('/upload-avatar', authMidddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router