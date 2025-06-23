import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartInfo {
  id: string;
  title: string;
  element: React.ReactNode;
}

interface ChartSelectionManagerProps {
  charts: ChartInfo[];
  className?: string;
  isSelectionMode: boolean;
  onSelectionModeChange: (mode: boolean) => void;
  selectedCharts: Set<string>;
  onSelectedChartsChange: (charts: Set<string>) => void;
}

export function useChartSelection(charts: ChartInfo[]) {
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(
    new Set(charts.map(c => c.id))
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handlePrint = () => {
    // Create a print-specific style
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container, #print-container * {
          visibility: visible;
        }
        #print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print-chart {
          break-inside: avoid;
          page-break-inside: avoid;
          margin-bottom: 20px;
        }
        .recharts-surface {
          overflow: visible !important;
        }
        .recharts-cartesian-axis-tick-value {
          font-size: 10px;
        }
        @page {
          size: landscape;
          margin: 0.5in;
        }
      }
    `;

    // Add print styles
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = printStyles;
    document.head.appendChild(styleSheet);

    // Print
    window.print();

    // Remove print styles after printing
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 500);
  };

  return {
    selectedCharts,
    setSelectedCharts,
    isSelectionMode,
    setIsSelectionMode,
    handlePrint
  };
}

export function ChartSelectionManager({ 
  charts, 
  className,
  isSelectionMode,
  onSelectionModeChange,
  selectedCharts,
  onSelectedChartsChange
}: ChartSelectionManagerProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const toggleChartSelection = (chartId: string) => {
    const newSelection = new Set(selectedCharts);
    if (newSelection.has(chartId)) {
      newSelection.delete(chartId);
    } else {
      newSelection.add(chartId);
    }
    onSelectedChartsChange(newSelection);
  };

  const visibleCharts = charts.filter(chart => selectedCharts?.has(chart.id) ?? true);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Chart Selection List (when in selection mode) */}
      {isSelectionMode && (
        <Card className="p-4">
          <div className="space-y-2">
            {charts.map(chart => (
              <div key={chart.id} className="flex items-center space-x-2">
                <Checkbox
                  id={chart.id}
                  checked={selectedCharts?.has(chart.id) ?? false}
                  onCheckedChange={() => toggleChartSelection(chart.id)}
                />
                <label
                  htmlFor={chart.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {chart.title}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Display */}
      <div className="grid gap-6 md:grid-cols-2 print:block">
        {visibleCharts.map(chart => (
          <div
            key={chart.id}
            className={cn(
              'relative group',
              isSelectionMode && 'ring-2 ring-offset-2 ring-primary/50 rounded-lg p-2'
            )}
          >
            {isSelectionMode && (
              <div className="absolute top-2 right-2 z-10">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => toggleChartSelection(chart.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="print-chart">
              {chart.element}
            </div>
          </div>
        ))}
      </div>

      {/* Hidden print container */}
      <div
        ref={printRef}
        id="print-container"
        className="hidden print:block"
      >
        <div className="space-y-6">
          {visibleCharts.map(chart => (
            <div key={chart.id} className="print-chart">
              <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
              {chart.element}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}