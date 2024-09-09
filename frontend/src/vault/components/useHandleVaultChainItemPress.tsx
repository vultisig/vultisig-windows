import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../lib/ui/toast/ToastProvider';

type Input = {
  chainId: string;
  address?: string;
};

export const useHandleVaultChainItemPress = ({ chainId, address }: Input) => {
  const [pressedAt, setPressedAt] = useState<number | null>(null);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const { addToast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    if (!pressedAt || !address || copiedAt) {
      return;
    }

    const timeout = setTimeout(
      () => {
        navigator.clipboard.writeText(address);
        addToast({ message: 'Address copied' });
        setCopiedAt(Date.now());
      },
      pressedAt + 500 - Date.now()
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [pressedAt, copiedAt, address]);

  return {
    onPointerDown: () => {
      setPressedAt(Date.now());
    },
    onPointerUp: () => {
      if (!copiedAt) {
        navigate(`/vault/item/detail/${chainId}`);
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
