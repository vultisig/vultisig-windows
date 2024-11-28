export const toRecordTypeBody = (record: Record<string, string>) => {
  const entries = Object.entries(record)
    .map(([key, value]) => `  ${key}: ${value},`)
    .join('\n');

  return entries ? `{\n${entries}\n}` : `{}`;
};
