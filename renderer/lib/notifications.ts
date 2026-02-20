import { getApiLinkByPurpose } from "./utils";
import { Notification } from "./types";
import axios from "axios";

async function getNotifications(
  token: string,
  scope: "unread" | "read" | "all",
) {
  try {
    const response = await axios.get<Notification[]>(
      getApiLinkByPurpose(`notify/${scope}`),
      {
        timeout: 30000, // 30초 타임아웃
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
    // bSetLoggedInState(true);
  } catch (error) {
    console.log(error);
  }
}

export { getNotifications };
