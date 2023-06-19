import { setCookie, typeCheck } from "../../../utils";
import { RequestHandler } from "express";
import { loginUser } from "./utils";

const controller = {} as {
  postLogin: RequestHandler;
};

controller.postLogin = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    typeCheck(
      "string",
      { name: "userName", value: userName },
      { name: "password", value: password }
    );
    const { jwt, isNew } = await loginUser(userName, password);
    setCookie(res, "session", jwt, new Date(new Date().getDay() + 3));
    return res.status(200).end();
  } catch (error) {
    next(error);
  }
};

export default controller;
