import { createInstance } from "i18next";

import { AppProvider } from "../index";
import type { AppProviderProps } from "../index";

const i18n = createInstance();

const AppProviderApi = () => (
  <AppProvider i18n={i18n} toast={{ closeButton: true, position: "top-right" }}>
    <div>App</div>
  </AppProvider>
);

const appProviderProps: AppProviderProps = {
  children: null,
  i18n,
  toast: {
    richColors: true,
    position: "bottom-center",
  },
};

export { AppProviderApi, appProviderProps };
