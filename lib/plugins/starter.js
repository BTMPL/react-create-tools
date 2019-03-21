const child_process = require("child_process");
const inquirer = require("inquirer");
const chalk = require("chalk");

const { Promisify, unique } = require("../helpers");
const { readFile, writeFile } = require("../fs");

const components = require("./components/index.js");

async function init() {
  const pages = [];
  const formSteps = [];
  const { wantContentPages } = await inquirer.prompt([
    {
      type: "list",
      name: "wantContentPages",
      message:
        "Do you want to generate content pages (e.g. contact, terms and conditions)?",
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      default: true
    }
  ]);

  if (wantContentPages) {
    const { numberContentPages } = await inquirer.prompt([
      {
        type: "number",
        name: "numberContentPages",
        message:
          "How many content pages do you need? You can add more in the future by creating additional files."
      }
    ]);

    for (let i = 0; i < parseInt(numberContentPages, 10); i++) {
      const { pageName } = await inquirer.prompt([
        {
          type: "input",
          name: `pageName`,
          message: `Name of the ${i +
            1} page (leave blank to stop adding pages).`
        }
      ]);

      if (!pageName) break;

      const { url } = await inquirer.prompt([
        {
          type: "input",
          name: `url`,
          message: `URL part (e.g. "contact") of the ${i + 1} page`,
          validate: v => {
            if (!v) {
              return "Please enter a proper value.";
            }
            if (v.indexOf("/") > -1) {
              return "The URL shold not contain sub-folders, all pages are generated on root level.";
            }
            return true;
          }
        }
      ]);

      if (pages.find(page => page.url === url)) {
        i--;
        new inquirer.ui.BottomBar().log.write(
          `You've already defined a page for the "${url}" URL - please define another.`
        );
        continue;
      }

      pages.push({
        pageName,
        url
      });
    }
  }

  const { wantFormSteps } = await inquirer.prompt([
    {
      type: "list",
      name: "wantFormSteps",
      message: "Do you want to generate form steps?",
      choices: [{ name: "Yes", value: true }, { name: "No", value: false }],
      default: true
    }
  ]);

  if (wantFormSteps) {
    const { numberFormSteps } = await inquirer.prompt([
      {
        type: "number",
        name: "numberFormSteps",
        message:
          "How many form steps do you need? You can add more in the future by creating additional files."
      }
    ]);

    for (let i = 0; i < parseInt(numberFormSteps, 10); i++) {
      const { stepName } = await inquirer.prompt([
        {
          type: "input",
          name: `stepName`,
          message: `Name of the ${i + 1} step (leave blank to skip)`
        }
      ]);

      if (!stepName) continue;

      let stepContent = [];

      const choices = [
        { name: "Custom form step", value: "custom" },
        i > 0 ? { name: "Copy previous step", value: "copy" } : undefined,
        { name: "Empty, template step", value: "template" }
      ].filter(i => i);

      const { stepType } = await inquirer.prompt([
        {
          type: "list",
          name: "stepType",
          message:
            "Do you want to configure this step (add custom form fields), or use an empty, template step?",
          choices: choices
        }
      ]);

      if (stepType === "custom") {
        let type, ui;
        do {
          const result = await inquirer.prompt([
            {
              type: "list",
              name: "type",
              message: "Select a component to add",
              choices: [
                ...components.ui,
                { name: "Business logic component", value: "business-logic" },
                { name: "Finish creating step", value: "done" }
              ]
            }
          ]);
          type = result.type;

          if (type === "done") {
            break;
          } else if (type === "business-logic") {
            const result2 = await inquirer.prompt([
              {
                type: "list",
                name: "type",
                message: "Select a business logic component to add",
                choices: [
                  ...components.business,
                  { name: "Back", value: "skip" }
                ]
              }
            ]);

            type = result2.type;
            if (type === "skip") continue;
            ui = components.business.find(component => component.value == type)
              .ui;
          } else {
            ui = components.ui.find(component => component.value == type).ui;
          }

          stepContent.push({
            ...(await ui())
          });
        } while (type !== "done");
      } else if (stepType === "copy") {
        stepContent = formSteps[formSteps.length - 1].stepContent;
      }

      formSteps.push({
        stepName,
        isTemplate: stepType === "template",
        stepContent
      });
    }
  }

  if (pages.length !== 0) {
    pages.map(page => {
      const content = readFile(
        __dirname + "/components/templates/contentPage.js"
      ).replace("/* title */", page.pageName);
      writeFile(__dirname + "/../../src/Pages/" + page.url + ".js", content);
    });
  }

  if (formSteps.length !== 0) {
    formSteps.map((step, index) => {
      const content = readFile(__dirname + "/components/templates/formStep.js")
        .replace(
          "/* imports */",
          unique(
            step.stepContent
              .filter(content => content.import)
              .map(content => [].concat(content.import).join("\n"))
          ).join("")
        )
        .replace(
          "/* initialValues */",
          step.stepContent
            .filter(content => content.formikKey)
            .map(
              content => `${content.formikKey}: data.${content.formikKey} || ''`
            )
        )
        .replace(
          "/* content */",
          step.stepContent
            .filter(content => content.jsx)
            .map(content => `<div className="content">${content.jsx}</div>`)
            .join("")
        )
        .replace("/* connected */", "")
        .replace("/* notConnected */", "default");

      writeFile(
        __dirname + "/../../src/Form/Step" + (index + 1) + "/index.js",
        content
      );
    });
  }
}

module.exports = {
  default: init
};
