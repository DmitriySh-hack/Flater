const FavoriteAdvetisementModel = require('./favorite-advertisement-model.cjs')
const FavoriteAdvetisementDTO = require('./favorite-advertisement-dtos.cjs')

class FavoriteAdvertisementService{
    async addAdvertisement(userId, advertisementId){
        const favorite = await FavoriteAdvetisementModel.add(userId, advertisementId)
        return {
            success: true,
            message: 'Объявление добавлено в избранное',
            data: new FavoriteAdvetisementDTO(favorite)
        };
    }

    async deleteAdvertisement(userId, advertisementId){
        const favorite =  await FavoriteAdvetisementModel.findByUserAndAdvertisement(userId, advertisementId)
        const result = await FavoriteAdvetisementModel.deleteById(favorite.id)

         return {
            success: true,
            message: 'Объявление удалено из избранного',
            deletedCount: result.deleteCount
        };
    }

    async getFavoriteAdvertismentUser(userId){
        const favorites = await FavoriteAdvetisementModel.findByUserId(userId);
        return favorites.map(fav => new FavoriteAdvertisementDTO(fav));
    }
}

module.exports = new FavoriteAdvertisementService();