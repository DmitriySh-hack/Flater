const AdvertismentService = ('./advertisment-service.cjs')
const ApiError = require('../exceptions/api-error.cjs');

class AdvertisementController{
    async createAdvertisment(req, res, next) {
        try{
            const userId = req.user.id
            const advertData = req.body;
            const result = await AdvertismentService.createAdvertisment(userId, advertData)
            return res.json(result);
        }catch(e){
            next(e)
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

    async getCounterOfAdvertisment(req, res, next){
        try{
            const userId = req.user.id
            const result = await AdvertismentService.getCounterOfAdvertisment(userId)
            return res.json({result});
        }catch(e){
            next(e)
        }
    }

    async getUpdateForAdvertisment(req, res, next){
        try{
            const userId = req.user.id;
            const { adId } = req.params;
            const updateData = req.body;
            const result = await AdvertismentService.getUpdateForAdvertisment(userId, adId, )
            return res.json(result);
        }catch(e){
            next(e)
        }
    }

    async deleteAdvertisement(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const result = await advertisementService.deleteAdvertisement(userId, id);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AdvertisementController()