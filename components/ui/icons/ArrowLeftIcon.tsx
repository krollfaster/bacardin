import { cn } from "@/lib/utils";

interface ArrowLeftIconProps {
  className?: string;
  size?: number;
}

export const ArrowLeftIcon = ({ className, size = 54 }: ArrowLeftIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground", className)}
    >
      <path
        d="M16 24L8 32M8 32L16 40M8 32H56"
        stroke="currentColor"
        strokeWidth="5.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
