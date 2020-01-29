const express = require('express');
const router = express.Router();

const custom = require('./../middleware/custom');
const Validate = require('../services/validate');


const passport = require('passport');
const path = require('path');

/* GET Heart Beat. */
router.get('/get-heart-beat-admin', function (req, res, next) {
    res.json({ status: "success", message: "Zapkart API", data: { "version_number": "v1.0.0" } })
  });