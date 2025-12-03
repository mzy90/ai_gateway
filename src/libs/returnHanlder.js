export function returnSuccess(data) {
  return {
    status: 200,
    message: "success",
    data: data,
  };
}

export function returnError(content) {
  return {
    status: 500,
    message: content,
    data: [],
  };
}
