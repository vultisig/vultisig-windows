import { useMemo } from 'react';

import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { keygenMsgRecord } from '../KeygenType';

export const useCurrentJoinKeygenMsg = () => {
  const { keygenType, keygenMsg: rawKeygenMsg } =
    useAppPathParams<'joinKeygen'>();

  return useMemo(() => {
    const { fromJsonString } = keygenMsgRecord[keygenType];

    return fromJsonString(rawKeygenMsg);
  }, [keygenType, rawKeygenMsg]);
};
