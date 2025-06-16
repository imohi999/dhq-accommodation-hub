"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import * as React from "react";
import ToastProvider from "../contexts/ToastProvider";

export function Providers({
	children,
	session,
}: {
	children: React.ReactNode;
	session?: Session | null;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
					},
				},
			})
	);

	return (
		<SessionProvider session={session} refetchInterval={0}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute='class'
					defaultTheme='light'
					enableSystem
					disableTransitionOnChange>
					{children}
					<ToastProvider />
				</ThemeProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</SessionProvider>
	);
}
