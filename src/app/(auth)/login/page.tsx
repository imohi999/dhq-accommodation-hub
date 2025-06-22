"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { LoginLogo } from "@/components/LoginLogo";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();

	const handleLogin = async (username: string, password: string) => {
		setLoading(true);
		try {
			const result = await signIn(username, password);

			if (result.error) {
				// Error is already handled by the auth context with toast
				return;
			}

			if (!result.error) {
				router.push("/");
				router.refresh();
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950'>
			{/* Background pattern */}
			<div
				className='absolute inset-0 opacity-5 dark:opacity-10'
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
				}}
			/>

			<div className='relative z-10 w-full max-w-md px-4'>
				<Card className='border-zinc-800 bg-card/95 backdrop-blur-xl shadow-2xl'>
					<CardHeader className='space-y-1 pb-6'>
						<div className='flex justify-center mb-4'>
							<LoginLogo />
						</div>
						<CardTitle className='text-2xl font-bold text-center'>
							Welcome Back
						</CardTitle>
						<CardDescription className='text-center text-muted-foreground'>
							Sign in to access the DHQ Accommodation Platform
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<LoginForm onSubmit={handleLogin} loading={loading} />
					</CardContent>
				</Card>

				{/* Footer */}
				<div className='mt-8 text-center'>
					<p className='text-sm text-muted-foreground'>
						&copy; {new Date().getFullYear()} Defence Headquarters. All rights
						reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
