const employeeService = require("./employee-service.cjs");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error.cjs");

class EmployeeController {
    async registrationEmployee(req, res, next){
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }
            const { name, nickname, password, position } = req.body;
            const user = await employeeService.registerEmployee(name, nickname, password, position);
            return res.json({ user });
        } catch (e) {
            next(e);
        }
    }

    async loginEmployee(req, res, next){
        try{
            const { nickname, password } = req.body;
            const userData = await employeeService.loginEmployee(nickname, password)

            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        }catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const token = await employeeService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token);
        }catch(e){
            next(e);
        }
    }

    async refresh(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const userData = await employeeService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        }catch(e){
            next(e);
        }
    }

    getPositions(req, res, next) {
        try {
            const positions = employeeService.getAvailablePositions();
            return res.json({ positions });
        } catch (e) {
            next(e);
        }
    }

    async changeEmployeePassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Ошибка при валидации", errors.array()));
            }

            const { nickname, newPassword } = req.body;
            await employeeService.changeEmployeePassword(nickname, newPassword);
            return res.json({ success: true, message: 'Пароль успешно обновлён' });
        } catch (e) {
            next(e);
        }
    }

    async getAllEmployees(req, res, next){
        try{
            const employees = await employeeService.getAllEmployees();
            return res.json({ employees })
        }catch(e){
            next(e)
        }
    }
}

module.exports = new EmployeeController()