var express = require('express');
var app = express();
var router  = express.Router();

var gender  = require("../models/gender");
var kinks   = require("../models/kinks");
var role    = require("../models/role");
var species = require("../models/species");

/* GET index */
router.get('/', function(req, res) {
  res.render('home', {
    pageTitle: 'FAKKU Dating',
    breeds: species.getAll(),
    genders: gender.getAll(),
    kinks: kinks.getAll(),
    roles: role.getAll(),
    country: (req.get('geoip_country_code') ? req.get('geoip_country_code').toString().toLowerCase() : 'None')
  });
});

module.exports = router;