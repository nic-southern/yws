import { any } from "zod";
import { useToastDispatchContext } from "../components/Toast/ToastContext";

export function useToast(delay: number) {
  const dispatch = useToastDispatchContext();

  function toast(
    type: "success" | "error" | "warning" | "info",
    message: string
  ) {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch
      ? {
          type: "ADD_TOAST",
          toast: {
            type,
            message,
            id,
          },
        }
      : any;

    setTimeout(() => {
      dispatch ? { type: "DELETE_TOAST", id } : any;
    }, delay);
  }

  return toast;
}
