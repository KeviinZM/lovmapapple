import { fr } from './fr';
import { en } from './en';

export type Language = 'fr' | 'en';

export interface Translations {
  fr: typeof fr;
  en: typeof en;
}

export const translations: Translations = {
  fr,
  en,
};

export { fr, en };

export default translations;
