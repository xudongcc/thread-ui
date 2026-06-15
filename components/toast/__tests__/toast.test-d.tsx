import { ToastProvider, toast } from "../index";
import type { ToastProviderProps } from "../index";

const ToastProviderApi = () => (
  <ToastProvider closeButton richColors position="top-right">
    <div>App</div>
  </ToastProvider>
);

const toastProviderProps: ToastProviderProps = {
  children: null,
  position: "bottom-center",
};

toast("Event has been created.");
toast.success("Saved.");
toast.info("Heads up.");
toast.warning("Be careful.");
toast.error("Something went wrong.");

export { ToastProviderApi, toastProviderProps };
