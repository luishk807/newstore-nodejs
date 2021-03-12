const cleanData = (data) => {
  if (data) {
    return data.toLowerCase().replace(/\s/g, "")
  }
  return data;
}

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

module.exports = {
  cleanData,
  getDistinctValues,
  getUniqueValuesByField,
  existFields
}