import { Inter } from "next/font/google";
import "./globals.css";
import classNames from "classnames";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavigationProgress from "@/components/NavigationProgress";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={classNames(inter.className, "bg-gray-800")}>
				<ToastContainer />
				<main>{children}</main>
				<NavigationProgress />
			</body>
		</html>
	);
}
