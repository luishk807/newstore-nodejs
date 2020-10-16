const cleanData = (data) => {
  return data.toLowerCase().replace(/\s/g, "")
}


module.exports = { cleanData }