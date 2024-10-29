import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { createTsFile } from '../../lib/codegen/utils/createTsFile';
import { without } from '../../lib/utils/array/without';
import { languages, primaryLanguage } from '../Language';
import { translations } from '../translations';
import { translateTexts } from '../utils/translateTexts';

const copyDirectory = '../locales';

const currentDirname = dirname(fileURLToPath(import.meta.url));

const sync = async () => {
  const sourceCopy = translations[primaryLanguage];

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const targetCopy = translations[language];

      const missingKeys = Object.keys(sourceCopy).filter(
        key => !(key in targetCopy)
      );

      const translatedTexts = await translateTexts({
        texts: missingKeys.map(key => sourceCopy[key]),
        from: primaryLanguage,
        to: language,
      });

      missingKeys.forEach((key, index) => {
        targetCopy[key] = translatedTexts[index];
      });

      const content = `export const ${language} = ${JSON.stringify(targetCopy)}`;

      createTsFile({
        directory: path.resolve(currentDirname, copyDirectory),
        fileName: language,
        content,
      });
    })
  );
};

sync();
