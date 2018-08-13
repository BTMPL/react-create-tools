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
            pageSize: 10,
            choices: [
              { name: 'Form > Button', value: `import Button from '@nta/trxm-frontend-common-components/Form/Button';` },
              { name: 'Form > Input', value: `import Input from '@nta/trxm-frontend-common-components/Form/Input';` },
              { name: 'Form > Checkbox', value: `import Checkbox from '@nta/trxm-frontend-common-components/Form/Checkbox';` },
              { name: 'Form > RangePickerWithoutFields', value: `import RangePickerWithoutFields from '@nta/trxm-frontend-common-components/Form/RangePickerWithoutFields';` },
              { name: 'Form > Iban', value: `import Iban from '@nta/trxm-frontend-common-components/Form/Iban';` },
              { name: 'Form > Input', value: `import Input from '@nta/trxm-frontend-common-components/Form/Input';` },
              { name: 'Form > Radio', value: `import Radio from '@nta/trxm-frontend-common-components/Form/Radio';` },
              { name: 'Form > Select', value: `import Select from '@nta/trxm-frontend-common-components/Form/Select';` },
              { name: 'Form > SelectWithInput', value: `import SelectWithInput from '@nta/trxm-frontend-common-components/Form/SelectWithInput';` },
              { name: 'Form > Switch', value: `import Switch from '@nta/trxm-frontend-common-components/Form/Switch';` },             
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