const child_process = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const {
  Promisify
} = require('../helpers');

const updateNPMUI = (packages) => {
  return new Promise((resolve, reject) => {
    console.log('This will take a while ...');
    Promise.all(packages.map(package => Promisify((callback) => child_process.exec(`npm show ${package} version`, callback)).then(d => d.trim())))
    .then((latestVersions) => {
      const packageJson = require(__dirname + '/../../package.json');
      const usedVersions = packages.map(package => {
        return (packageJson.dependencies[package] || packageJson.devDependencies[package] || '0.0.0').replace('^', '');
      });

      const mismatch = latestVersions.reduce((accumulator, latestVersion, index) => {
        if (latestVersion !== usedVersions[index]) accumulator.push({
          package: packages[index],
          used: usedVersions[index],
          latestVersion
        });

        return accumulator;
      }, [])

      if (mismatch.length === 0) {
        console.log(chalk.green('All dependencies are up to date'));
        resolve();
      } else {
        console.log(chalk.red('The following libraries can be updated: '));
        mismatch.map(item => console.log(chalk.red(`${item.package} ${item.used} => ${item.latestVersion}`)))
      }
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
          updateNPM_commit(mismatch.map(item => `${item.package}@${item.latestVersion}`)).then(resolve);
        } else {
          resolve();
        }      
      })
    })
    .catch(reject);
  });
};

const updateNPM_commit = (libraries) => {
  return new Promise((resolve) => {
    const command = `npm install ${libraries.join(' ')} --save-dev`;
    console.log(chalk.yellow(`Running ${command}`));    
    resolve();
  });
}

module.exports = {
  updateNPMUI
}