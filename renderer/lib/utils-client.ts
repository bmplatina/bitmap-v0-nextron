const electronTools = window.electronTools;
const bitmapApi = window.bitmapApi;

async function csrAxiosGet<T>(
  uriSubstring: string,
  token?: string,
): Promise<T> {
  const response = await bitmapApi.axiosGet<T>(uriSubstring, token ?? "");
  return response;
}

async function csrAxiosPost<T>(
  uriSubstring: string,
  body: object,
  token: string,
): Promise<T> {
  const response = await bitmapApi.axiosPost<T>(uriSubstring, body, token);
  return response;
}

export { electronTools, bitmapApi, csrAxiosGet, csrAxiosPost };
