import { useToastDispatchContext } from "../components/Toast/ToastContext";

export function useToast(delay) {
  const dispatch = useToastDispatchContext();

  function toast(type, message, onSubmit) {
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({
      type: "ADD_TOAST",
      toast: {
        type,
        message,
        id,
      },
    });

    setTimeout(() => {
      dispatch({ type: "DELETE_TOAST", id });
    }, delay);
  }

  return toast;
}
