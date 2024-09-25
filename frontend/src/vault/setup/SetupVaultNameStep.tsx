import { useTranslation } from 'react-i18next';

import { ComponentWithForwardActionProps } from '../../lib/ui/props';
import { useVaultName } from './state/vaultName';

export const SetupVaultNameStep = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useVaultName();

  return (
    <div className="text-white flex flex-col items-center justify-center mt-60">
      <div>
        <label htmlFor="input" className="block text-md mb-2">
          {t('vault_name')}
        </label>
        <input
          id="input"
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
          className="font-bold bg-white/[.10] rounded-lg w-80 py-2 px-3"
        />
      </div>
      <button
        className={`text-lg rounded-full w-80 font-bold py-2 mt-16 ${
          value
            ? 'text-btn-primary bg-secondary'
            : 'text-btn-secondary bg-white/[.10]'
        }`}
        disabled={value === ''}
        onClick={onForward}
      >
        {t('continue')}
      </button>
    </div>
  );
};
