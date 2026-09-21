import { ToastProvider, toast } from "../index";
import type { ToastProviderProps } from "../index";

const ToastProviderApi = () => (
  <ToastProvider limit={5} timeout={6_000}>
    <div>App</div>
  </ToastProvider>
);

const toastProviderProps: ToastProviderProps = {
  children: null,
  limit: 3,
  timeout: 5_000,
};

const toastId = toast.add({ title: "Event has been created." });

toast.add({ title: "Saved.", type: "success" });
toast.add({ title: "Heads up.", type: "info" });
toast.add({ title: "Be careful.", type: "warning" });
toast.add({ title: "Something went wrong.", type: "error" });
toast.update(toastId, { description: "The event is ready." });
toast.close(toastId);
toast.promise(Promise.resolve("saved"), {
  loading: "Saving...",
  success: (result) => `Result: ${result}`,
  error: "Could not save",
});

export { ToastProviderApi, toastProviderProps };
