const inquirer = require('inquirer');

const {
  replaceInFile
} = require('../fs');

const addComponentsUI = (files) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
      {
        type: 'list',
        name: 'add',
        message: 'Do you want to add some @nta components to the file?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false }
        ]
      }
    ]).then(({ add }) => {
      if (add) {
        return inquirer.prompt([
          {
            type: 'checkbox',
            name: 'components',
            message: 'Please select all components you want to add',
            pageSize: 5,
            choices: [
              { name: 'Form > Button', value: `import Button from '@nta/trxm-frontend-common-components/Form/Button';` },
              { name: 'Form > Input', value: `import Input from '@nta/trxm-frontend-common-components/Form/Input';` },
            ]
          }
        ]).then(({ components }) => {
          files.forEach(fileObject => {
            replaceInFile(fileObject.file, {
              '// Modules': components.join("\n")
            }, err => {
              if (err) reject();
              else resolve();
            });          
          })
        })
      } else {
        files.forEach(fileObject => {
          replaceInFile(fileObject.file, {
            '// Modules': ''
          }, err => {
            if (err) reject();
            else resolve();
          });          
        })        
      }
    })
  });
}


module.exports = {
  addComponentsUI
}