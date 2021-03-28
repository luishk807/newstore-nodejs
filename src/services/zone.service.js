const Zone = require('../pg/models/Zones');
const includes = ['zoneStatus', 'zoneProvince', 'zoneDistrict', 'zoneCorregimiento'];
const getZones = () => {
    return Zone.findAll({include: includes});
}

module.exports = {
    getZones
}
