const inquirer = require('inquirer');
const fs = require('fs');

const {
  fatal,
  Promisify
} = require('./lib/helpers');

const {
  copyTemplate,
  createTests,
  exists
} = require('./lib/fs');

const { updateNPMUI } = require('./lib/plugins/npm-update');
const { createGVOUI } = require('./lib/plugins/gvo-create');
const { createComponentUI } = require('./lib/plugins/component-create');

let gvos = [];

const bootstrap = () => {
  return Promisify((callback) => {
    fs.readdir('src/GVO', {}, callback);  
  }).then(data => {
    gvos = data;
    init();
  }).catch(fatal);
};

const init = () => {
  console.log("\n");
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do',
        choices: [
          { name: 'Create a new GVO', value: 'gvo' },
          { name: 'Create a GVO specific component', value: 'component.gvo' },
          { name: 'Create a component common for your bundle', value: 'component.common' },
          { name: 'Check @nta libraries for update', value: 'update' },
          { name: 'Quit', value: 'quit' }
        ]
      }
    ])
    .then(({ action }) => {
      if (action === 'quit') {
        process.exit(0);
      }
      else if (action === 'update') {
        updateNPMUI([
          'inquirer',
          'chalk'
        ]).then(init);
      }
      else if (action === 'gvo') {
        createGVOUI(`${__dirname}/src/GVO`).then(bootstrap);
      } else if (action === 'component.gvo') {
        inquirer.prompt([
          {
            type: 'list',
            name: 'gvo',
            message: 'Which GVO',
            choices: gvos
          }
        ]).then(({gvo}) => createComponentUI(`${__dirname}/src/GVO/${gvo}`).then(init))
      } else if (action === 'component.common') {
        createComponentUI(`${__dirname}/src`).then(init);
      }
    });
};

bootstrap();