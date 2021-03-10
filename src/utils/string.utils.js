const safeString = (value) => {
    return (value) ? value : '';
}

/** Returns a lower case string value, if it's null it will be blank */
const getLowerCaseSafeString = (value) => {
    return safeString(value).trim().toLowerCase();
}

module.exports = {
    safeString,
    getLowerCaseSafeString
}
