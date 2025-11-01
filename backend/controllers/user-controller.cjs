const userService = require('../services/user-service.cjs')
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error.cjs')

class UserController {
    async registration(req, res, next){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            const {email, password, firstName, lastName} = req.body;
            const userData = await userService.registration(email, password, firstName, lastName);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }catch(e){
            next(e);
        }
    }

    async login(req, res, next){
        try{
            const {email, password} = req.body;
            const userData = await userService.login(email, password);

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken')
            return res.json(token);
        }catch(e){
            next(e);
        }
    }


    async activate(req, res, next){
        try{
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            const redirectUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}` : '/profile';
            return res.redirect(redirectUrl)
        }catch(e){
            next(e); 
        }
    }

    async refresh(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        }catch(e){
            next(e);
        }
    }

//Функция для конкретных пользователей
    async getUsers(req, res, next){
        try{
            const users = await userService.getAllUsers();
            return res.json(users)
        }catch(e){
            next(e);
        }
    }

    async updateProfile(req, res, next){
        try{
            const userId = req.user.id
            const {firstName, lastName, email} = req.body
            const updateDto = await userService.updateProfile(userId, {firstName, lastName, email})
            return res.json({ user: updateDto })
        }catch(e){
            next(e)
        }
    }

    async changePassword(req, res, next){
        try{
            const userId = req.user.id
            const {oldPassword, newPassword} = req.body;
            await userService.changePassword(userId, oldPassword, newPassword);
            return res.json({success: true})
        }catch(e){
            next(e);
        }
    }

    async uploadAvatar(req, res, next){
        try{
            const userId = req.user.id
            const file = req.file
            if(!file){
                return next(ApiError.BadRequest('Файл не был загружен'))
            }
            console.log('Uploading avatar for user:', userId, 'File size:', file.size, 'File type:', file.mimetype)
            const result = await userService.updateAvatar(userId, file)
            return res.json({ user: result })
        }catch(e){
            console.error('Error in uploadAvatar:', e)
            next(e)
        }
    }
}

module.exports = new UserController()