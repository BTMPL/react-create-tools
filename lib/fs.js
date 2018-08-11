const chalk = require('chalk');
const fs = require('fs');

const copyTemplate = (from, to, replace, callback) => {
  fs.readFile(from, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    Object.keys(replace).forEach(key => {
      const variable = `{${key}}`;
      data = data.replace(new RegExp(variable, 'g'), replace[key], data);
    });

    fs.writeFile(to, data, callback);
  });
}

const createTests = (folder, name, callback) => {
  fs.mkdir(`${folder}/__tests__`, err => {
    if (err) fatal(err);

    copyTemplate('templates/test.js', `${folder}/__tests__/${name}.test.js`, {
      Name: name
    }, err => {
      callback(err)
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
  createTests,
  exists
}
