const chalk = require('chalk');
const fs = require('fs');

const copyTemplate = (from, to, callback) => {
  fs.readFile(from, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }

    fs.writeFile(to, data, callback);
  });
}

const replaceInFile = (file, replace, callback) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }

    Object.keys(replace).forEach(key => {
      data = data.replace(new RegExp(key, 'g'), replace[key], data);
    });      

    fs.writeFile(file, data, callback);
  });  

}

const createTests = (folder, name, callback) => {
  fs.mkdir(`${folder}/__tests__`, err => {
    if (err) fatal(err);

    copyTemplate('templates/test.js', `${folder}/__tests__/${name}.test.js`, err => {

      replaceInFile(`${folder}/__tests__/${name}.test.js`, {
        '{Name}': name
      }, callback)      
    });    
  })
}

const exists = (folder, error) => {
  try {
    fs.statSync(folder);
    if(error) console.log(chalk.red(error));
    return true;
  } catch (_) {        
    return false;
  }
}

module.exports = {
  copyTemplate,
  replaceInFile,
  createTests,
  exists
}
