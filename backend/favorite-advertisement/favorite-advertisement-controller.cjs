const FavoriteAdvetisementModel = require('./favorite-advertisement-model.cjs');
const FavoriteAdvertisementService = require('./favorite-advertisement-service.cjs');
const AdvertismentModel = require('../advertisement/advertisment-model.cjs')

class FavoriteAdvertisementController{
    async addAdvertismentToFavorite(req, res, next){
        try{
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            const {advertisementId } = req.body

            const result = await FavoriteAdvertisementService.addAdvertisement(userId, advertisementId )
            return res.json(result)
        }catch(e){
            next(e)
        }
    }

    async deleteFavoriteAdvertisement(req, res, next){
        try{
            const userId  = req.user?.id || req.user?.userId || req.user?._id;
            const { advertisementId  } = req.params

            const result  = await FavoriteAdvertisementService.deleteAdvertisement(userId, advertisementId )
            return res.json(result)
        }catch(e){
            next(e)
        }
    }

    async getFavorite(req, res, next){
        try{
            const userId = req.user.id;

            const favorites = await FavoriteAdvetisementModel.findByUserId(userId)

            if(!favorites){
                return res.json([])
            }

            const promises = favorites.map(fav => AdvertismentModel.findById(fav.advertisement_id))

            const advertisements = await Promise.all(promises)

            res.json(advertisements);
        }catch(e){
            next(e)
        }
    } 
}

module.exports = new FavoriteAdvertisementController()