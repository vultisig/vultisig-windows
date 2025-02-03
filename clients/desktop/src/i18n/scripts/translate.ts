import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { createTsFile } from '../../lib/codegen/utils/createTsFile';
import { without } from '@lib/utils/array/without';
import { omit } from '@lib/utils/record/omit';
import { Copy } from '../Copy';
import { languages, primaryLanguage } from '../Language';
import { translations } from '../translations';
import { translateTexts } from '../utils/translateTexts';

const copyDirectory = '../locales';

const currentDirname = dirname(fileURLToPath(import.meta.url));

const sync = async () => {
  const sourceCopy = translations[primaryLanguage];

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const oldCopy = translations[language];

      const result: Copy = omit(
        oldCopy,
        ...without(Object.keys(oldCopy), ...Object.keys(sourceCopy))
      );

      const missingKeys = Object.keys(sourceCopy).filter(
        key => !(key in result)
      );

      const textsToTranslate = missingKeys
        .map(key => sourceCopy[key])
        .filter((value): value is string => typeof value === 'string');

      const translatedTexts = await translateTexts({
        texts: textsToTranslate,
        from: primaryLanguage,
        to: language,
      });

      missingKeys.forEach((key, index) => {
        result[key] = translatedTexts[index];
      });
      const content = `export const ${language} = ${JSON.stringify(result)}`;

      createTsFile({
        directory: path.resolve(currentDirname, copyDirectory),
        fileName: language,
        content,
      });
    })
  );
};

sync();
