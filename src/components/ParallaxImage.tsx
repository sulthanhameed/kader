// Simple image wrapper. No parallax effect.
interface Props {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  zoom?: number;
  loading?: "lazy" | "eager";
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: Props) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
