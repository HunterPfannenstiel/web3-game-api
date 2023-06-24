import { RequestHandler } from "express";
import { body } from "express-validator";

export const validateConfirmPassword: RequestHandler = body("confirmPassword")
  .exists()
  .withMessage("Please type your password again in the confirmation field.")
  .custom((value, { req }) => value === req.body.password)
  .withMessage("Confirm password and original password do not match.");

export const validatePasswordLength: RequestHandler = body("password")
  .custom((val) => {
    const strippedPassword = val.replaceAll(" ", "");
    return strippedPassword === val;
  })
  .withMessage("Please do not include whitespace in your password.")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long");

export const validateUserName: RequestHandler = body("userName")
  .exists()
  .withMessage("Plase type a user name.")
  .custom((val) => {
    const trimmedUserName = val.trim();
    return trimmedUserName === val;
  })
  .withMessage(
    "Please only put white space between characters and not at the end or beginning of the user name."
  )
  .isLength({ min: 1, max: 30 })
  .withMessage(
    "Please create a user name with at least one character and at most 30 characters"
  );
