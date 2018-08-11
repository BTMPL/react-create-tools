const chalk = require('chalk');

const fatal = (str) => {
  console.log(chalk.red(str));
  process.exit(1);
}

const toCamelCase = (input) => input.split(' ').map(s => s.substr(0, 1).toUpperCase() + s.substr(1)).join('');

module.exports = {
  fatal,
  toCamelCase
}
