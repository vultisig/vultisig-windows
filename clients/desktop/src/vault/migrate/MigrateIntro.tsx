import { OnFinishProp } from '@lib/ui/props'

export const MigrateIntro = ({ onFinish }: OnFinishProp) => {
  return (
    <div>
      <h1>Migrate Intro</h1>
      <button onClick={onFinish}>Finish</button>
    </div>
  )
}
