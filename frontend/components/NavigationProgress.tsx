"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const NavigationProgress = () => (
	<ProgressBar
		height="4px"
		color="#007490"
		options={{ showSpinner: true }}
	/>
);

export default NavigationProgress;
