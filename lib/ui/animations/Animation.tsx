import { ValueProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'

type AnimationProps = ValueProp<string> & {
  stateMachines?: string
}

export const Animation = ({ value, ...props }: AnimationProps) => {
  const { RiveComponent } = useRive({
    src: `/assets/animations/${value}.riv`,
    autoplay: true,
    ...props,
  })

  return <RiveComponent key={value} />
}
