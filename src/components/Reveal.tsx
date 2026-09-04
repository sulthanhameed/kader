import type { ReactNode, ElementType, CSSProperties } from "react";

// Simple pass-through wrapper. No scroll animations.
interface Props {
  children: ReactNode;
  as?: ElementType;
  variant?: string;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  style?: CSSProperties;
}

export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  style,
}: Props) {
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
