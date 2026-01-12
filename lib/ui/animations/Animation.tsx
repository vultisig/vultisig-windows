import { useRive } from '@rive-app/react-webgl2'

type AnimationProps = {
  stateMachines?: string
  src: string
}

export const Animation = ({ src, ...props }: AnimationProps) => {
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    ...props,
  })

  return <RiveComponent key={src} />
}
