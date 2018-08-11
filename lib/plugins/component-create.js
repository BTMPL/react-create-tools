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

const createComponentUI = (folder) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Type of component',
        choices: [
          { value: 'component', name: 'Plain React component' },
          { value: 'container', name: 'Container - connected to Redux' }
        ]
      },
      {
        type: 'input',
        name: 'name',
        message: 'Name of the component',
        validate: (input) => input.length !== 0,
        transformer: (input) => toCamelCase(input)
      }
    ]).then(({type, name}) => {   
      name = toCamelCase(name);   
      if(exists(`${folder}/${type}s/${name}`, `A component with the name already exists.`)) return reject();
  
      if(!exists(`${folder}/${type}s`)) fs.mkdirSync(`${folder}/${type}s`);  
  
      fs.mkdir(`${folder}/${type}s/${name}`, (err) => {
        if (err) return reject(err);
  
        copyTemplate(`${__dirname}/../../templates/${type}.js`, `${folder}/${type}s/${name}/${name}.js`, (err) => {
          if (err) return reject(err);

          replaceInFile(`${folder}/__tests__/${name}.test.js`, {
            '{Name}': name
          }, (err) => {
            createTests(`${folder}/${type}s/${name}`, name, (err) => {
              if (err) return reject(err);
    
              console.log(chalk.green(`Component ${name} was created.`) );
              return resolve([{
                file: `${folder}/${type}s/${name}/${name}.js` 
              }]);
            });
          })          
        });
      })
    });
  })
}

module.exports = {
  createComponentUI
}