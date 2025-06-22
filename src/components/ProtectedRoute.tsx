"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return; // Do nothing while loading
		if (!user) router.push("/login"); // Redirect if not authenticated
	}, [user, loading, router]);

	if (loading) {
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

	if (!user) {
		return null; // Return null while redirecting
	}

	return <>{children}</>;
};

export default ProtectedRoute;