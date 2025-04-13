import { rem } from '@clients/extension/src/utils/functions'
import { FC, HTMLAttributes } from 'react'
import styled, { css, RuleSet } from 'styled-components'
import {
  alertError,
  alertErrorHover,
  alertInfo,
  alertInfoHover,
  alertSuccess,
  alertSuccessHover,
  alertWarning,
  alertWarningHover,
  buttonPrimary,
  buttonPrimaryHover,
  textPrimary,
} from '@clients/extension/src/colors'

type Shape = 'default' | 'circle' | 'round'
type Size = 'default' | 'large' | 'small'
type Status = 'default' | 'error' | 'info' | 'success' | 'warning'
type Type = 'default' | 'link' | 'primary' | 'text'

const baseStyles = css`
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  justify-content: center;
  transition: all 0.2s;
`

const blockStyles = css`
  width: 100%;
`

const ghostStyles: Record<Status, RuleSet> = {
  default: css`
    color: ${textPrimary};

    &:hover {
      color: ${buttonPrimary};
    }
  `,
  error: css`
    color: ${textPrimary};

    &:hover {
      color: ${alertError};
    }
  `,
  info: css`
    color: ${textPrimary};

    &:hover {
      color: ${alertInfo};
    }
  `,
  success: css`
    color: ${textPrimary};

    &:hover {
      color: ${alertSuccess};
    }
  `,
  warning: css`
    color: ${textPrimary};

    &:hover {
      color: ${alertWarning};
    }
  `,
}

const shapeStyles: Record<Shape, RuleSet> = {
  circle: css`
    border-radius: 50%;
  `,
  default: css`
    border-radius: ${rem(12)};
  `,
  round: css`
    border-radius: ${rem(46)};
  `,
}

const sizeStyles: Record<Size, RuleSet> = {
  default: css`
    font-size: ${rem(12)};
    font-weight: 500;
    height: ${rem(36)};
  `,
  large: css`
    font-size: ${rem(14)};
    font-weight: 600;
    height: ${rem(46)};
  `,
  small: css`
    font-size: ${rem(12)};
    font-weight: 500;
    height: ${rem(26)};
  `,
}

const typeStyles: Record<Type, Record<Status, RuleSet>> = {
  default: {
    default: css`
      border: solid ${rem(1)} ${buttonPrimary};
      color: ${buttonPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        border-color: ${buttonPrimaryHover};
        color: ${buttonPrimaryHover};
      }
    `,
    error: css`
      border: solid ${rem(1)} ${alertError};
      color: ${alertError};
      padding: 0 ${rem(16)};

      &:hover {
        border-color: ${alertErrorHover};
        color: ${alertErrorHover};
      }
    `,
    info: css`
      border: solid ${rem(1)} ${alertInfo};
      color: ${alertInfo};
      padding: 0 ${rem(16)};

      &:hover {
        border-color: ${alertInfoHover};
        color: ${alertInfoHover};
      }
    `,
    success: css`
      border: solid ${rem(1)} ${alertSuccess};
      color: ${alertSuccess};
      padding: 0 ${rem(16)};

      &:hover {
        border-color: ${alertSuccessHover};
        color: ${alertSuccessHover};
      }
    `,
    warning: css`
      border: solid ${rem(1)} ${alertWarning};
      color: ${alertWarning};
      padding: 0 ${rem(16)};

      &:hover {
        border-color: ${alertWarningHover};
        color: ${alertWarningHover};
      }
    `,
  },
  link: {
    default: css`
      color: ${buttonPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        color: ${buttonPrimaryHover};
      }
    `,
    error: css`
      color: ${alertError};
      padding: 0 ${rem(16)};

      &:hover {
        color: ${alertErrorHover};
      }
    `,
    info: css`
      color: ${alertInfo};
      padding: 0 ${rem(16)};

      &:hover {
        color: ${alertInfoHover};
      }
    `,
    success: css`
      color: ${alertSuccess};
      padding: 0 ${rem(16)};

      &:hover {
        color: ${alertSuccessHover};
      }
    `,
    warning: css`
      color: ${alertWarning};
      padding: 0 ${rem(16)};

      &:hover {
        color: ${alertWarningHover};
      }
    `,
  },
  primary: {
    default: css`
      background-color: ${buttonPrimary};
      color: ${textPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${buttonPrimaryHover};
      }
    `,
    error: css`
      background-color: ${alertError};
      color: ${textPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertErrorHover};
      }
    `,
    info: css`
      background-color: ${alertInfo};
      color: ${textPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertInfoHover};
      }
    `,
    success: css`
      background-color: ${alertSuccess};
      color: ${textPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertSuccessHover};
      }
    `,
    warning: css`
      background-color: ${alertWarning};
      color: ${textPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertWarningHover};
      }
    `,
  },
  text: {
    default: css`
      color: ${buttonPrimary};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${buttonPrimary};
        color: ${textPrimary};
      }
    `,
    error: css`
      color: ${alertError};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertError};
        color: ${textPrimary};
      }
    `,
    info: css`
      color: ${alertInfo};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertInfo};
        color: ${textPrimary};
      }
    `,
    success: css`
      color: ${alertSuccess};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertSuccess};
        color: ${textPrimary};
      }
    `,
    warning: css`
      color: ${alertWarning};
      padding: 0 ${rem(16)};

      &:hover {
        background-color: ${alertWarning};
        color: ${textPrimary};
      }
    `,
  },
}

const StyledComponent = styled.button<{
  block?: boolean
  disabled?: boolean
  ghost?: boolean
  shape: Shape
  size: Size
  status: Status
  type: Type
}>`
  ${({ block, ghost, shape, size, type, status }) => {
    const blockStyle = block ? blockStyles : ''

    if (ghost) {
      const ghostStyle = ghostStyles[status]

      return css`
        ${baseStyles}
        ${blockStyle}
        ${ghostStyle}
      `
    } else {
      const shapeStyle = shapeStyles[shape]
      const sizeStyle = sizeStyles[size]
      const typeStyle = typeStyles[type][status]

      return css`
        ${baseStyles}
        ${blockStyle}
        ${shapeStyle}
        ${sizeStyle}
        ${typeStyle}
      `
    }
  }}
`

interface ComponentProps extends HTMLAttributes<HTMLButtonElement> {
  block?: boolean
  disabled?: boolean
  ghost?: boolean
  loading?: boolean
  shape?: Shape
  size?: Size
  status?: Status
  type?: Type
}

const Component: FC<ComponentProps> = ({
  children,
  shape = 'default',
  size = 'default',
  status = 'default',
  type = 'default',
  ...props
}) => {
  return (
    <StyledComponent
      {...{
        shape,
        size,
        status,
        type,
      }}
      {...props}
    >
      {children}
    </StyledComponent>
  )
}

export default Component
