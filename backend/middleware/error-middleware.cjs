const ApiError = require('../exceptions/api-error.cjs')

module.exports = function (err, req, res, next){
    console.log(err)
    if(err instanceof ApiError){
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }

    const detail = err?.originalError?.message || err?.message;
    return res.status(500).json({
        message: 'Ошибка с сервером',
        detail: detail || undefined,
    })
}