const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

const {
  toCamelCase,
} = require('../helpers');

const {
  exists,
  copyTemplate,
  replaceInFile,
  createTests
} = require('../fs');

const createGVOUI = (folder) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name of the GVO',
        validate: (input) => input.length !== 0,
        transformer: (input) => toCamelCase(input)
      }
    ]).then(({type, name}) => {   
      name = toCamelCase(name);   
      if(exists(`${folder}/${name}`, `A GVO with the name already exists.`)) return reject();
      fs.mkdir(`${folder}/${name}`, (err) => {
        if (err) return reject(err);
  
        copyTemplate(`${__dirname}/../../templates/gvo.index.js`, `${folder}/${name}/index.js`, (err) => {
          if (err) return reject(err);

          replaceInFile(`${folder}/${name}/index.js`, {
            '{Name}': name
          }, (err) => {
            if (err) return reject(err);

            copyTemplate(`${__dirname}/../../templates/gvo.js`, `${folder}/${name}/${name}.js`, (err) => {
              if (err) return reject(err);

              replaceInFile(`${folder}/${name}/${name}.js`, {
                '{Name}': name
              }, (err) => {
                if (err) return reject(err);

                createTests(`${folder}/${name}`, name, (err) => {
                  if (err) return reject(err);
      
                  console.log(chalk.green(`A GVO named ${name} was created.`));
                  return resolve([{
                    file: `${folder}/${name}/${name}.js`
                  }]);            
                });                
              })
            });
          })
        });      
      })
    });
  })
}

module.exports = {
  createGVOUI
};