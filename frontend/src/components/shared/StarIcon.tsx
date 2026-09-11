import type { CSSProperties } from "react";

interface StarIconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** The OrbitOne mark — a four-point star. Used for the logo, cursor, and AI-related UI. */
export function StarIcon({ size = 16, className, style }: StarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 0C12.6 6.4 13.2 10.8 17.6 12C13.2 13.2 12.6 17.6 12 24C11.4 17.6 10.8 13.2 6.4 12C10.8 10.8 11.4 6.4 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
