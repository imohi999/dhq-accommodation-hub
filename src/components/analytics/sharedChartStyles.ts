// Shared chart styles for consistent appearance across all analytics pages
export const sharedAxisStyles = {
  tick: { 
    fill: 'hsl(var(--foreground))', 
    fontSize: 12,
    fontWeight: 500
  },
  axisLine: { 
    stroke: 'hsl(var(--foreground) / 0.5)',
    strokeWidth: 1
  },
  tickLine: {
    stroke: 'hsl(var(--foreground) / 0.3)'
  }
};

export const sharedGridStyles = {
  stroke: 'hsl(var(--foreground) / 0.1)',
  strokeDasharray: '3 3'
};

export const sharedTooltipStyles = {
  contentStyle: {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    color: 'hsl(var(--foreground))'
  }
};

export const sharedLegendStyles = {
  wrapperStyle: {
    color: 'hsl(var(--foreground))'
  }
};

// Helper function to determine if x-axis labels should be angled
export const getXAxisProps = (dataLength: number) => ({
  ...sharedAxisStyles,
  angle: dataLength > 5 ? -45 : 0,
  textAnchor: dataLength > 5 ? 'end' : 'middle',
  height: dataLength > 5 ? 80 : 60
});