const jwt = require('jsonwebtoken');
const config = require('../config');
const PromotionCode = require('../pg/models/PromotionCodes');
const LIMIT = config.defaultLimit;

const cleanData = (data) => {
  if (data) {
    return data.toLowerCase().replace(/\s/g, "")
  }
  return data;
}

const checkIfEmpty = (data) => {
  return data == 'null' || data == "undefined" || !data;
}

const getTokenData = (authToken) => {
  const token = authToken && authToken.split(' ')[1];
  if (!token) {
    return null;
  }
  
  try {
    const verified = jwt.verify(token, config.authentication.authToken);
    return verified ? verified : null

  } catch(err) {
    return null;
  }
}

const returnSlugName = (str, key = null) => {
  if (str && isNaN(str)) {
    const slugName_init = str.trim().toLowerCase().normalize('NFKD').replace(/[^\w]+/g, "-").replace(/\-$/, '');
    let finalSlugName = slugName_init;
    if (key) {
      finalSlugName = `${key.trim().toLowerCase()}-${slugName_init}`;
    }
    return finalSlugName; 
  } else {
    return str;
  }
}

const calculateTotal = async(obj) => {

  const carts = JSON.parse(obj.cart);
  const TAX = parseFloat(config.taxTotal);
  const today = new Date();
  let subtotal = 0;
  let taxes = 0;
  let grandTotal = 0;
  let savedGrandTotal = 0;
  let delivery = !obj.delivery || obj.delivery === -1 ? 0 : parseFloat(obj.delivery);
  let originalTotal = 0;
  let couponTotal = 0;
  let validCoupon = false;

  if (Object.keys(carts).length) {
      for(const key in carts) {
          const retailPrice = parseFloat(carts[key].retailPrice);
          const quantity = parseInt(carts[key].quantity);
          const originalPrice = parseFloat(carts[key].originalPrice);
          subtotal += retailPrice * quantity;
          originalTotal += originalPrice * quantity;
      }
  }

  if (!isNaN(obj.promotionCodeId) && obj.promotionCodeId) {
    const promoCode = await PromotionCode.findOne({
      where: {
        id: obj.promotionCodeId,
        status: 1
      }
    })
    
    if (promoCode) {
      const getStartDate = new Date(promoCode.startDate);
      const getEndDate = new Date(promoCode.endDate);
      let coupon = parseFloat(promoCode.percentage);
      couponTotal = ((coupon / 100) * subtotal);
      if (promoCode.useDate) {
        if (today.getTime() > getStartDate.getTime() && today.getTime() < getEndDate.getTime()) {
          validCoupon = true;
        } else {
          validCoupon = false;
        }
      } else {

        validCoupon = true;
      }
    }
  }

  let newSubtotal = validCoupon ? subtotal - couponTotal : subtotal;

  taxes = newSubtotal * TAX;

  grandTotal = taxes + newSubtotal + delivery;

  savedGrandTotal = isNaN(originalTotal) ? null : originalTotal - newSubtotal;

  if (validCoupon && !isNaN(savedGrandTotal)) {
    savedGrandTotal = savedGrandTotal + couponTotal;
  }

  return {
      'subtotal': formatNumber(subtotal),
      'delivery': formatNumber(delivery),
      'taxes': formatNumber(taxes),
      'coupon': formatNumber(couponTotal),
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
  getTokenData,
  formatNumber,
  calculateTotal,
  checkIfEmpty,
  returnSlugName
}