import { Response } from "express";
import { ServerError } from "../custom-objects/ServerError";
import { QueryResult } from "pg";

export const getMinutesAndSeconds = (seconds: number) => {
  const minutesWithDecimal = seconds / 60;
  const wholeMinutes = Math.floor(minutesWithDecimal);
  const wholeSeconds = Math.round(60 * (minutesWithDecimal % 1));
  return { wholeMinutes, wholeSeconds };
};

export const typeCheck = (
  type: "string" | "number" | "object",
  ...variables: { name: string; value: any }[]
) => {
  variables.forEach((variable) => {
    if (typeof variable.value !== type) {
      throw new ServerError(
        `Variable [${variable.name}] is not of type ${type}. Value received: ${variable.value}`,
        400
      );
    }
  });
};

export const optionalStringCheck = (...variables: any) => {
  variables.forEach((variable: any) => {
    variable = parseUndefinedToNull(variable);
    if (typeof variable !== "string" && !!variable) {
      throw new ServerError(
        `Variable is not a valid type, variable value received: ${variable}`,
        400
      );
    }
  });
};

export const parseUndefinedToNull = (value: any) => {
  if (value === "undefined" || value === "null") return null;
  return value;
};

export const setCookie = (
  res: Response,
  cookieName: string,
  cookieValue: string,
  expires: Date,
  path?: string
) => {
  let cookie = `${cookieName}=${cookieValue}; HttpOnly; expires=${expires.toUTCString()}`;
  if (path) cookie += `; path=${path}`;
  res.setHeader("set-cookie", cookie);
};

export const addTimeToCurrentDate = (
  timeScale: "Minutes" | "Days",
  value: number
) => {
  switch (timeScale) {
    case "Minutes":
      return new Date(new Date().getTime() + value * 60000);
    case "Days":
      const date = new Date();
      date.setDate(date.getDate() + value);
      return date;
  }
};

export const checkRowLength = (res: QueryResult<any>) => {
  if (res.rows.length < 1) {
    throw new ServerError("Item not found in the database", 400);
  }
};
