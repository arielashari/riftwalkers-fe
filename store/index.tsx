import {UIStore} from "./ui";
import {AuthStore} from "@/store/auth";

export const store = {
  ui: new UIStore(),
  auth: new AuthStore(),
};
