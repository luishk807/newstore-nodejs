const router = require('express').Router();
const cors = require('cors');
const verify = require('../../middlewares/verifyToken');
const WorkRole = require('../../pg/models/WorkRoles');
const Category = require('../../pg/models/Categories');
const Vendor = require('../../pg/models/Vendors');
const Brand = require('../../pg/models/Brands');
const Status = require('../../pg/models/Statuses');
const Gender = require('../../pg/models/Genders');
const Country = require('../../pg/models/Countries');
const ImageBoxType = require('../../pg/models/ImageBoxTypes');
const SweetBoxType = require('../../pg/models/SweetBoxTypes');
const UserRole = require('../../pg/models/UserRoles');
const User = require('../../pg/models/Users');
const Province = require('../../pg/models/Provinces');
const DeliveryOption = require('../../pg/models/DeliveryOptions');
const Corregimiento = require('../../pg/models/Corregimientos');
const District = require('../../pg/models/Districts');
const OrderCancelReason = require('../../pg/models/OrderCancelReasons');
const OrderStatus = require('../../pg/models/OrderStatuses');
router.all('*', cors());

router.get('/user', async(req, res, next) => {
  let data = {}
  try {
    const category = await Category.findAll({where: {statusId: 1}});
    const vendor = await Vendor.findAll({where: {statusId: 1}, include: ['vendor_rates', 'vendorUser','vendorCountry']});
    const brand = await Brand.findAll({where: {statusId: 1}, include:['brandStatus']});
    const gender = await Gender.findAll();
    const status = await Status.findAll();
    const country = await Country.findAll({
      attributes: ['id', ['nicename', 'name']] //id, first AS firstName
    });
    const imageBoxType = await ImageBoxType.findAll();
    const sweetboxtype = await SweetBoxType.findAll();
    const userRole = await UserRole.findAll();
    const province = await Province.findAll();
    const deliveryOption = await DeliveryOption.findAll({where: {statusId: 1}, include: ['deliveryOptionStatus']});
    const corregimiento = await Corregimiento.findAll();
    const district = await District.findAll();
    const orderCancelReason = await OrderCancelReason.findAll();
    const orderStatus = await OrderStatus.findAll();
    data['sweetBoxType'] = sweetboxtype;
    data['vendor'] = vendor;
    data['brand'] = brand;
    data['gender'] = gender;
    data['status'] = status;
    data['country'] = country;
    data['position'] = userRole;
    data['imageBoxType'] = imageBoxType;
    data['category'] = category;
    data['userRole'] = userRole;
    data['district'] = district;
    data['deliveryOption'] = deliveryOption;
    data['province'] = province;
    data['corregimiento'] = corregimiento;
    data['orderCancelReason'] = orderCancelReason;
    data['orderStatus'] = orderStatus;
    res.status(200).json(data)
  } catch(err) {
    res.send({status: false, message: err})
  }
});

router.get('/admin', [verify], async(req, res, next) => {
  if (req.user.type !== '1') {
    res.status(401).json({status: false, message: 'not authorized'})
  } else {
    let data = {}
    try {
      const category = await Category.findAll({where: {statusId: 1}});
      const vendor = await Vendor.findAll({where: {statusId: 1}, include: ['vendor_rates', 'vendorUser','vendorCountry']});
      const brand = await Brand.findAll({where: {statusId: 1}, include:['brandStatus']});
      const gender = await Gender.findAll();
      const status = await Status.findAll();
      const country = await Country.findAll({
        attributes: ['id', ['nicename', 'name']] //id, first AS firstName
      });
      const imageBoxType = await ImageBoxType.findAll();
      const sweetboxtype = await SweetBoxType.findAll();
      const userRole = await UserRole.findAll();
      const user = await User.findAll({include:['useStatus','userRoles']})
      const province = await Province.findAll();
      const deliveryOption = await DeliveryOption.findAll({where: {statusId: 1}, include: ['deliveryOptionStatus']});
      const corregimiento = await Corregimiento.findAll();
      const district = await District.findAll();
      const orderCancelReason = await OrderCancelReason.findAll();
      const orderStatus = await OrderStatus.findAll();
      data['user'] = user;
      data['sweetBoxType'] = sweetboxtype;
      data['vendor'] = vendor;
      data['brand'] = brand;
      data['gender'] = gender;
      data['status'] = status;
      data['country'] = country;
      data['position'] = userRole;
      data['imageBoxType'] = imageBoxType;
      data['category'] = category;
      data['userRole'] = userRole;
      data['district'] = district;
      data['province'] = province;
      data['deliveryOption'] = deliveryOption;
      data['corregimiento'] = corregimiento;
      data['orderCancelReason'] = orderCancelReason;
      data['orderStatus'] = orderStatus;
      res.status(200).json(data)
    } catch(err) {
      res.send({status: false, message: err})
    }
  }
});

module.exports = router