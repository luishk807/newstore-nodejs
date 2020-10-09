const router = require('express').Router();
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const config = require('../../config.js');

const Model = require('../../pg/models/WorkRoles');
const WorkRole = Model.getModel();

router.all('*', cors());

router.delete('/workroles/:id', (req, res, next) => {
  // delete workRoles
  WorkRole.findAll({ where: {id: req.params.id}})
  .then((status) => {
    WorkRole.destroy({
      where: {
        id: status[0].id
      }
    }).then((deletedRecord) => {
        res.status(200).json({ message: "Work role successfully deleted" });
    }, (err) => {
        res.json(err);
    })
  })
});


router.put('/workroles/:id', (req, res, next) => {

  const body = req.body;
  const pid = req.params.id;

  WorkRole.update(
    {
      'name': body.name,
    },{
      where: {
        id: pid
      }
    }
  ).then((updated) => {
    res.status(200).json({ message: "Work role successfully deleted" });
  })
});

router.post('/workroles', (req, res, next) => {
  // add / update statuses
  const body = req.body;

  WorkRole.create(
    {
      'name': body.name,
    }
  ).then((workRole) => {
    res.status(200).json(workRole);
  })
})

router.get('/workroles/:id', async(req, res, next) => {
    let workRole = await WorkRole.findAll({ where: {id: req.params.id}});
    res.json(workRole)
});

router.get('/workroles', async(req, res, next) => {
  // get statuses
  let workRole = null;
  if (req.query.id) {
    try {
      workRole = await WorkRole.findAll({ where: {id: req.query.id}});
      res.json(workRole)
    } catch(err) {
      res.send(err)
    }
  } else {
    try {
      workRole = await WorkRole.findAll();
      res.json(workRole)
    } catch(err) {
      res.send(err)
    }
  }
});

module.exports = router