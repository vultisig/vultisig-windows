import { useRive } from '@rive-app/react-canvas'

type AnimationProps = {
  stateMachines?: string
  src: string
}

export const Animation = ({ src: partialSrc, ...props }: AnimationProps) => {
  const src = `/${partialSrc}.riv`

  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    ...props,
  })

  return <RiveComponent key={src} />
}
