import GroceryDetails from "@/components/GroceryDetails";
import UseApi from "@/helpers/api";
import { Breadcrumb } from "flowbite-react";
import { Metadata } from "next";

const metadata: Metadata = {
	title: "",
};

const Page = async ({ params }: { params: { id: string } }) => {
	const { success, status, data } = await UseApi(
		"GET",
		"/groceries/" + params.id,
		{},
		true
	);
	return (
		<div className="h-full pb-[16px] px-[16px] flex flex-col">
			<Breadcrumb className="py-[16px]">
				<Breadcrumb.Item href="/groceries">Groceries</Breadcrumb.Item>
				<Breadcrumb.Item>View and Update Grocery</Breadcrumb.Item>
			</Breadcrumb>

			<GroceryDetails grocery={data} />
		</div>
	);
};

export { metadata };

export default Page;
