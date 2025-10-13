const userModel = require("../models/user-model.cjs");
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service.cjs')
const TokenService = require('./token-service.cjs');
const tokenModel = require("../models/token-model.cjs");
const tokenService = require("./token-service.cjs");
const UserDto = require('../dtos/user-dtos.cjs');
const ApiError = require('../exceptions/api-error.cjs');


class UserService{
    async registration(email, password, firstName, lastName){
        const candidate = await userModel.findOne({email})
        if(candidate){
            throw ApiError.BadRequest("Пользователь с таким email уже существует");
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const user = await userModel.create({email, password: hashPassword, activationLink, firstName, lastName, isActivated: false}) 
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto}) 
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
  
    }

    async activate(activationLink){
        const user = await userModel.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }

        const updated = await userModel.findByIdAndUpdate(user.id, { isActivated: true })
        return updated;
    }

    async login(email, password){
        const user = await userModel.findOne({email});
        if(!user){
            throw ApiError.BadRequest('Пользователь не был найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        } 
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnathorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if(!userData || ! tokenFromDB){
            throw ApiError.UnathorizedError();
        }

        const user = await userModel.findById(userData.id);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto}) 
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async getAllUsers(userId, update){
        const users = await UserModel.findByIdAndUpdate();
        return users
    }

    async updateProfile(userId, update){
        const changeVal = ['firstName', 'lastName', 'email']
        const checkVal = {}

        for (const key of changeVal) {
            if (Object.prototype.hasOwnProperty.call(update, key) && update[key] !== undefined) {
                checkVal[key] = update[key]
            }
        }

        if (checkVal.email) {
            const existing = await userModel.findOne({ email: checkVal.email })
            if (existing && existing.id !== userId) {
                throw ApiError.BadRequest('Пользователь с текущим email уже существует')
            }
        }

        const updateUser = await userModel.findByIdAndUpdate(userId, checkVal)
        if (!updateUser) {
            throw ApiError.BadRequest('Пользователь не найден')
        }

        const userDto = new UserDto(updateUser)
        return userDto
    }

    async changePassword(userId, oldPassword, newPassword){
        const user = await userModel.findById(userId)
        if(!user){
            throw ApiError.BadRequest('Пользователь не найден')
        }
        const isPassEquals = await bcrypt.compare(oldPassword, user.password)
        if(!isPassEquals){
            throw ApiError.BadRequest('Старый пароль неверный')
        }
        if(!newPassword || String(newPassword).length < 6){
            throw ApiError.BadRequest('Новый пароль слишком короткий')
        }
        const hashPassword = await bcrypt.hash(newPassword, 3)
        await userModel.findByIdAndUpdate(userId, {password: hashPassword})
        return true;
    }
}

module.exports = new UserService();
