import { TranslationServiceClient } from '@google-cloud/translate';

import { toBatches } from '@lib/utils/array/toBatches';
import { Language } from '../Language';

const batchSize = 600;

interface TranslateTextsParams {
  texts: string[];
  from: Language;
  to: Language;
}

export const translateTexts = async ({
  texts,
  from,
  to,
}: TranslateTextsParams): Promise<string[]> => {
  console.log(`Translating ${texts.length} texts from ${from} to ${to}`);
  if (texts.length === 0) {
    return [];
  }

  const translationClient = new TranslationServiceClient();

  const batches = toBatches(texts, batchSize);

  const result = [];
  for (const contents of batches) {
    const request = {
      parent: `projects/${process.env.GOOGLE_TRANSLATE_PROJECT_ID}/locations/global`,
      contents,
      mimeType: 'text/plain',
      sourceLanguageCode: from,
      targetLanguageCode: to,
    };

    const [{ translations }] = await translationClient.translateText(request);
    if (!translations) {
      throw new Error('No translations');
    }

    result.push(
      ...translations.map((translation, index) => {
        let { translatedText } = translation;
        if (!translatedText) {
          throw new Error('No translatedText');
        }

        if (contents[index].endsWith('?') && !translatedText.endsWith('?')) {
          translatedText += '?';
        }

        return translatedText;
      })
    );
  }

  return result;
};
