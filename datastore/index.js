const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////
//The fs.writeFile() method is used to asynchronously write the specified data to a file. By default, the file would be replaced if it exists. The ‘options’ parameter can be used to modify the functionality of the method.
//fs.writeFile( file, data, options, callback )
//1. we need to wait the getnextuniqueId get the results(null, countnumber), pss it in to the writefile function/
exports.create = (text, callback) => {
  var id = counter.getNextUniqueId((err, id) => {
    if (err) {
      console.log('err in create ', err);
    } else {
      var fileName = './test/testData/' + id.toString() + '.txt';
      fs.writeFile(fileName, text, (err) => {
        if (err) {
          console.log(err);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  var todos = [];
  var fileFolder = './test/testData';
  fs.readdir(fileFolder, function(err, files) {
    if (err) {
      console.log(err);
    } else {

      //first, for each file, we need generate a new promise to get the file content
      //primise.all().then(push each result into the todos);
      var results = files.map(file => {
        return new Promise((resolve, reject) => {
          fs.readFile(fileFolder + '/' + file, (err, data) => {
            if (err) {
              reject(err);
              return;
            } else {
              resolve({id: file.slice(0, 5), text: data.toString()});
            }
          });
        });
      });
      Promise.all(results).then((values) => {
        callback(null, values);
      });
    }
  });
};


exports.readOne = (id, callback) => {
  var fileFolder = './test/testData';
  fs.readdir(fileFolder, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      var found = false;
      files.forEach(file => {
        if (id === file.slice(0, 5)) {
          found = true;
          fs.readFile(fileFolder + '/' + file, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              callback(null, {id: id, text: data.toString()});
            }
          });
        }
      });
      if (!found) {
        callback('file does not exist');
      }
    }
  });
};

exports.update = (id, text, callback) => {
  var fileFolder = './test/testData';
  fs.readdir(fileFolder, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      var found = false;
      files.forEach(file => {
        if (id === file.slice(0, 5)) {
          found = true;
          fs.writeFile(fileFolder + '/' + file, text, (err) => {
            if (err) {
              console.log(err);
            } else {
              callback(null, { id, text });
            }
          });
        }
      });
      if (!found) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};

exports.delete = (id, callback) => {
  var fileFolder = './test/testData';
  fs.readdir(fileFolder, function(err, files) {
    if (err) {
      console.log(err);
    } else {
      var found = false;
      files.forEach(file => {
        if (id === file.slice(0, 5)) {
          found = true;
          fs.unlink(fileFolder + '/' + file, (err) => {
            if (err) {
              console.log(err);
            } else {
              callback();
            }
          });
        }
      });
      if (!found) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};


// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
