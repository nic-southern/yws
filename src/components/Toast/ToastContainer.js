import Toast from "./ToastComponent";
import { useToastStateContext } from "./ToastContext";

export default function ToastContainer() {
  const { toasts } = useToastStateContext();
  return (
    <div className="absolute bottom-10 right-10 z-50 ">
      <div className="mx-auto max-w-xl">
        {toasts &&
          toasts.map((toast) => (
            <Toast
              id={toast.id}
              key={toast.id}
              type={toast.type}
              message={toast.message}
              props={toast.props}
            />
          ))}
      </div>
    </div>
  );
}
