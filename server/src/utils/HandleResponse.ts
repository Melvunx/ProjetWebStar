export function HandleResponseSuccess(
  data?: any,
  message = "Request succeded !"
) {
  return {
    success: true,
    message,
    data: data ?? null,
  };
}

export function HandleResponseError(error?: any, message = "Request failed !") {
  const isErrorObject = error instanceof Error;
  return {
    success: false,
    message,
    error: isErrorObject
      ? error.message
      : error
      ? error
      : "An error occurred !",
    stack: isErrorObject ? error.stack : undefined,
  };
}

export const LoggedResponseSuccess = (data?: any, message?: string) =>
  console.log(HandleResponseSuccess(data, message));

export const LoggedResponseError = (error?: any) =>
  console.log(HandleResponseError(error));
