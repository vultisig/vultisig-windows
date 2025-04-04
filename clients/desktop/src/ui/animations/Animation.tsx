import { ValueProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'

export const Animation = ({ value }: ValueProp<string>) => {
  const { RiveComponent } = useRive({
    src: `/assets/animations/${value}.riv`,
    autoplay: true,
  })

  return <RiveComponent key={value} />
}
