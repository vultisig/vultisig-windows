import { SVGProps } from 'react'

export type FilledIconProps = Pick<
  SVGProps<SVGSVGElement>,
  'fontSize' | 'style'
>

export type LinearIconProps = Pick<
  SVGProps<SVGSVGElement>,
  'fontSize' | 'strokeWidth' | 'style'
>
