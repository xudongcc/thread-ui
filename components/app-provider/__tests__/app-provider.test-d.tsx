import { createInstance } from "i18next";

import { AppProvider } from "../index";
import type { AppProviderProps } from "../index";

const i18n = createInstance();

const AppProviderApi = () => (
  <AppProvider i18n={i18n} toast={{ limit: 5, timeout: 6_000 }}>
    <div>App</div>
  </AppProvider>
);

const appProviderProps: AppProviderProps = {
  children: null,
  i18n,
  toast: {
    limit: 3,
    timeout: 5_000,
  },
};

const InheritedAppProviderApi = () => (
  <AppProvider toast={{ limit: 5 }}>
    <div>App</div>
  </AppProvider>
);

const inheritedAppProviderProps: AppProviderProps = {};

export {
  AppProviderApi,
  InheritedAppProviderApi,
  appProviderProps,
  inheritedAppProviderProps,
};
