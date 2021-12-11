const safeString = (value) => {
    return (value) ? value : '';
}

/** Returns a lower case string value, if it's null it will be blank */
const getLowerCaseSafeString = (value) => {
    return safeString(value).trim().toLowerCase();
}

const getStringBooleanValue = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        }
    }
    return !!value;
}

module.exports = {
    safeString,
    getLowerCaseSafeString,
    getStringBooleanValue
}
