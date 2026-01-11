import { cn } from "@/lib/utils";

interface TelegramIconProps {
  className?: string;
  size?: number;
}

export const TelegramIcon = ({ className, size = 54 }: TelegramIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 54 54"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-muted-foreground", className)}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M44.4982 9.96754C45.0542 9.73352 45.6628 9.65281 46.2606 9.73381C46.8584 9.8148 47.4236 10.0545 47.8973 10.4281C48.371 10.8016 48.7359 11.2953 48.954 11.8577C49.1722 12.4202 49.2356 13.0308 49.1377 13.626L44.0347 44.5793C43.5397 47.565 40.2637 49.2773 37.5255 47.79C35.235 46.5458 31.833 44.6288 28.773 42.6285C27.243 41.6273 22.5562 38.421 23.1322 36.1395C23.6272 34.1888 31.5022 26.8583 36.0022 22.5C37.7685 20.7878 36.963 19.8 34.8772 21.375C29.6977 25.2855 21.3817 31.2323 18.6322 32.9063C16.2067 34.3823 14.9422 34.6343 13.4302 34.3823C10.6717 33.9233 8.11345 33.2123 6.02545 32.346C3.20395 31.176 3.3412 27.297 6.0232 26.1675L44.4982 9.96754Z" />
    </svg>
  );
};
