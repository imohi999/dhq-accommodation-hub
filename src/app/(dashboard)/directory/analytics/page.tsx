"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DirectoryAnalyticsPage() {
	const router = useRouter();
	
	useEffect(() => {
		// Redirect to the new analytics queue page
		router.replace("/analytics/queue");
	}, [router]);
	
	return null;
}