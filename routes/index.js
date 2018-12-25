var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Web Crypto API' , 
						content: 'This page is created to study the use cases of Web Crypto API'});
});

router.post('/upload0', function(req, res, next){
  var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) next(err);
        var uploadDir = path.join(__dirname, '/uploads0/' + fields.name + '__bin' );
        var data = new Uint8Array(fields.data.split(','));

        fs.writeFile(uploadDir, new Buffer(data) , (err) => {
          if (err) throw err;
          console.log(fields.name + " created - buf0");
        }); 
        
        res.end();
    });
});

router.post('/upload1', function(req, res, next){
  var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (err) next(err);
        var uploadDir = path.join(__dirname, '/uploads1/' + fields.name + '__bin' );
        var data = new Uint8Array(fields.data.split(','));

        fs.writeFile(uploadDir, new Buffer(data) , (err) => {
          if (err) throw err;
          console.log(fields.name + " created - buf1");
        }); 
        res.end();
    });
});


router.get('/files' , function(req,res,next){
  var uploadDir = path.join(__dirname, '/uploads0' );
  fs.readdir(uploadDir , function(err, items) {
    items.forEach(function(item, index, array){
      array[index] = item.replace("__bin", "");
    });
    res.render('index', { title: 'Web Crypto API' , 
            content: 'This page is created to study the use cases of Web Crypto API' ,
            files : items });
  })
  
});

router.post('/retrieve0', function(req, res, next){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) next(err);
    var uploadDir = path.join(__dirname, '/uploads0/' + fields.name + '__bin' );
    fs.readFile(uploadDir , (err, data) => {
      if (err) throw err;
      var result = new Uint8Array(data.buffer);
      res.send(result.join());
    });
  });
});

router.post('/retrieve1', function(req, res, next){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) next(err);
    var uploadDir = path.join(__dirname, '/uploads1/' + fields.name + '__bin' );
    fs.readFile(uploadDir , (err, data) => {
      if (err) throw err;
      var result = new Uint8Array(data.buffer);
      res.send(result.join());
    });
  });
});


module.exports = router;
