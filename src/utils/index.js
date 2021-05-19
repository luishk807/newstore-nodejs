const config = require('../config');
const PromotionCode = require('../pg/models/PromotionCodes');
const LIMIT = config.defaultLimit;

const cleanData = (data) => {
  if (data) {
    return data.toLowerCase().replace(/\s/g, "")
  }
  return data;
}

const calculateTotal = async(obj) => {

  const carts = JSON.parse(obj.cart);
  const TAX = parseFloat(config.taxTotal);
  let subtotal = 0;
  let taxes = 0;
  let grandTotal = 0;
  let savedGrandTotal = 0;
  let coupon = 0;
  const promoCode = await PromotionCode.findOne({
    where: {
      id: obj.promotionCodeId,
      status: 1
    }
  })
  let delivery = !obj.delivery || obj.delivery === -1 ? 0 : parseFloat(obj.delivery);
  let originalTotal = 0;

  if (Object.keys(carts).length) {
      for(const key in carts) {
          const retailPrice = parseFloat(carts[key].retailPrice);
          const quantity = parseInt(carts[key].quantity);
          const originalPrice = parseFloat(carts[key].originalPrice);
          subtotal += retailPrice * quantity;
          originalTotal += originalPrice * quantity;
      }
  }

  taxes = subtotal * TAX;

  grandTotal = taxes + subtotal + delivery;

  savedGrandTotal = originalTotal - subtotal;

  let newCoupon = 0;

  const today = new Date();
  
  let validCoupon = true;

  if (promoCode) {
    const getStartDate = new Date(promoCode.startDate);
    const getEndDate = new Date(promoCode.endDate);
    if (promoCode.useDate) {
      if (today.getTime() > getStartDate.getTime() && today.getTime() < getEndDate.getTime()) {
        validCoupon = true;
      } else {
        validCoupon = false;
      }
    }

    if (validCoupon) {
      let coupon = parseFloat(promoCode.percentage);
      let oldTotal = grandTotal;
      newCoupon = ((coupon / 100) * grandTotal);
      grandTotal = grandTotal - newCoupon;
      if (isNaN(savedGrandTotal)) {
        savedGrandTotal = oldTotal - grandTotal;
      } else {
        savedGrandTotal = savedGrandTotal + newCoupon;
      }
    }
  }

  return {
      'subtotal': formatNumber(subtotal),
      'delivery': formatNumber(delivery),
      'taxes': formatNumber(taxes),
      'coupon': formatNumber(newCoupon),
      'saved': formatNumber(savedGrandTotal),
      'grandTotal': formatNumber(grandTotal)
  };
}

const formatNumber = (x) => x ? Number.parseFloat(x).toFixed(2) : 0.00;

/** Returns an array of distict values for the given array object field */
const getDistinctValues = (dataArray, field) => {
  if (!!dataArray.length) {
    const checks = {};
    const output = [];
    dataArray.forEach(d => {
      // If it does not exist on the check object, then set flag to true
      try {
        const stringValue = d[field].toString();
        if (!checks[stringValue]) {
          checks[stringValue] = true;
          output.push(d[field]);
        }
      } catch (err) {
        logger.error(err);
      }
    });
    return output;
  }
  return []
}

/**
 * Gets the unique object array filtered by the given field
 * @param {*} data 
 */
const getUniqueValuesByField = (dataArray, field) => {
  const uniqueValueByField = getDistinctValues(dataArray, field);
  const result = [];
  uniqueValueByField.forEach(pname => {
    result.push(
      dataArray.find(d => d[field] === pname)
    )
  });
  return result;
}

/** Returns a boolean indicating if all provided fields exists */
const existFields = (obj, fields) => {
  if (obj) {
      for (let n = 0; n < fields.length; ++n) {
          if (!obj[fields[n]]) {
              return false;
          }
      }
      return true;
  } else {
      return false;
  }
}

const paginate = (pag, limit = LIMIT) => {
  const page = pag > 0 ? pag - 1 : 0;
  return offset = page ? page * limit : 0;
};

const getAdminEmail = (emailType = null) => {
  let adminEmail = config.email.dev;
  if (emailType && config.email[emailType]) {
    adminEmail = config.email[emailType];
  }
  return process.env.NODE_ENV === "production" ? adminEmail : config.email.dev;
}

module.exports = {
  cleanData,
  getDistinctValues,
  getUniqueValuesByField,
  existFields,
  paginate,
  getAdminEmail,
  formatNumber,
  calculateTotal
}