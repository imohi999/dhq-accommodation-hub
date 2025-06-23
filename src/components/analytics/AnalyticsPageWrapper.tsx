import React, { ReactNode, useState } from "react";
import { ChartSelectionManager } from "./ChartSelectionManager";

interface AnalyticsChart {
	id: string;
	title: string;
	element: ReactNode;
}

interface AnalyticsPageWrapperProps {
	title: string;
	summaryCards?: ReactNode;
	children: ReactNode;
}

export function AnalyticsPageWrapper({
	title,
	summaryCards,
	children,
}: AnalyticsPageWrapperProps) {
	const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
	const [isSelectionMode, setIsSelectionMode] = useState(false);

	// Extract charts from children
	const extractChartsFromChildren = (children: ReactNode): AnalyticsChart[] => {
		const charts: AnalyticsChart[] = [];

		React.Children.forEach(children, (child, index) => {
			if (React.isValidElement(child)) {
				// Look for Cards with chart content
				if (
					child.props?.className?.includes("chart") ||
					child.type?.toString().includes("Card")
				) {
					const title =
						child.props?.title ||
						child.props?.children?.props?.title ||
						`Chart ${index + 1}`;

					charts.push({
						id: `chart-${index}`,
						title: typeof title === "string" ? title : `Chart ${index + 1}`,
						element: child,
					});
				}
			}
		});

		return charts;
	};

	const charts = extractChartsFromChildren(children);

	// Initialize selected charts with all charts
	React.useEffect(() => {
		if (charts.length > 0 && selectedCharts.size === 0) {
			setSelectedCharts(new Set(charts.map((c) => c.id)));
		}
	}, [charts, selectedCharts]);

	return (
		<div className='p-8 space-y-8'>
			<h1 className='text-3xl font-bold'>{title}</h1>

			{summaryCards && <div className='mb-8'>{summaryCards}</div>}

			{charts.length > 0 ? (
				<ChartSelectionManager
					charts={charts}
					isSelectionMode={isSelectionMode}
					onSelectionModeChange={setIsSelectionMode}
					selectedCharts={selectedCharts}
					onSelectedChartsChange={setSelectedCharts}
				/>
			) : (
				<div>{children}</div>
			)}
		</div>
	);
}
