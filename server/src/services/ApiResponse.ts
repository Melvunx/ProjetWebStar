import { Response } from "express";
import {
  HandleResponseError,
  HandleResponseSuccess,
} from "../utils/HandleResponse";

class ApiResponse {
  constructor() {}

  success(
    res: Response,
    status: "Ok" | "Created",
    data?: any,
    message = "Request succeded !"
  ) {
    let code: number;

    if (status === "Created") code = 201;
    else code = 200;

    res.status(code).json(HandleResponseSuccess(data, message));
    return;
  }

  error(
    res: Response,
    status:
      | "Internal Server Error"
      | "Unautorized"
      | "Not Found"
      | "Bad Request",
    message = "Request failed !",
    error?: any
  ) {
    let code: number;
    switch (status) {
      case "Bad Request":
        code = 400;
        break;
      case "Unautorized":
        code = 401;
        break;
      case "Not Found":
        code = 404;
        break;
      default:
        code = 500;
        break;
    }

    res.status(code).json(HandleResponseError(error, message));
    return;
  }
}
