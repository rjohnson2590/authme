var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile');
var knex = require('knex')(knexConfig);

knex('followers').where({'use_id': username}).select('followers_id').then(function(result){
      for(i=0;i<result.length;i++){
        return cache.del(result[i])
      }