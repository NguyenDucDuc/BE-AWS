const responseUtil = require("../utils/response.util")
const {ProductCart} = require("../models")

module.exports = {
    add: async (body) => {
        try {
            const newProductCart = await ProductCart.create({
                productId: body.productId,
                cartId: body.cartId,
                quantity: body.quantity,
                unitPrice: body.unitPrice
            })
            return responseUtil.created(newProductCart)
        } catch (error) {
            console.log(error)
            return responseUtil.serverError()
        }
    },
    update: async (body) => {
        try {
            const productCart = await ProductCart.findOne({where: {productId: body.productId}})
            productCart.quantity = body.quantity
            await productCart.save()
            return responseUtil.updateSuccess(productCart)
        } catch (error) {
            console.log(error)
            return responseUtil.serverError()
        }
    }
}