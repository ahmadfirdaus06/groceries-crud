import { Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UseToast = (
	type: "success" | "error" | "info",
	message: string,
	callback?: Function
) => {
	return toast(message, {
		type,
		position: "top-right",
		autoClose: 2000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: false,
		draggable: false,
		progress: undefined,
		theme: "dark",
		transition: Bounce,
		onClose: () => {
			if (callback) callback();
		},
	});
};

export default UseToast;
