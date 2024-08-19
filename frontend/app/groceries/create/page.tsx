import GroceryDetails from "@/components/GroceryDetails";
import { Breadcrumb } from "flowbite-react";

const Page = () => (
	<div className="h-full pb-[16px] px-[16px] flex flex-col">
		<Breadcrumb className="py-[16px]">
			<Breadcrumb.Item href="/groceries">Groceries</Breadcrumb.Item>
			<Breadcrumb.Item>Create a new</Breadcrumb.Item>
		</Breadcrumb>

		<GroceryDetails />
	</div>
);

export default Page;
