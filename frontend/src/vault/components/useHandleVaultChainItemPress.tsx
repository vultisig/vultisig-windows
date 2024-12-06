import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCopyAddress } from '../../chain/ui/hooks/useCopyAddress';
import { Chain } from '../../model/chain';
import { makeAppPath } from '../../navigation';

type Input = {
  chain: string;
  address?: string;
};

export const useHandleVaultChainItemPress = ({ chain, address }: Input) => {
  const [pressedAt, setPressedAt] = useState<number | null>(null);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const copyAddress = useCopyAddress();

  const navigate = useNavigate();

  useEffect(() => {
    if (!pressedAt || !address || copiedAt) {
      return;
    }

    const timeout = setTimeout(
      () => {
        copyAddress(address);
        setCopiedAt(Date.now());
      },
      pressedAt + 500 - Date.now()
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [address, copiedAt, copyAddress, pressedAt]);

  return {
    onPointerDown: () => {
      setPressedAt(Date.now());
    },
    onPointerUp: () => {
      if (!copiedAt) {
        navigate(makeAppPath('vaultChainDetail', { chain: chain as Chain }));
      }

      setPressedAt(null);
      setCopiedAt(null);
    },
    onPointerCancel: () => {
      setPressedAt(null);
      setCopiedAt(null);
    },
  };
};
