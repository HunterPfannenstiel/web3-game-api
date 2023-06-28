import { Response } from "express";
import { ServerError } from "../custom-objects/ServerError";
import { QueryResult } from "pg";
import { PageFetch } from "@customTypes/index";

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

export const parseStringToBool = (value?: string) => {
  value = parseUndefinedToNull(value);
  if (value === "true") return true;
  if (value === "false") return false;
  return value as undefined;
};

export const typeCheckPageFetch = (pageInfo: PageFetch) => {
  typeCheck(
    "string",
    { name: "date", value: pageInfo.date },
    { name: "page", value: pageInfo.page },
    { name: "pageSize", value: pageInfo.pageSize }
  );
};

export const optionalStringCheck = (
  ...variables: { name: string; value: any }[]
) => {
  variables.forEach((variable) => {
    variable = parseUndefinedToNull(variable.value);
    if (typeof variable.value !== "string" && !!variable.value) {
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
  expires: Date | string,
  path?: string
) => {
  expires = typeof expires === "string" ? expires : expires.toUTCString();
  let cookie = `${cookieName}=${cookieValue}; HttpOnly; expires=${expires}`;
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
