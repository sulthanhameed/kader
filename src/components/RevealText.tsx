import type { ElementType, ReactNode } from "react";

// Simple pass-through. No word-by-word animation.
interface Props {
  children: string | ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  delay?: number;
}

export default function RevealText({
  children,
  as: Tag = "h2",
  className = "",
}: Props) {
  return <Tag className={className}>{children}</Tag>;
}
