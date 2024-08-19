import Grocery from "@/components/Grocery";
import { Breadcrumb, Button } from "flowbite-react";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Groceries",
};

const Page = () => {
	return (
		<div className="h-full pb-[16px] px-[16px] flex flex-col">
			<Breadcrumb className="py-[16px]">
				<Breadcrumb.Item>Groceries</Breadcrumb.Item>
			</Breadcrumb>
			<Suspense>
				<Grocery />
			</Suspense>
		</div>
	);
};

export default Page;
