import axios, { AxiosError } from "axios";
import UseToast from "./toast";
import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

const UseApi = async (
	method: "GET" | "POST" | "PUT" | "DELETE",
	url: string,
	data?: any,
	server?: boolean
): Promise<{
	errors?: { [key: string]: string };
	success: boolean;
	data?: any;
	status: number;
	message?: string;
	paginationRecords?: { limit: number; page: number; total: number };
}> => {
	const apiResponse: {
		errors?: { [key: string]: string };
		success: boolean;
		data?: any;
		status: number;
		message?: string;
		paginationRecords?: { limit: number; page: number; total: number };
	} = { success: false, status: 500 };

	try {
		const response = await axios({
			method,
			url,
			baseURL: server ? process.env.BASE_API_URL : "/api",
			data: data ?? {},
			headers: {
				"Content-Type": "application/json",
			},
		});

		apiResponse.status = response.status;
		apiResponse.success = true;
		const { data: responseData, ...pagination } = response.data;
		apiResponse.data = responseData;
		apiResponse.paginationRecords = pagination;
	} catch (error) {
		apiResponse.success = false;
		if (error instanceof AxiosError) {
			apiResponse.message =
				error.response?.data.message ?? error.response?.statusText;

			if (error.response?.status === 422) {
				apiResponse.errors = error.response?.data.errors;
			} else {
				console.error(
					error.response?.data.message ?? error.response?.statusText
				);
			}
			apiResponse.status = error.response?.status as number;
		} else {
			console.error(error);
			apiResponse.status = 500;
			apiResponse.message = (error as any)?.message;
		}

		if (server) {
			if (apiResponse.status === 404) {
				throw notFound();
			} else {
				throw NextResponse.json(apiResponse, { status: apiResponse.status });
			}
		}

		UseToast("error", apiResponse.message as string);
	}

	return apiResponse;
};

export default UseApi;
