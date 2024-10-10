export type CompactFormatParts = {
  suffix: string;
  value: string;
};

/**
 * It takes a number and returns a string using Intl.NumberFormat formatter
 * it creates compact number format
 * @param {number} number - The number to format.
 * @param {number} minimumFractionDigits - Min. fraction digits
 * @param {number} maximumFractionDigits - Max. fraction digits
 * @param {string} locale - Preferred value for locale, if not passed defaults to browser locale
 * @returns {Object} compactFormatToParts containing the compacted number and suffix.
 * @returns {string} compactFormatToParts.value, representing a
 * language-sensitive representation of the compacted number.
 * @returns {string} compactFormatToParts.suffix, representing the compact
 * suffix (e.g., K, M, etc).
 */
export const compactFormatToParts = (
  number: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2,
  locale: string = navigator.language
): CompactFormatParts => {
  const notation = number < 1e15 ? 'compact' : 'scientific';

  // Create formatter instances for the 'en-US' locale and the user's locale
  const enUsFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits,
    notation,
  });
  const localeFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits,
    notation,
  });

  // Get the parts of the formatted number for both locales
  const enUsNumberParts = enUsFormatter.formatToParts(number);
  const localeNumberParts = localeFormatter.formatToParts(number);

  // Extract the non-compact parts of the formatted numbers for both locales
  const enUsNumberValue = enUsNumberParts
    .filter(
      part =>
        part.type !== 'compact' &&
        part.type !== 'exponentSeparator' &&
        part.type !== 'exponentInteger'
    )
    .map(({ value }) => value)
    .join('')
    .trim();
  const localeNumberValue = localeNumberParts
    .filter(
      part =>
        part.type !== 'compact' &&
        part.type !== 'exponentSeparator' &&
        part.type !== 'exponentInteger'
    )
    .map(({ value }) => value)
    .join('')
    .trim();

  // Determine which formatted number to use based on the user's locale
  let compactNumber = enUsNumberValue;
  if (
    enUsNumberValue !== localeNumberValue &&
    enUsNumberValue.indexOf('.') !== -1 &&
    enUsNumberValue.indexOf('.') === localeNumberValue.indexOf(',')
  ) {
    compactNumber = localeNumberValue;
  }

  // Get the compact suffix for the formatted number
  const compactSuffix = enUsNumberParts
    .filter(
      part =>
        part.type === 'compact' ||
        part.type === 'exponentSeparator' ||
        part.type === 'exponentInteger'
    )
    .map(({ value }) => value)
    .join('');

  return {
    suffix: compactSuffix,
    value: compactNumber,
  };
};
