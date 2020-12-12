const cleanData = (data) => {
  if (data) {
    return data.toLowerCase().replace(/\s/g, "")
  }
  return data;
}


module.exports = { cleanData }