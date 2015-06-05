var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile');
var knex = require('knex')(knexConfig);

