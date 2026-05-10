import { Notification } from "./types";
import { csrAxiosGet } from "./utils-client";
import { bitmapApi } from "@/types/electron";

async function getNotifications(
  context: bitmapApi,
  token: string,
  scope: "unread" | "read" | "all",
) {
  try {
    const response = await csrAxiosGet<Notification[]>(
      context,
      "getNotifications",
      `notify/${scope}`,
      token,
    );

    return response;
    // bSetLoggedInState(true);
  } catch (error) {
    console.log(error);
  }
}

export { getNotifications };
