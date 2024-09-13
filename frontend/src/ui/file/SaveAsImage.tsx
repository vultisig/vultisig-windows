import { useState } from 'react';
import { ReactNode } from 'react';
import {
  ClickableComponentProps,
  ComponentWithValueProps,
} from '../../lib/ui/props';
import { toPng } from 'html-to-image';
import { useMutation } from '@tanstack/react-query';
import { SaveFile } from '../../../wailsjs/go/main/App';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

type SaveAsImageProps = ComponentWithValueProps<ReactNode> & {
  fileName: string;
  renderTrigger: (props: ClickableComponentProps) => ReactNode;
};

export const SaveAsImage = ({
  value,
  fileName,
  renderTrigger,
}: SaveAsImageProps) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const { mutate: saveFile } = useMutation({
    mutationFn: async (node: HTMLDivElement) => {
      const dataUrl = await toPng(node);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      return SaveFile(`${fileName}.png`, base64Data);
    },
  });

  return (
    <>
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={setNode}>{value}</div>
      </div>
      {node &&
        renderTrigger({
          onClick: () => saveFile(shouldBePresent(node)),
        })}
    </>
  );
};
