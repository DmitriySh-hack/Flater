const ApiError = require("../exceptions/api-error.cjs");
const employeeTokenService = require("./employee-token-service.cjs");
const EmployeeDTO = require("./employee-dtos.cjs");
const EmployeeModel = require("./employee-model.cjs");
const bcrypt = require("bcrypt");
const {
    EMPLOYEE_POSITIONS,
    DEFAULT_EMPLOYEE_POSITION,
} = require("./employee-positions.cjs");

class EmployeeService {
    async registerEmployee(name, nickname, password, position){
        const nick = String(nickname || '').trim();
        if (!nick) {
            throw ApiError.BadRequest('Укажите логин');
        }
        const existing = await EmployeeModel.findByNickname(nick);
        if (existing) {
            throw ApiError.BadRequest('Сотрудник с таким логином уже существует');
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const id = String(Date.now());
        const pos = (position && String(position).trim()) || DEFAULT_EMPLOYEE_POSITION;
        if (!EMPLOYEE_POSITIONS.includes(pos)) {
            throw ApiError.BadRequest('Недопустимая должность');
        }
        const displayName = String(name || '').trim() || nick;
        
        const user = await EmployeeModel.createEmployee({
            id,
            name: displayName,
            nickname: nick,
            password: hashPassword,
            position: pos,
        });
        return new EmployeeDTO(user);
    }

    async loginEmployee(nickname, password){
        const user = await EmployeeModel.loginEmployee({ nickname })
        if(!user){
            throw ApiError.BadRequest('Работник не был найден')
        }
        const hash = user.password != null ? String(user.password) : '';
        let isPassEquals = false;
        if (hash) {
            try {
                isPassEquals = await bcrypt.compare(password, hash);
            } catch {
                isPassEquals = false;
            }
        }
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль')
        }

        const userDto = new EmployeeDTO(user);
        const tokenPayload = { ...userDto, role: 'employee' };
        const tokens = employeeTokenService.generateTokens(tokenPayload)
        await employeeTokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken){
        const token = await employeeTokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        console.log('🔄 [EmployeeService.refresh] Processing refresh');
        
        if(!refreshToken){
            throw ApiError.UnathorizedError();
        }
        
        try {
            // 1. Валидируем refresh токен
            const userData = employeeTokenService.validateRefreshToken(refreshToken);
            
            if(!userData){
                console.log('❌ [EmployeeService.refresh] Token validation failed');
                throw ApiError.UnathorizedError();
            }

            const tokenFromDb = await employeeTokenService.findToken(refreshToken);
            if (!tokenFromDb) {
                console.log('❌ [EmployeeService.refresh] Token not found in DB');
                throw ApiError.UnathorizedError();
            }
            
            console.log('✅ [EmployeeService.refresh] Token valid for user:', userData.id);
            
            // 2. Находим пользователя
            const user = await EmployeeModel.findById(userData.id);
            
            if(!user){
                console.log('❌ [EmployeeService.refresh] User not found');
                throw ApiError.UnathorizedError();
            }

            const userDto = new EmployeeDTO(user);
            const tokenPayload = { ...userDto, role: 'employee' };
            const tokens = employeeTokenService.generateTokens(tokenPayload);
            
            // 3. Сохраняем НОВЫЙ токен (даже если старый не найден в БД)
            await employeeTokenService.saveToken(userDto.id, tokens.refreshToken);
            
            console.log('✅ [EmployeeService.refresh] New tokens generated');
            
            return {
                ...tokens,
                user: userDto
            };
            
        } catch (error) {
            console.error('❌ [EmployeeService.refresh] Error:', error.message);
            throw error;
        }
    }

    getAvailablePositions() {
        return EMPLOYEE_POSITIONS;
    }

    async changeEmployeePassword(nickname, newPassword) {
        const nick = String(nickname || '').trim();
        const password = String(newPassword || '').trim();

        if (!nick) {
            throw ApiError.BadRequest('Укажите логин сотрудника');
        }

        if (!password) {
            throw ApiError.BadRequest('Укажите новый пароль');
        }

        const user = await EmployeeModel.loginEmployee({ nickname: nick });
        if (!user) {
            throw ApiError.BadRequest('Сотрудник не найден');
        }

        const hashPassword = await bcrypt.hash(password, 3);
        await EmployeeModel.updatePasswordByNickname(nick, hashPassword);
        return true;
    }
    
    async getAllEmployees(){
        return await EmployeeModel.allEmployees();
    }
}

module.exports = new EmployeeService();