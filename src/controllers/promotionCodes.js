const promotionCode = require('../services/promotionCode.service');

module.exports = {
    createPromotionCode: promotionCode.createPromotionCode,
    updatePromotionCode: promotionCode.updatePromotionCode,
    getPromotionCodeById: promotionCode.getPromotionCodeById,
    getPromotionCodeByProductId: promotionCode.getPromotionCodeByProductId,
    getPromotionCodeByIds: promotionCode.getPromotionCodeByIds,
    getPromotionCodes: promotionCode.getPromotionCodes,
    getPromotionCodeByCode: promotionCode.getPromotionCodeByCode,
    deletePromotionCode: promotionCode.deletePromotionCode,
    softDeletePromotionCodeById: promotionCode.softDeletePromotionCodeById
}
