/**
 * List of popular universities in Moldova for quick selection
 * Ordered by popularity/recognition
 */
export const popularUniversities: string[] = [
  // Universities with confirmed logos (local assets)
  'Universitatea de Stat din Moldova', // has USM logo
  'Academia de Studii Economice din Moldova', // has ASEM logo
  'Universitatea Liberă Internațională din Moldova', // has ULIM logo
  'Universitatea de Stat "Alecu Russo" din Bălți', // has USARB logo
  'Universitatea "Bogdan Petriceicu Hasdeu" din Cahul', // has hasdeu logo
  'Academia "Ștefan cel Mare"', // has stefancelmare logo
  'Universitatea de Stat de Educație Fizică și Sport', // has USEM logo
  'Altă universitate...' // Just another option, not for custom input
];

/**
 * University name mappings for common abbreviations or alternative names
 */
export const universityAliases: Record<string, string> = {
  'USM': 'Universitatea de Stat din Moldova',
  'ASEM': 'Academia de Studii Economice din Moldova',
  'ULIM': 'Universitatea Liberă Internațională din Moldova',
  'USARB': 'Universitatea de Stat "Alecu Russo" din Bălți',
  'Hasdeu': 'Universitatea "Bogdan Petriceicu Hasdeu" din Cahul',
  'Stefan cel Mare': 'Academia "Ștefan cel Mare"',
  'USEM': 'Universitatea de Stat de Educație Fizică și Sport'
};

/**
 * Gets the canonical university name from an alias or returns the original name
 */
export const getCanonicalUniversityName = (name: string): string => {
  return universityAliases[name] || name;
};