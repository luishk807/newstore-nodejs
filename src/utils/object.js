/** Removes the given array of fields from the given object */
function removeProperty(obj, fields) {
    for (let n=0; n<fields.length; ++n) {
        delete obj[fields[0]];
    }
}

module.exports = {
    removeProperty
}
