"use client";

import UseApi from "@/helpers/api";
import UseToast from "@/helpers/toast";
import dayjs from "dayjs";
import { Button, FloatingLabel } from "flowbite-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const GroceryDetails = (props: {
	grocery?: {
		id: number;
		brand: string;
		product_name: string;
		barcode: number;
		created_at: string;
		updated_at: string;
	};
}) => {
	const [groceryData, setGroceryData] = useState({
		brand: props.grocery?.brand,
		product_name: props.grocery?.product_name,
		barcode: props.grocery?.barcode,
		created_at: props.grocery?.created_at,
		updated_at: props.grocery?.updated_at,
	});
	const [loadingSave, setLoadingSave] = useState(false);
	const [mutateGroceryErrors, setMutateGroceryErrors] = useState(
		{} as { [key: string]: string }
	);

	const formatDate = (timestampString: string) => {
		return `${dayjs(timestampString).format("DD/MM/YYYY h:mm:ss a")}`;
	};

	const submitUpdateGrocery = async (e: FormEvent) => {
		e.preventDefault();

		setMutateGroceryErrors({});
		setLoadingSave(true);

		const { created_at, updated_at, id, ...others } = groceryData as any;

		const { success, errors, status, data } = await UseApi(
			"PUT",
			"/groceries/" + props.grocery?.id,
			others
		);

		setLoadingSave(false);

		if (!success && status === 422 && errors) {
			setMutateGroceryErrors(errors);
			return;
		}

		setGroceryData(data);

		UseToast("success", "Grocery updated.");
	};

	const router = useRouter();

	const submitCreateGrocery = async (e: FormEvent) => {
		e.preventDefault();

		setMutateGroceryErrors({});
		setLoadingSave(true);

		const { created_at, updated_at, id, ...others } = groceryData as any;

		const { success, errors, status, data } = await UseApi(
			"POST",
			"/groceries",
			others
		);

		setLoadingSave(false);

		if (!success) {
			if (status === 422 && errors) {
				setMutateGroceryErrors(errors);
			}
			return;
		}

		UseToast("success", "Grocery created.", () => {
			router.push("/groceries/" + data.id);
		});
	};

	const deleteGrocery = async () => {
		if (!confirm("Are you sure to delete grocery ?")) return;

		setLoadingSave(true);

		const { success } = await UseApi(
			"DELETE",
			"/groceries/" + props.grocery?.id
		);

		setLoadingSave(false);

		if (!success) {
			return;
		}

		UseToast("success", "Grocery deleted.", () => {
			router.replace("/groceries");
		});
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow p-[12px]">
			<form
				onSubmit={props.grocery?.id ? submitUpdateGrocery : submitCreateGrocery}
			>
				<div className="flex flex-col gap-[12px]">
					<FloatingLabel
						autoFocus={props.grocery?.id ? false : true}
						label="Product Name"
						defaultValue={groceryData.product_name}
						onChange={(e) => {
							const value = e.currentTarget?.value;
							setGroceryData(() => {
								return {
									...groceryData,
									product_name: value ?? "",
								};
							});
						}}
						variant="outlined"
						disabled={loadingSave}
						color={mutateGroceryErrors.product_name ? "error" : "default"}
						helperText={mutateGroceryErrors.product_name}
					/>
					<FloatingLabel
						label="Barcode"
						defaultValue={groceryData.barcode?.toString()}
						onChange={(e) => {
							const value = e.currentTarget?.value;
							setGroceryData(() => {
								return {
									...groceryData,
									barcode: value ? parseInt(value) : 0,
								};
							});
						}}
						variant="outlined"
						disabled={loadingSave}
						color={mutateGroceryErrors.barcode ? "error" : "default"}
						helperText={mutateGroceryErrors.barcode}
					/>
					<FloatingLabel
						label="Brand"
						defaultValue={groceryData.brand}
						onChange={(e) => {
							const value = e.currentTarget?.value;
							setGroceryData(() => {
								return {
									...groceryData,
									brand: value ?? "",
								};
							});
						}}
						variant="outlined"
						disabled={loadingSave}
						color={mutateGroceryErrors.brand ? "error" : "default"}
						helperText={mutateGroceryErrors.brand}
					/>
					{props.grocery?.id ? (
						<div className="flex flex-col items-end">
							<p className="text-black text-xs">
								Created on: {formatDate(groceryData.created_at as string)}
							</p>
							<p className="text-black text-xs">
								Last modified: {formatDate(groceryData.updated_at as string)}
							</p>
						</div>
					) : (
						<></>
					)}
					<div className="flex flex-col lg:flex-row justify-end gap-[8px]">
						{props.grocery?.id ? (
							<Button
								color="failure"
								disabled={loadingSave}
								className="w-full lg:w-auto"
								onClick={deleteGrocery}
							>
								Delete Grocery ?
							</Button>
						) : (
							<></>
						)}
						<Button
							type="submit"
							disabled={loadingSave}
							className="w-full lg:w-auto"
						>
							Save
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default GroceryDetails;
