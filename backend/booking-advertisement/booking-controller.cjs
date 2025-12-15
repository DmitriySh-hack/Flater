const BookingAdvertisementModel = require('./booking-model.cjs');
const BookingAdvertisementService = require('./booking-service.cjs')


class BookingAdvertisementController{
    async bookingAdvertisement(req, res, next){
        try{
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            const {advertisementId} = req.body

            const result = await BookingAdvertisementService.addAdvertisement(userId, advertisementId)
            return res.json(result)
        }catch(e){
            next(e)
        }
    }

    async deleteBookingAdvertisemnt(req, res, next){
        try{
            const userId = req.user?.id || req.user?.userId || req.user?._id;
            const {advertisementId} = req.params

            const result = await BookingAdvertisementService.deleteAdvertisement(userId, advertisementId)
            return res.json(result)
        }catch(e){
            next(e)
        }
    }

    async getBooking(res, req, next){
        try{
            const userId = req.user.id;
            const booking = await BookingAdvertisementModel.findByUserId(userId)
            
            if(!booking){
                return res.json([])
            }

            const promise = booking.map(book => BookingAdvertisementModel.findById(book.advertisement_id))
            const advertisement = await Promise.all(promise)

            res.json(advertisement)
        }catch(e){
            next(e)
        }
    }
}

module.exports = new BookingAdvertisementController()