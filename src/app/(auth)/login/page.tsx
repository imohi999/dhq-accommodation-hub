"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoginForm } from "@/components/LoginForm";
import { LoginLogo } from "@/components/LoginLogo";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleLogin = async (username: string, password: string) => {
		setLoading(true);
		try {
			// Use NextAuth signIn with the credentials provider
			const result = await signIn("credentials", {
				username: username,
				password: password,
				redirect: false,
				callbackUrl: "/",
			});

			if (result?.error) {
				throw new Error(result.error);
			}

			if (result?.ok) {
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
		<div className='min-h-screen flex items-center justify-center bg-muted/50 dark:bg-gray-900'>
			<div className='max-w-md w-full space-y-8 p-8'>
				<div className='text-center'>
					<LoginLogo />
					<h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>
						Sign in to your account
					</h2>
				</div>
				<LoginForm onSubmit={handleLogin} loading={loading} />
			</div>
		</div>
	);
}
