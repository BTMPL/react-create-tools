const inquirer = require("inquirer");

const { toCamelCase, fromCamelCase } = require("../../helpers");

async function headline() {
  const { title, subtitle } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Main title",
      validate: v => {
        if (!v) {
          return "Please provide main title for the headline";
        }
        return true;
      }
    },
    {
      type: "input",
      name: "subtitle",
      message: "Sub title"
    }
  ]);

  return {
    import: `import { Headline } from 'components/Headline';`,
    jsx: `<Headline title={'${title}'}>${subtitle}</Headline>`
  };
}

async function modelSelect() {
  return {
    import: `import { ModelSelect } from 'components/BusinessLogic/ModelSelect';`,
    jsx: `<ModelSelect
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.model}
      error={touched.model && errors.model}
    />`
  };
}

async function input() {
  const { title } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      validate: v => {
        if (!v) {
          return "Please enter a proper value";
        }
        return true;
      },
      message: "Field title"
    }
  ]);
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      validate: v => {
        if (!v) {
          return "Please enter a proper value";
        }
        return true;
      },
      default: toCamelCase(title),
      message:
        "HTML Name (used for data structure, the value of name attribute) [" +
        toCamelCase(title) +
        "]"
    }
  ]);

  return {
    import: `import { Input } from 'components/Input';`,
    formikKey: name,
    jsx: `<FormField><label htmlFor={'${name}'}>${title}</label><Field name={'${name}'} type={'text'} component={Input} /></FormField>`
  };
}

async function radio() {
  const { name, title } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      validate: v => {
        if (!v) {
          return "Please enter a proper value";
        }
        return true;
      },
      message:
        "HTML Name (used for data structure, the value of name attribute)"
    }
  ]);

  let value,
    values = [];

  do {
    const { name } = await inquirer.prompt([
      {
        message: "Enter option name (leave blank to break)",
        name: "name",
        type: "input"
      }
    ]);
    value = name;

    if (value === "") break;

    values.push(value);
  } while (true);

  return {
    import: `import { Radio, RadioInlineContainer } from 'components/Radio';`,
    formikKey: name,
    jsx: `<FormField><Field component={RadioInlineContainer}>${values
      .map(
        value =>
          `<Radio onClick={handleChange} name={'${name}'} value={'${value}'} defaultChecked={data.${name} === '${value}'} />`
      )
      .join("")}</Field></FormField>`
  };
}

async function accordion() {
  const { title } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter title (leave empty to not add a custom heading)"
    }
  ]);

  let value,
    values = [];

  do {
    const { name } = await inquirer.prompt([
      {
        message: "Enter entry name name (leave blank to break)",
        name: "name",
        type: "input"
      }
    ]);
    value = name;

    if (value === "") break;

    values.push(value);
  } while (true);

  const imports = [`import { Accordion } from 'components/Accordion';`];

  if (title) {
    imports.push(`import { Headline } from 'components/Headline';`);
  }

  return {
    import: imports,
    jsx: `<div>${
      title ? `<Headline title={'${title}'} />` : ""
    }<Accordion>${values
      .map(
        value =>
          `<Accordion.Item title={'${value}'}><p>Lorem ipsum</p></Accordion.Item>`
      )
      .join("")}</Accordion></div>`
  };
}

const ui = [
  { name: "Headline", value: "headline", ui: headline },
  { name: "One line text field (input)", value: "input", ui: input },
  // { name: "Dropdown (select)", value: "select", ui: select},
  { name: "Single selection (radio)", value: "radio", ui: radio },
  // { name: "Multiple selection (checkbox)", value: "checkbox", ui: checkbox },
  { name: "Accordion", value: "accordion", ui: accordion }
];

const business = [
  { name: "Model select", value: "modelselect", ui: modelSelect }
];

module.exports = {
  ui,
  business
};
