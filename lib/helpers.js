const chalk = require("chalk");
const asciiFold = require("fold-to-ascii");

const fatal = str => {
  console.log(chalk.red(str));
  process.exit(1);
};

const unique = arr => [...new Set(arr)];

const toCamelCase = function(str) {
  return asciiFold
    .fold(str)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\W+/g, " ")
    .replace(/ (.)/g, function($1) {
      return $1.toUpperCase();
    })
    .replace(/ /g, "");
};

const fromCamelCase = input => {
  const letters = input.split();
  const ret = [];

  letters.forEach(letter => {
    if (letter.toUpperCase() === letter) {
      ret.push(" ");
      ret.push(letter.toUpperCase());
    } else {
      ret.push(letter);
    }
  });

  return ret.join("");
};

const toSlug = str => {
  return asciiFold
    .fold(str)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\W+/g, " ")
    .replace(/ (.)/g, function($1) {
      return "-" + $1;
    })
    .replace(/ /g, "");
};

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
  fromCamelCase,
  toSlug,
  Promisify
};
