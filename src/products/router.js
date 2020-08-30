const router = require('express').Router();
const cors = require('cors');
const config = require('../config.js');
const data = require('../samples/products.json');

const EmployeeModel = require('../pg/models/Employees');
const ProductModel = require('../pg/models/Products');

const Employee = EmployeeModel.getEmployeeModel();
 const Product = ProductModel.getProductModel();

router.all('*', cors());

router.delete('/products', (req, res, next) => {
  // delete products
  Product.destroy({
    where: {
      id: '1'
    }
  }).then((deleteRecord) => {
    if (deleteRecord) {
      res.json({ data: 'deleted'});
    }
  }, (err) => {
      res.json(err);
  })
});

router.post('/products', (req, res, next) => {
  // add / update products
  if (req.body.id) {

  } else {
    Employee.create({ name: 'Jane Doe', rollnumber: 111 }).then((employee) => {
      res.status(200).json(employee);
    })
  }
  // res.json(req.body);
  // // Employee.create(req.body.form).then((employee) => {
  // //   res.status(200).json(employee);
  // // });
});

router.get('/products', async(req, res, next) => {
  // get products
  let product = null;

  // if (req.body.id) {
  //   product = await Product.findAll({ where: {id: req.body.id}});
  // } else {
  //   product = await Product.findAll();
  // }
  product = await Product.findAll();
  if(Object.keys(product).length) {
    res.send(product)
  }else{
    res.send("empty")
  }
  // .on("success", (product) => {
  //   if (product) {
  //     product.update({
  //       name: "jane"
  //     }).then((data) => {
  //       res.send(data)
  //     }, (err) => {
  //       res.send(err)
  //     })
  //   }
  // })
  // Product.create({
  //   // 'name': 'test',
  //   // 'stock': 2,
  //   // 'amount': 343,
  //   // 'category': {"id":1,"name":"Computer"},
  //   // 'brand': {"id":1,"name":"Nike","created":"2020-05-12"},
  //   // 'model': 'asd',
  //   // 'code': 'asdf',
  //   // 'description': 'asdf',
  //   // 'vendor': {"id":1,"name":"Mi tienda","phone":"507-555-4444","mobile":"507-5445-5454","address":"12 testing","province":"panama","township":"panama","city":"panama","zipcode":"","state":"","country":""},
  //   // 'image[]': {"path":"MoBZJKub.jpeg"},
  //   'name': 'test',
  //   'stock': 2,
  //   'amount': 343,
  //   'category': 1,
  //   'brand': 10,
  //   'model': 'asd',
  //   'code': 'asdf',
  //   'description': 'asdf',
  //   'vendor': 2,
  //   'image[]': "MoBZJKub.jpeg",
  // }).then((data) => {
  //   res.send(data);
  // }, (err) => {
  //   res.json("Product can't be saved");
  // })


  
  // if (req.body.id) {
  //   Product.find({
  //     where: {
  //       id: req.body.id
  //     }
  //   }).then((data) => {
  //     if (data) {
  //       res.json(data)
  //     } else {
  //       res.json({})
  //     }
  //   })
  // } else {
  //   Employee.findAll().then((employee) => {
  //     res.status(200).json(employee);
  //   });
  // }
});

module.exports = router