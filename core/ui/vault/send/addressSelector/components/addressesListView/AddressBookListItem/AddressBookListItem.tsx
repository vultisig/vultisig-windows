import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { BinIcon } from '@lib/ui/icons/BinIcon'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useListContext } from '../list-context/useListContext'
import {
  ColumnOneBothRowsItem,
  ColumnThreeRowOneItem,
  ColumnTwoRowOneItem,
  ColumnTwoRowTwoItem,
  ItemWrapper,
  ListItem,
  ModifyButtonWrapper,
} from './AddressBookListItem.styles'

type AddressBookListItemProps = {
  id: string
  title: string
  address: string
  chain: string
  isEditModeOn: boolean
  handleDeleteAddress: (id: string) => void
  onClick: () => void
}

const AddressBookItem = ({
  id,
  title,
  address,
  chain,
  isEditModeOn,
  handleDeleteAddress,
  onClick,
}: AddressBookListItemProps) => {
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const { registerItem, getItemIndex } = useListContext()
  const itemRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!isEditModeOn) {
      return
    }

    const element = itemRef.current
    if (!element) {
      return
    }

    const index = getItemIndex(id)
    const data = { id, index }

    const unregister = registerItem({ itemId: id, element })

    const cleanup = combine(
      unregister,
      draggable({
        element,
        getInitialData: () => data,
      }),
      dropTargetForElements({
        element,
        getData: ({ input }) =>
          attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          }),
        onDrag({ self, source }) {
          if ((source.data as { id: string }).id === id) {
            setClosestEdge(null)
            return
          }
          const edge = extractClosestEdge(self.data)
          setClosestEdge(edge)
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      })
    )

    return () => {
      cleanup()
    }
  }, [isEditModeOn, id, registerItem, getItemIndex])

  const handleOnListItemClick = () => {
    if (!isEditModeOn) {
      onClick()
    }
  }

  const iconSrc = getChainEntityIconSrc(chain)

  return (
    <ItemWrapper ref={itemRef}>
      {isEditModeOn && (
        <ModifyButtonWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <UnstyledButton>
            <MenuIcon size={30} />
          </UnstyledButton>
        </ModifyButtonWrapper>
      )}
      <ListItem
        isCurrentlyBeingDragged={closestEdge !== null}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: isEditModeOn ? 0.98 : 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        isEditModeOn={isEditModeOn}
        onClick={handleOnListItemClick}
      >
        <ColumnOneBothRowsItem color="primary">
          <img src={iconSrc} alt="" style={{ width: 32, height: 32 }} />
        </ColumnOneBothRowsItem>
        <ColumnTwoRowOneItem color="contrast">{title}</ColumnTwoRowOneItem>
        <ColumnTwoRowTwoItem color="contrast">{address}</ColumnTwoRowTwoItem>
        <ColumnThreeRowOneItem color="shy">{`${chain} ${t('address_book_list_item_network')}`}</ColumnThreeRowOneItem>
      </ListItem>
      {isEditModeOn && (
        <ModifyButtonWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <UnstyledButton onClick={() => handleDeleteAddress(id)}>
            <BinIcon size={30} />
          </UnstyledButton>
        </ModifyButtonWrapper>
      )}
    </ItemWrapper>
  )
}

export default AddressBookItem
