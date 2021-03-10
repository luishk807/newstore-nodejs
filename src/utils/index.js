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
      const stringValue = d[field].toString();
      if (!checks[stringValue]) {
        checks[stringValue] = true;
        output.push(d[field]);
      }
    });
    return output;
  }
  return []
}


module.exports = {
  cleanData,
  getDistinctValues
}