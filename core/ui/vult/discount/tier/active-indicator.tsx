import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <g clipPath="url(#clip0_active_check)">
      <path
        d="M4.88637 8.07777C5.1164 8.07777 5.29908 7.9946 5.43439 7.82827L8.52627 3.92281C8.56687 3.87218 8.60407 3.81704 8.63788 3.75737C8.67174 3.6977 8.68866 3.63713 8.68866 3.57566C8.68866 3.45632 8.63227 3.36049 8.51948 3.28817C8.40674 3.21585 8.28045 3.17969 8.14059 3.17969C7.95118 3.17969 7.79334 3.26105 7.66707 3.42378L4.85931 7.03632L3.52649 5.65315C3.4453 5.56636 3.36524 5.50759 3.28631 5.47686C3.20738 5.44612 3.12055 5.43075 3.02583 5.43075C2.8815 5.43075 2.75859 5.47324 2.65711 5.55823C2.55563 5.64321 2.50488 5.74536 2.50488 5.86467C2.50488 5.97679 2.55675 6.0889 2.66049 6.20099L4.3113 7.82827C4.39699 7.91507 4.48608 7.97835 4.57854 8.01812C4.671 8.05789 4.77361 8.07777 4.88637 8.07777Z"
        fill="#13C89D"
      />
    </g>
    <defs>
      <clipPath id="clip0_active_check">
        <rect width="11.2444" height="11.2444" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  color: #13c89d;
  text-align: center;
  font-family: Brockmann;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
`

export const ActiveDiscountTierIndicator = () => {
  const { t } = useTranslation()
  return (
    <Container>
      <CheckIcon />
      {t('active')}
    </Container>
  )
}
