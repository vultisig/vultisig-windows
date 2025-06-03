import { ChildrenProp } from '../props'

type WrapProps = ChildrenProp & {
  wrap?: React.ComponentType<ChildrenProp>
}

export const Wrap = ({ children, wrap: Wrapper }: WrapProps) => {
  return Wrapper ? <Wrapper>{children}</Wrapper> : children
}
