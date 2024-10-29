import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { createJsonFile } from '../../lib/codegen/utils/createJsonFile';
import { without } from '../../lib/utils/array/without';
import { Language, languages } from '../Language';
import { translateTexts } from '../utils/translateTexts';

const copyDirectory = '../locales';

const translationFileName = 'translation';

const currentDirname = dirname(fileURLToPath(import.meta.url));

const getCopyFilePath = (language: Language) =>
  path.resolve(
    currentDirname,
    copyDirectory,
    language,
    `${translationFileName}.json`
  );

const primaryLanguage: Language = 'en';

type Copy = Record<string, string>;

const getCopy = (language: Language): Copy => {
  const copyFilePath = getCopyFilePath(language);
  const fileStr = fs.readFileSync(copyFilePath, 'utf-8');

  return JSON.parse(fileStr) as Copy;
};

const sync = async () => {
  const sourceCopy = getCopy(primaryLanguage);

  await Promise.all(
    without(languages, primaryLanguage).map(async language => {
      const targetCopy = getCopy(language);

      const missingKeys = Object.keys(sourceCopy).filter(
        key => !(key in targetCopy)
      );

      const translations = await translateTexts({
        texts: missingKeys.map(key => sourceCopy[key]),
        from: primaryLanguage,
        to: language,
      });

      missingKeys.forEach((key, index) => {
        targetCopy[key] = translations[index];
      });

      createJsonFile({
        directory: path.resolve(currentDirname, copyDirectory, language),
        fileName: translationFileName,
        content: JSON.stringify(targetCopy),
      });
    })
  );
};

sync();
