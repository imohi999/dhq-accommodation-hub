export const chartStyles = {
  axis: {
    tick: {
      fill: "hsl(var(--foreground))",
      fontSize: 12,
      fontWeight: 500
    },
    tickLine: { 
      stroke: "hsl(var(--foreground) / 0.3)" 
    },
    axisLine: { 
      stroke: "hsl(var(--foreground) / 0.5)",
      strokeWidth: 1
    },
    label: {
      fill: "hsl(var(--foreground))",
      fontSize: 14,
      fontWeight: 600
    }
  },
  angledAxis: {
    tick: {
      fill: "hsl(var(--foreground))",
      fontSize: 12,
      fontWeight: 500
    },
    tickLine: { 
      stroke: "hsl(var(--foreground) / 0.3)" 
    },
    axisLine: { 
      stroke: "hsl(var(--foreground) / 0.5)",
      strokeWidth: 1
    },
    angle: -45,
    textAnchor: "end" as const,
    height: 80
  },
  grid: {
    stroke: "hsl(var(--foreground) / 0.1)",
    strokeDasharray: "3 3"
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "6px",
      color: "hsl(var(--foreground))",
      boxShadow: "0 2px 4px hsl(var(--foreground) / 0.1)",
      padding: "8px 12px"
    },
    itemStyle: {
      color: "hsl(var(--foreground))",
      fontSize: 12
    },
    labelStyle: {
      color: "hsl(var(--foreground))",
      fontWeight: 600,
      marginBottom: 4
    },
    cursor: {
      fill: "hsl(var(--foreground) / 0.1)"
    }
  },
  legend: {
    wrapperStyle: {
      color: "hsl(var(--foreground))"
    }
  }
};