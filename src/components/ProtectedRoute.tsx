"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { LoadingState } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return; // Do nothing while loading
		if (!session) router.push("/login"); // Redirect if not authenticated
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className='min-h-screen flex items-center justify-center bg-[#1B365D]'>
				<LoadingState
					isLoading={true}
					fallback={<div className='text-white text-xl'>Loading...</div>}>
					{null}
				</LoadingState>
			</div>
		);
	}

	if (!session) {
		return null; // Return null while redirecting
	}

	return <>{children}</>;
};

export default ProtectedRoute;
