const inquirer = require("inquirer");
const chalk = require("chalk");

const { copyTemplate, createTests, exists } = require("./lib/fs");

const init = () => {
  console.log("\n");
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What do you want to do",
        choices: [
          { name: "Create a new journey", value: "starter" },
          { name: "Quit", value: "quit" }
        ]
      }
    ])
    .then(({ action }) => {
      if (action === "quit") {
        process.exit(0);
      } else if (action === "starter") {
        const action = require("./lib/plugins/starter").default;
        action().then(init);
      }
    })
    .catch(err => {
      if (err) console.log(chalk.red(err));
      init();
    });
};

init();
