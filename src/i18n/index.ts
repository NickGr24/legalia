import { ro, TranslationKey } from './ro';

export const t = (key: TranslationKey): string => {
  return ro[key] || key;
};

export type { TranslationKey };
export { ro };