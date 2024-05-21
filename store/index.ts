import { createGlobalStore, useInitStoreToLocalStorage } from "./utils";

export const useEmailStore = createGlobalStore("email", "");
export const useIsNavBarCollapsed = createGlobalStore(
  "isNavBarCollapsed",
  false
);
export const useJwtStore = createGlobalStore("jwt", "");
export const useLoggedInStore = createGlobalStore("loggedIn", false);
export const useNotificationPushedStore = createGlobalStore(
  "notificationPushed",
  false
);

export function useInitStores() {
  useInitStoreToLocalStorage("email", useEmailStore);
  useInitStoreToLocalStorage("jwt", useJwtStore);
  useInitStoreToLocalStorage("loggedIn", useLoggedInStore);
  useInitStoreToLocalStorage("notificationPushed", useNotificationPushedStore);
}
