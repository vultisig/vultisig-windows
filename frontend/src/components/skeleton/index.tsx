import './skeleton.styled.css';

type SkeletonProps = {
  height: string;
  width?: string;
};

export default function Skeleton({ height, width = '100%' }: SkeletonProps) {
  return (
    <span
      className={`skeleton after:animate-wave block bg-background-skeleton rounded-[8px] relative overflow-hidden`}
      style={{
        height,
        width,
        transformOrigin: '0 55%',
        WebkitMaskImage: '-webkit-linear-gradient(white, white)',
      }}
    />
  );
}
