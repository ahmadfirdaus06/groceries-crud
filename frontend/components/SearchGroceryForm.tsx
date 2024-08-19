"use client";

import classNames from "classnames";
import { Button, FloatingLabel } from "flowbite-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchGroceryForm(
	props: {
		errors?: { [key: string]: string };
		searchIsLoading: boolean;
	} & React.HtmlHTMLAttributes<HTMLDivElement>
) {
	const [searchParams, setSearchParams] = useState({
		product_name: "",
		brand: "",
	});

	const router = useRouter();
	const pathname = usePathname();
	const queryParams = useSearchParams();

	const submitSearch = (e: FormEvent) => {
		e.preventDefault();
		const currentSearchParams = {
			brand: queryParams.get("brand"),
			product: queryParams.get("product"),
			sort_by: queryParams.get("sort_by"),
		} as any;

		Object.keys(currentSearchParams).forEach((key) => {
			if (!currentSearchParams[key]) {
				delete currentSearchParams[key];
			}
		});

		const params = new URLSearchParams({
			...currentSearchParams,
			...searchParams,
		}).toString();
		router.push(pathname + "?" + params);
	};

	return (
		<div
			className={classNames(
				props.className?.split(" "),
				"p-[12px] bg-white border border-gray-200 rounded-lg shadow"
			)}
		>
			<form onSubmit={submitSearch}>
				<div className="flex flex-col lg:flex-row lg:gap-[12px] gap-[8px] mb-[8px]">
					<div className="flex-1">
						<FloatingLabel
							variant="outlined"
							label="Product Name"
							defaultValue={queryParams.get("product_name") ?? ""}
							onChange={(e) => {
								const value = e.currentTarget?.value;
								setSearchParams({
									...searchParams,
									product_name: value ?? "",
								});
							}}
							helperText={props.errors?.product_name}
							color={props.errors?.product_name ? "error" : "default"}
							disabled={props.searchIsLoading}
						></FloatingLabel>
					</div>
					<div className="flex-1">
						<FloatingLabel
							variant="outlined"
							label="Brand"
							defaultValue={queryParams.get("brand") ?? ""}
							onChange={(e) => {
								const value = e.currentTarget?.value;
								setSearchParams({
									...searchParams,
									brand: value ?? "",
								});
							}}
							helperText={props.errors?.brand}
							color={props.errors?.brand ? "error" : "default"}
							disabled={props.searchIsLoading}
						></FloatingLabel>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						className="w-full lg:w-auto"
						type="submit"
						disabled={props.searchIsLoading}
					>
						Search
					</Button>
				</div>
			</form>
		</div>
	);
}
