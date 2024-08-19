"use client";
import SearchGroceryForm from "./SearchGroceryForm";
import { Button, Dropdown, Pagination, Spinner } from "flowbite-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import UseApi from "@/helpers/api";

const Grocery = () => {
	const [searchErrors, setSearchErrors] = useState({} as any);
	const [searchLoading, setSearchLoading] = useState(false);
	const [groceriesData, setGroceriesData] = useState(
		[] as { id: number; product_name: string; brand: string; barcode: number }[]
	);
	const [paginationData, setPaginationData] = useState({
		page: 1,
		limit: 20,
		total: 0,
	});

	const params = useSearchParams();
	const router = useRouter();
	const currentPathname = usePathname();

	const getGroceries = async () => {
		if (!params.get("brand") && !params.get("product_name")) {
			return;
		}

		setSearchLoading(true);
		setSearchErrors({});
		const { status, success, data, errors, paginationRecords } = await UseApi(
			"GET",
			"/groceries?" + params.toString()
		);
		setSearchLoading(false);

		if (!success) {
			if (status === 422) {
				setSearchErrors(() => {
					return { ...searchErrors, ...errors };
				});
			}

			return;
		}

		setGroceriesData(data);
		setPaginationData({
			page: paginationRecords?.page as number,
			limit: paginationRecords?.limit as number,
			total: paginationRecords?.total as number,
		});

		return;
	};

	const onPageChange = (page: number) => {
		const newParams = new URLSearchParams({
			...Object.fromEntries(params.entries()),
			page: page.toString(),
		});

		router.push(currentPathname + "?" + newParams.toString());
	};

	const sort = (sortValue: string) => {
		const newParams = new URLSearchParams({
			...Object.fromEntries(params.entries()),
			sort_by: sortValue,
		}).toString();
		router.push(currentPathname + "?" + newParams);
	};

	const sortItems = [
		{ label: "Product Name (Ascending)", value: "product_name,asc" },
		{ label: "Product Name (Descending)", value: "product_name,desc" },
		{ label: "Brand (Ascending)", value: "brand,asc" },
		{ label: "Brand (Descending)", value: "brand,desc" },
	];

	useEffect(() => {
		getGroceries();
	}, []);

	useEffect(() => {
		getGroceries();
	}, [params]);

	return (
		<>
			<SearchGroceryForm
				errors={searchErrors}
				searchIsLoading={searchLoading}
			/>

			<div className="mt-[12px] flex flex-col gap-[8px] lg:hidden">
				{!searchLoading && groceriesData?.length ? (
					<Dropdown
						style={{ width: "100%" }}
						label={`Sort By: ${
							params.get("sort_by")
								? sortItems.find((item) => item.value === params.get("sort_by"))
										?.label
								: sortItems[0].label
						}`}
					>
						{sortItems.map((item) => (
							<Dropdown.Item key={item.value} onClick={() => sort(item.value)}>
								{item.label}
							</Dropdown.Item>
						))}
					</Dropdown>
				) : (
					<></>
				)}
				<Button href="/groceries/create" color="light">
					Create New
				</Button>
			</div>

			<div className="hidden mt-[12px] lg:flex lg:justify-end gap-[8px]">
				{!searchLoading && groceriesData?.length ? (
					<Dropdown
						label={`Sort By: ${
							params.get("sort_by")
								? sortItems.find((item) => item.value === params.get("sort_by"))
										?.label
								: sortItems[0].label
						}`}
					>
						{sortItems.map((item) => (
							<Dropdown.Item key={item.value} onClick={() => sort(item.value)}>
								{item.label}
							</Dropdown.Item>
						))}
					</Dropdown>
				) : (
					<></>
				)}
				<Button href="/groceries/create" color="light">
					Create New
				</Button>
			</div>

			{!searchLoading ? (
				groceriesData?.length ? (
					<div className="flex h-full flex-grow-1 overflow-y-auto flex-col gap-[8px] mt-[12px]">
						{groceriesData.map((data) => (
							<div
								key={data.id}
								className="text-black p-[12px] bg-white border border-gray-200 rounded-lg shadow flex justify-end items-center"
								data-ripple-light="true"
							>
								<div className="flex-1">
									<p className="font-bold">
										{data.product_name} | {data.barcode}
									</p>
									<p>{data.brand}</p>
								</div>
								<Button href={"/groceries/" + data.id}>View</Button>
							</div>
						))}
					</div>
				) : (
					<div className="min-h-[300px] flex justify-center items-center">
						<p className="text-lg font-bold">No Groceries.</p>
					</div>
				)
			) : (
				<div className="flex justify-center items-center mt-[12px] min-h-[300px]">
					<Spinner />
					<h3 className="ml-2">Loading Groceries...</h3>
				</div>
			)}
			{groceriesData?.length ? (
				<>
					<div className="hidden lg:flex lg:justify-center mt-[12px] pb-[8px] bg-cyan-700 border border-transparent rounded-lg shadow">
						<Pagination
							currentPage={
								params.get("page")
									? parseInt(params.get("page") as string)
									: paginationData.page
							}
							totalPages={Math.floor(
								paginationData.total / paginationData.limit
							)}
							onPageChange={onPageChange}
						/>
					</div>

					<div className="lg:hidden pb-[8px] bg-cyan-700 border border-transparent rounded-lg shadow mt-[12px] flex justify-center ">
						<Pagination
							layout="navigation"
							currentPage={
								params.get("page")
									? parseInt(params.get("page") as string)
									: paginationData.page
							}
							totalPages={Math.floor(
								paginationData.total / paginationData.limit
							)}
							onPageChange={onPageChange}
						/>
					</div>
				</>
			) : (
				<></>
			)}
		</>
	);
};

export default Grocery;
