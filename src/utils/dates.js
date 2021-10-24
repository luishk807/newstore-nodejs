/**
 * Returns the given date using the normal date components of the given date as UTC
 * @returns {Date}
 */
function getDateAsUTCDate(date) {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    );
}

module.exports = {
    getDateAsUTCDate
}
