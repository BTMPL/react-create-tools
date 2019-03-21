import React from "react";

import { Formik, Form, Field } from "formik";

import { FormField } from "components/FormField";
/* imports */

export /* notConnected */ function Step({ data = {}, children, onSubmit }) {
  return (
    <Formik
      initialValues={
        {
          /* initialValues */
        }
      }
      onSubmit={onSubmit}
      render={props => {
        const { values, handleBlur, handleChange, errors, touched } = props;

        return (
          <Form>
            /* content */
            {children({
              canGoForward: true,
              canGoBack: true
            })}
          </Form>
        );
      }}
    />
  );
}

/* connected */
