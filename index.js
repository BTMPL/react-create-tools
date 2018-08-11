const inquirer = require('inquirer');
const chalk = require('chalk');
const child_process = require('child_process');
const fs = require('fs');

const {
  fatal,
  toCamelCase
} = require('./lib/helpers');

const {
  copyTemplate,
  createTests,
  exists
} = require('./lib/fs');

let gvos = [];
const bootstrap = () => {
  fs.readdir('src/GVO', {}, (err, data) => {
    if (err) {
      fatal(err);
    } else {
      gvos = data;
      init();      
    }
  })  
}




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
        updateUI();
      }
      else if (action === 'gvo') {
        createGVOUI();
      } else if (action === 'component.gvo') {
        inquirer.prompt([
          {
            type: 'list',
            name: 'gvo',
            message: 'Which GVO',
            choices: gvos
          }
        ]).then(({gvo}) => {
          createComponentUI(`${__dirname}/src/GVO/${gvo}`)
        })
      } else if (action === 'component.common') {
        createComponentUI(`${__dirname}/src`)
      }
    });
}

const updateUI = () => {
  console.log('This will take a while ...');
  child_process.exec('npm show react version', (err, commonVersion) => {
    if (err) fatal(err);

    child_process.exec('npm show react version', (err, coreVersion) => {
      if (err) fatal(err);

      const package = require('./package.json');
      const installedCommon = (package.dependencies['@nta/trxm-frontend-react-common-components'] || package.devDependencies['@nta/trxm-frontend-react-common-components'] || '0.0.0').replace('^', '');
      const installedCore = (package.dependencies['@nta/trxm-frontend-react-core'] || package.devDependencies['@nta/trxm-frontend-react-core'] || '0.0.0').replace('^', '');

      if (installedCore !== coreVersion || installedCommon !== commonVersion) {
        if (installedCommon !== commonVersion.trim()) console.log(chalk.red(`common-components; installed ${installedCommon}, latest ${commonVersion.trim()}`))
        if (installedCore !== coreVersion.trim()) console.log(chalk.red(`core is outdated; installed ${installedCore}, latest ${coreVersion.trim()}`))
        inquirer.prompt([
          {
            type: 'list',
            name: 'update',
            message: 'Do you want to update the dependencies?',
            choices: [
              { value: true, name: 'Update now' },
              { value: false, name: 'Manually update later' },
            ]
          }
        ]).then(({ update }) => {
          if (update) {
            updateDo([
              `@nta/trxm-frontend-react-common-components@${commonVersion.trim()}`,
              `@nta/trxm-frontend-react-core@${coreVersion.trim()}`,
            ], init);
            
          } else {
            init();
          }
        });
      } else {
        console.log(chalk.green('All dependencies are up to date'));
        init();
      }
    });      
  })
};

const updateDo = (libraries, callback) => {
  const command = `npm install ${libraries.join(' ')} --save-dev`;
  console.log(chalk.yellow(`Running ${command}`));
  callback();
}

const createComponentUI = (folder) => {
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
    if(exists(`${folder}/${type}s/${name}`, `A component with the name already exists.`)) return init();

    if(!exists(`${folder}/${type}s`)) fs.mkdirSync(`${folder}/${type}s`);  

    fs.mkdir(`${folder}/${type}s/${name}`, (err) => {
      if (err) fatal(err);

      copyTemplate(`templates/${type}.js`, `${folder}/${type}s/${name}/${name}.js`, {
        Name: name
      }, (err) => {
        if (err) fatal(err);

        createTests(`${folder}/${type}s/${name}`, name, (err) => {
          if (err) fatal(err);

          console.log(chalk.green(`Component ${name} was created.`) );
          return bootstrap();
        });
      });
    })
  });
}

const createGVOUI = () => {
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
    if(exists(`${__dirname}/src/GVO/${name}`, `A GVO with the name already exists.`)) return init();
    fs.mkdir(`${__dirname}/src/GVO/${name}`, (err) => {
      if (err) fatal(err);

      copyTemplate(`${__dirname}/templates/gvo.index.js`, `${__dirname}/src/GVO/${name}/index.js`, {
        Name: name
      }, (err) => {
        if (err) fatal(err);

        copyTemplate(`${__dirname}/templates/gvo.js`, `${__dirname}/src/GVO/${name}/${name}.js`, {
          Name: name
        }, (err) => {
          if (err) fatal(err);

          createTests(`${__dirname}/src/GVO/${name}`, name, (err) => {
            if (err) fatal(err);

            console.log(chalk.green(`A GVO named ${name} was created.`));
            return bootstrap();            
          });
        });
      });      
    })
  });
}

bootstrap();