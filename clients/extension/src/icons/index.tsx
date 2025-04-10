import { FC, SVGProps } from 'react'

export const ArrowLeft: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M14 7L9 12" />
    <path d="M9 12L14 17" />
  </svg>
)

export const ArrowRight: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M10 17L15 12" />
    <path d="M15 12L10 7" />
  </svg>
)

export const BrokenLink: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M9.75027 5.52371L10.7168 4.55722C13.1264 2.14759 17.0332 2.14759 19.4428 4.55722C21.8524 6.96684 21.8524 10.8736 19.4428 13.2832L18.4742 14.2519M5.52886 9.74513L4.55722 10.7168C2.14759 13.1264 2.1476 17.0332 4.55722 19.4428C6.96684 21.8524 10.8736 21.8524 13.2832 19.4428L14.2478 18.4782" />
    <path d="M3.8 6.3625L1.75 5.85M6.3625 3.8L5.85 1.75M20.2 17.6375L22.25 18.15M17.6375 20.2L18.15 22.25" />
  </svg>
)

export const Check: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M20 6L9 17L4 12" />
  </svg>
)

export const CircleDollar: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M14.5 10V10C14.5 8.89543 13.6046 8 12.5 8H12M12 8H11.5C10.3954 8 9.5 8.89543 9.5 10V10C9.5 11.1046 10.3954 12 11.5 12H12M12 8V6.5M12 8V12M12 12H12.5C13.6046 12 14.5 12.8954 14.5 14V14C14.5 15.1046 13.6046 16 12.5 16H12M12 12V16M12 16H11.5C10.3954 16 9.5 15.1046 9.5 14V14M12 16V17.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
  </svg>
)

export const CircleHelp: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M9.14648 9.07361C9.31728 8.54732 9.63015 8.07896 10.0508 7.71948C10.4714 7.36001 10.9838 7.12378 11.5303 7.03708C12.0768 6.95038 12.6362 7.0164 13.1475 7.22803C13.6587 7.43966 14.1014 7.78875 14.4268 8.23633C14.7521 8.68391 14.9469 9.21256 14.9904 9.76416C15.0339 10.3158 14.9238 10.8688 14.6727 11.3618C14.4215 11.8548 14.0394 12.2685 13.5676 12.5576C13.0958 12.8467 12.5533 12.9998 12 12.9998V14.0002M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 17V17.1L11.9502 17.1002V17H12.0498Z" />
  </svg>
)

export const CircleInfo: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z" />
  </svg>
)

export const Close: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" />
  </svg>
)

export const CloseLG: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
)

export const NoteEdit: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M10.0002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2839 19.7822 18.9076C20 18.4802 20 17.921 20 16.8031V14M16 5L10 11V14H13L19 8M16 5L19 2L22 5L19 8M16 5L19 8" />
  </svg>
)

export const SettingsOne: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M20.3499 8.92293L19.9837 8.7192C19.9269 8.68756 19.8989 8.67169 19.8714 8.65524C19.5983 8.49165 19.3682 8.26564 19.2002 7.99523C19.1833 7.96802 19.1674 7.93949 19.1348 7.8831C19.1023 7.82677 19.0858 7.79823 19.0706 7.76998C18.92 7.48866 18.8385 7.17515 18.8336 6.85606C18.8331 6.82398 18.8332 6.79121 18.8343 6.72604L18.8415 6.30078C18.8529 5.62025 18.8587 5.27894 18.763 4.97262C18.6781 4.70053 18.536 4.44993 18.3462 4.23725C18.1317 3.99685 17.8347 3.82534 17.2402 3.48276L16.7464 3.1982C16.1536 2.85658 15.8571 2.68571 15.5423 2.62057C15.2639 2.56294 14.9765 2.56561 14.6991 2.62789C14.3859 2.69819 14.0931 2.87351 13.5079 3.22396L13.5045 3.22555L13.1507 3.43741C13.0948 3.47091 13.0665 3.48779 13.0384 3.50338C12.7601 3.6581 12.4495 3.74365 12.1312 3.75387C12.0992 3.7549 12.0665 3.7549 12.0013 3.7549C11.9365 3.7549 11.9024 3.7549 11.8704 3.75387C11.5515 3.74361 11.2402 3.65759 10.9615 3.50224C10.9334 3.48658 10.9056 3.46956 10.8496 3.4359L10.4935 3.22213C9.90422 2.86836 9.60915 2.69121 9.29427 2.62057C9.0157 2.55807 8.72737 2.55634 8.44791 2.61471C8.13236 2.68062 7.83577 2.85276 7.24258 3.19703L7.23994 3.1982L6.75228 3.48124L6.74688 3.48454C6.15904 3.82572 5.86441 3.99672 5.6517 4.23614C5.46294 4.4486 5.32185 4.69881 5.2374 4.97018C5.14194 5.27691 5.14703 5.61896 5.15853 6.3027L5.16568 6.72736C5.16676 6.79166 5.16864 6.82362 5.16817 6.85525C5.16343 7.17499 5.08086 7.48914 4.92974 7.77096C4.9148 7.79883 4.8987 7.8267 4.86654 7.88237C4.83436 7.93809 4.81877 7.96579 4.80209 7.99268C4.63336 8.26452 4.40214 8.49186 4.12733 8.65572C4.10015 8.67193 4.0715 8.68752 4.01521 8.71871L3.65365 8.91908C3.05208 9.25245 2.75137 9.41928 2.53256 9.65669C2.33898 9.86672 2.19275 10.1158 2.10349 10.3872C2.00259 10.6939 2.00267 11.0378 2.00424 11.7255L2.00551 12.2877C2.00706 12.9708 2.00919 13.3122 2.11032 13.6168C2.19979 13.8863 2.34495 14.134 2.53744 14.3427C2.75502 14.5787 3.05274 14.7445 3.64974 15.0766L4.00808 15.276C4.06907 15.3099 4.09976 15.3266 4.12917 15.3444C4.40148 15.5083 4.63089 15.735 4.79818 16.0053C4.81625 16.0345 4.8336 16.0648 4.8683 16.1255C4.90256 16.1853 4.92009 16.2152 4.93594 16.2452C5.08261 16.5229 5.16114 16.8315 5.16649 17.1455C5.16707 17.1794 5.16658 17.2137 5.16541 17.2827L5.15853 17.6902C5.14695 18.3763 5.1419 18.7197 5.23792 19.0273C5.32287 19.2994 5.46484 19.55 5.65463 19.7627C5.86915 20.0031 6.16655 20.1745 6.76107 20.5171L7.25478 20.8015C7.84763 21.1432 8.14395 21.3138 8.45869 21.379C8.73714 21.4366 9.02464 21.4344 9.30209 21.3721C9.61567 21.3017 9.90948 21.1258 10.4964 20.7743L10.8502 20.5625C10.9062 20.5289 10.9346 20.5121 10.9626 20.4965C11.2409 20.3418 11.5512 20.2558 11.8695 20.2456C11.9015 20.2446 11.9342 20.2446 11.9994 20.2446C12.0648 20.2446 12.0974 20.2446 12.1295 20.2456C12.4484 20.2559 12.7607 20.3422 13.0394 20.4975C13.0639 20.5112 13.0885 20.526 13.1316 20.5519L13.5078 20.7777C14.0971 21.1315 14.3916 21.3081 14.7065 21.3788C14.985 21.4413 15.2736 21.4438 15.5531 21.3855C15.8685 21.3196 16.1657 21.1471 16.7586 20.803L17.2536 20.5157C17.8418 20.1743 18.1367 20.0031 18.3495 19.7636C18.5383 19.5512 18.6796 19.3011 18.764 19.0297C18.8588 18.7252 18.8531 18.3858 18.8417 17.7119L18.8343 17.2724C18.8332 17.2081 18.8331 17.1761 18.8336 17.1445C18.8383 16.8247 18.9195 16.5104 19.0706 16.2286C19.0856 16.2007 19.1018 16.1726 19.1338 16.1171C19.166 16.0615 19.1827 16.0337 19.1994 16.0068C19.3681 15.7349 19.5995 15.5074 19.8744 15.3435C19.9012 15.3275 19.9289 15.3122 19.9838 15.2818L19.9857 15.2809L20.3472 15.0805C20.9488 14.7472 21.2501 14.5801 21.4689 14.3427C21.6625 14.1327 21.8085 13.8839 21.8978 13.6126C21.9981 13.3077 21.9973 12.9658 21.9958 12.2861L21.9945 11.7119C21.9929 11.0287 21.9921 10.6874 21.891 10.3828C21.8015 10.1133 21.6555 9.86561 21.463 9.65685C21.2457 9.42111 20.9475 9.25526 20.3517 8.92378L20.3499 8.92293Z" />
    <path d="M8.00033 12C8.00033 14.2091 9.79119 16 12.0003 16C14.2095 16 16.0003 14.2091 16.0003 12C16.0003 9.79082 14.2095 7.99996 12.0003 7.99996C9.79119 7.99996 8.00033 9.79082 8.00033 12Z" />
  </svg>
)

export const SettingsTwo: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M20.25 11.9998C20.25 10.4968 19.8481 9.08774 19.1459 7.87412M20.25 11.9998C20.25 13.5027 19.8481 14.9118 19.146 16.1253M20.25 11.9998H14.25M20.25 11.9998L22.25 12M19.1459 7.87412L20.8768 6.87481M19.1459 7.87412C18.4215 6.62219 17.3776 5.57827 16.1257 4.85391M19.146 16.1253L20.8768 17.1246M19.146 16.1253C18.4216 17.3773 17.3777 18.4213 16.1257 19.1457M14.25 11.9998C14.25 13.2424 13.2426 14.2498 12 14.2498C11.5901 14.2498 11.2058 14.1402 10.8748 13.9487M14.25 11.9998C14.25 10.7572 13.2426 9.74981 12 9.74981C11.5901 9.74981 11.2058 9.85942 10.8748 10.0509M12 20.2498C10.497 20.2498 9.08794 19.8479 7.87432 19.1457M12 20.2498C13.503 20.2498 14.9121 19.8479 16.1257 19.1457M12 20.2498V22.25M7.87432 19.1457L6.87501 20.8766M7.87432 19.1457L10.8748 13.9487M7.87432 19.1457C6.62239 18.4213 5.57847 17.3774 4.85411 16.1255M16.1257 19.1457L17.125 20.8766M3.75001 11.9998C3.75001 13.5028 4.15191 14.9119 4.85411 16.1255M3.75001 11.9998C3.75001 10.4968 4.15194 9.08763 4.85419 7.87398M3.75001 11.9998H1.75M4.85411 16.1255L3.12325 17.1248M4.85419 7.87398L3.12325 6.87461M4.85419 7.87398C5.57855 6.62211 6.62244 5.57824 7.87432 4.85391M12 3.74981C10.497 3.74981 9.08794 4.15171 7.87432 4.85391M12 3.74981C13.503 3.74981 14.9121 4.15171 16.1257 4.85391M12 3.74981V1.75M7.87432 4.85391L6.87501 3.12305M7.87432 4.85391L10.8748 10.0509M16.1257 4.85391L17.125 3.12305M10.8748 13.9487C10.2024 13.5596 9.75001 12.8325 9.75001 11.9998C9.75001 11.1671 10.2024 10.44 10.8748 10.0509" />
  </svg>
)

export const SquareArrow: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M17.05 21H6.95C5.75 21 5.09 21 4.5 20.7C3.98 20.43 3.56 20.02 3.3 19.5C3 18.91 3 18.25 3 17.05V6.95C3 5.75 3 5.09 3.3 4.5C3.57 3.98 3.98 3.57 4.5 3.3C5.09 3 5.75 3 6.95 3H9.25C9.66 3 10 3.34 10 3.75C10 4.16 9.66 4.5 9.25 4.5H6.95C5.98 4.5 5.45 4.5 5.18 4.64C4.94 4.76 4.76 4.95 4.63 5.19C4.49 5.46 4.49 5.99 4.49 6.96V17.06C4.49 18.03 4.49 18.56 4.63 18.83C4.75 19.07 4.94 19.25 5.18 19.38C5.45 19.52 5.98 19.52 6.95 19.52H17.05C18.02 19.52 18.55 19.52 18.82 19.38C19.06 19.26 19.24 19.07 19.37 18.83C19.51 18.56 19.51 18.03 19.51 17.06V14.76C19.51 14.35 19.85 14.01 20.26 14.01C20.67 14.01 21.01 14.35 21.01 14.76V17.06C21.01 18.26 21.01 18.92 20.71 19.51C20.44 20.03 20.03 20.45 19.51 20.71C18.92 21.01 18.26 21.01 17.06 21.01L17.05 21ZM11 13.75C10.81 13.75 10.62 13.68 10.47 13.53C10.18 13.24 10.18 12.76 10.47 12.47L18.44 4.5H13.75C13.34 4.5 13 4.16 13 3.75C13 3.34 13.34 3 13.75 3H20.25C20.35 3 20.45 3.02 20.54 3.06C20.63 3.1 20.71 3.15 20.78 3.22C20.85 3.29 20.91 3.37 20.94 3.46C20.98 3.55 21 3.65 21 3.75V10.25C21 10.66 20.66 11 20.25 11C19.84 11 19.5 10.66 19.5 10.25V5.56L11.53 13.53C11.38 13.68 11.19 13.75 11 13.75Z" />
  </svg>
)

export const Translate: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M3.75 6.69141H12.25" />
    <path d="M8 6.625V4.625" />
    <path d="M12 15.125C7.93498 14.0733 5.84489 11.4888 5.25 6.875" />
    <path d="M4 14.875C8.06352 13.8548 10.1538 11.3485 10.75 6.875" />
    <path d="M14.3438 17.9999H19.6562M21.25 20.1249L17.9355 11.3512C17.6098 10.4891 16.3902 10.4891 16.0645 11.3512L12.75 20.1249" />
  </svg>
)

export const Trash: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M14 11V17" />
    <path d="M10 11V17" />
    <path d="M6 7V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7" />
    <path d="M4 7H20" />
    <path d="M7 7L9 3H15L17 7" />
  </svg>
)

export const TriangleWarning: FC<SVGProps<SVGSVGElement>> = ({
  fill = 'none',
  height = 24,
  stroke = 'white',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 9.00006V13.0001M4.37891 15.1999C3.46947 16.775 3.01489 17.5629 3.08281 18.2092C3.14206 18.7729 3.43792 19.2851 3.89648 19.6182C4.42204 20.0001 5.3309 20.0001 7.14853 20.0001H16.8515C18.6691 20.0001 19.5778 20.0001 20.1034 19.6182C20.5619 19.2851 20.8579 18.7729 20.9172 18.2092C20.9851 17.5629 20.5307 16.775 19.6212 15.1999L14.7715 6.79986C13.8621 5.22468 13.4071 4.43722 12.8135 4.17291C12.2957 3.94236 11.704 3.94236 11.1862 4.17291C10.5928 4.43711 10.1381 5.22458 9.22946 6.79845L4.37891 15.1999ZM12.0508 16.0001V16.1001L11.9502 16.1003V16.0001H12.0508Z" />
  </svg>
)

export const Vultisig: FC<SVGProps<SVGSVGElement>> = ({
  height = 24,
  width = 24,
  ...props
}) => (
  <svg viewBox="0 0 24 24" {...{ ...props, height, width }}>
    <path
      d="M2.06417 19.7173L0.5 18.1532L0.61805 18.0745L9.0193 12.4277L11.8328 14.0608L11.6558 14.1591L2.06417 19.7173Z"
      fill="url(#linear_paint_0)"
    />
    <path
      d="M2.72341 21.9997L2.15283 19.8649L2.23153 19.8157L11.9313 14.228V17.4842L11.8723 17.5138L2.72341 21.9997Z"
      fill="url(#linear_paint_1)"
    />
    <path
      d="M21.2768 21.9997L21.149 21.9406L12.0591 17.4842V14.228L21.8474 19.8551L21.2768 21.9898V21.9997Z"
      fill="url(#linear_paint_2)"
    />
    <path
      d="M21.9357 19.7173L21.857 19.6682L12.167 14.0608L14.9805 12.4277L23.4998 18.1532L21.9357 19.7173Z"
      fill="url(#linear_paint_3)"
    />
    <path
      d="M12.0688 13.8542V2.57058L14.1938 2L14.8922 12.2409L12.0688 13.8542Z"
      fill="url(#linear_paint_4)"
    />
    <path
      d="M11.8722 13.8542L9.04883 12.2409V12.1622L9.74729 2L11.882 2.57058V13.8542H11.8722Z"
      fill="url(#linear_paint_5)"
    />
    <linearGradient
      id="linear_paint_0"
      x1="6.16641"
      y1="2.15736"
      x2="6.16641"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
    <linearGradient
      id="linear_paint_1"
      x1="7.04208"
      y1="2.15738"
      x2="7.04208"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
    <linearGradient
      id="linear_paint_2"
      x1="16.9582"
      y1="2.14755"
      x2="16.9582"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
    <linearGradient
      id="linear_paint_3"
      x1="17.8334"
      y1="2.15736"
      x2="17.8334"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
    <linearGradient
      id="linear_paint_4"
      x1="13.4756"
      y1="2.1574"
      x2="13.4756"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
    <linearGradient
      id="linear_paint_5"
      x1="10.4753"
      y1="2.1574"
      x2="10.4753"
      y2="21.8226"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#33E6BF" />
      <stop offset="1" stopColor="#0439C7" />
    </linearGradient>
  </svg>
)
