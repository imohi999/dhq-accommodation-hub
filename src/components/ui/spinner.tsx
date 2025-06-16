import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "muted" | "white";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4", 
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  white: "text-white"
};

export function Spinner({ 
  size = "md", 
  color = "primary", 
  className, 
  ...props 
}: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
    </div>
  );
}

// Loading wrapper component for common loading states
interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  className 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        {fallback || <Spinner size="lg" />}
      </div>
    );
  }
  
  return <>{children}</>;
}

// Overlay spinner for buttons and forms
interface SpinnerOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SpinnerOverlay({ 
  isLoading, 
  children, 
  className 
}: SpinnerOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}