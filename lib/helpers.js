const chalk = require("chalk");

const fatal = str => {
  console.log(chalk.red(str));
  process.exit(1);
};

const unique = arr => [...new Set(arr)];

const toCamelCase = input =>
  input
    .split(" ")
    .map(s => s.substr(0, 1).toUpperCase() + s.substr(1))
    .join("");

const Promisify = func => {
  return new Promise((resolve, reject) => {
    func((err, data) => {
      if (typeof data !== "undefined") {
        if (data) resolve(data);
        else reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  unique,
  fatal,
  toCamelCase,
  Promisify
};
