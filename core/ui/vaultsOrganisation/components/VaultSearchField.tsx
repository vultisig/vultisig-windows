import { IconButton } from '@lib/ui/buttons/IconButton'
import { CircleICloseIcon } from '@lib/ui/icons/CircleICloseIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { SearchField } from '@lib/ui/search/SearchField'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type VaultSearchFieldProps = {
  value: string
  onChange: (query: string) => void
  onClose: () => void
}

export const VaultSearchField = ({
  value,
  onChange,
  onClose,
}: VaultSearchFieldProps) => {
  const { t } = useTranslation()

  return (
    <Wrapper gap={8} alignItems="center">
      <FieldSlot>
        <SearchField value={value} onSearch={onChange} />
      </FieldSlot>
      <IconButton
        kind="link"
        size="lg"
        onClick={onClose}
        aria-label={t('cancel')}
      >
        <CircleICloseIcon />
      </IconButton>
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  width: 100%;
`

const FieldSlot = styled.div`
  flex: 1;
`
