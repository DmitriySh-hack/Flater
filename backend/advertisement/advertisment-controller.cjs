const AdvertismentService = require('./advertisment-service.cjs')
const ApiError = require('../exceptions/api-error.cjs');

class AdvertisementController{
    async createAdvertisment(req, res, next) {
        try{
            const userId = req.user.id;
            
            // Подготавливаем данные
            const advertData = {
                title: req.body.title,
                price: req.body.price,
                city: req.body.city,
                street: req.body.street,
                countOfRooms: req.body.countOfRooms
            };

            // Обрабатываем загруженные файлы (как в uploadAvatar)
            if (req.files && req.files.length > 0) {
                advertData.images = req.files.map(file => 
                    `/uploads/advertisements/${file.filename}`
                );
            }

            const result = await AdvertismentService.createAdvertisment(userId, advertData);
            return res.json(result);
        } catch(e) {
            next(e);
        }
    }

    async getAdvertismentUser(req, res, next){
        try{
            const userId = req.user.id;
            const result = await AdvertismentService.getAdvertismentUser(userId)
            return res.json(result);
        }catch(e){
            next(e)
        }
    }

    async getUpdateForAdvertisment(req, res, next){
        try{
            const userId = req.user.id;
            const { id } = req.params;
            const updateData = req.body;
            const result = await AdvertismentService.getUpdateForAdvertisment(userId, id, updateData)
            return res.json(result);
        }catch(e){
            next(e)
        }
    }

    async deleteAdvertisement(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const result = await AdvertismentService.deleteAdvertisment(userId, id);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    async getAllAdvertisements(req, res, next){
        try{
            const result = await AdvertismentService.getAllAdvertisments()
            return res.json(result)
        }catch(e){
            next(e)
        }
    }

    async getAdvertisementWithUser(req, res, next) {
        try {
            const { id } = req.params;
            console.log('🔍 Controller: Getting advertisement with user for ID:', id);
            
            const result = await AdvertismentService.getAdvertismentWithUser(id);
            
            console.log('✅ Controller: Successfully got advertisement with user');
            return res.json(result);
        } catch (e) {
            console.error('❌ Controller Error in getAdvertisementWithUser:', e);
            next(e);
        }
    }
}

module.exports = new AdvertisementController()