const chalk = require("chalk");
const prettier = require("prettier");
const fs = require("fs");

const readFile = file => {
  return fs.readFileSync(file, "utf8");
};

const writeFile = (file, content, usePrettier = true) => {
  return fs.writeFileSync(
    file,
    usePrettier ? prettier.format(content, { parser: "babel" }) : content,
    "utf8"
  );
};

const createFolder = path => fs.mkdirSync(path, { recursive: true });

const createTests = (folder, name, callback) => {
  fs.mkdir(`${folder}/__tests__`, err => {
    if (err) fatal(err);

    copyTemplate(
      "templates/test.js",
      `${folder}/__tests__/${name}.test.js`,
      err => {
        replaceInFile(
          `${folder}/__tests__/${name}.test.js`,
          {
            "{Name}": name
          },
          callback
        );
      }
    );
  });
};

const exists = (folder, error) => {
  try {
    fs.statSync(folder);
    if (error) console.log(chalk.red(error));
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  createTests,
  exists,
  createFolder,
  readFile,
  writeFile
};
