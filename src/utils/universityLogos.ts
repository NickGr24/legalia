/**
 * University logo mappings for displaying local asset images
 * Maps university names to their corresponding logo files in assets/logos/
 */

// Import all university logos
const universityLogos = {
  usm: require('../../assets/logos/usm.png'),
  asem: require('../../assets/logos/asem.png'),
  ulim: require('../../assets/logos/ulim.png'),
  hasdeu: require('../../assets/logos/hasdeu.png'),
  stefancelmare: require('../../assets/logos/stefancelmare.png'),
  usarb: require('../../assets/logos/usarb.png'),
  usem: require('../../assets/logos/usem.png'),
};

/**
 * Maps university names to their corresponding logo assets
 * Uses fuzzy matching to handle different name variations
 */
export const universityLogoMap: Record<string, any> = {
  // Universitatea de Stat din Moldova (USM)
  'Universitatea de Stat din Moldova': universityLogos.usm,
  'USM': universityLogos.usm,
  
  // Academia de Studii Economice din Moldova (ASEM)
  'Academia de Studii Economice din Moldova': universityLogos.asem,
  'ASEM': universityLogos.asem,
  
  // Universitatea Liberă Internațională din Moldova (ULIM)
  'Universitatea Liberă Internațională din Moldova': universityLogos.ulim,
  'ULIM': universityLogos.ulim,
  
  // Universitatea "Bogdan Petriceicu Hasdeu" din Cahul
  'Universitatea "Bogdan Petriceicu Hasdeu" din Cahul': universityLogos.hasdeu,
  'Universitatea Bogdan Petriceicu Hasdeu din Cahul': universityLogos.hasdeu,
  'Hasdeu': universityLogos.hasdeu,
  
  // Universitatea de Stat "Alecu Russo" din Bălți
  'Universitatea de Stat "Alecu Russo" din Bălți': universityLogos.usarb,
  'Universitatea de Stat Alecu Russo din Bălți': universityLogos.usarb,
  "Universitatea de Stat 'Alecu Russo' din Bălți": universityLogos.usarb,
  'USARB': universityLogos.usarb,
  
  // Academia "Ștefan cel Mare"
  'Academia "Ștefan cel Mare"': universityLogos.stefancelmare,
  'Academia Ștefan cel Mare': universityLogos.stefancelmare,
  'Stefan cel Mare': universityLogos.stefancelmare,
  
  // Universitatea de Stat de Educație Fizică și Sport (USEM)
  'Universitatea de Stat de Educație Fizică și Sport': universityLogos.usem,
  'USEM': universityLogos.usem,
};

/**
 * Gets the logo for a university by name with fuzzy matching
 */
export const getUniversityLogo = (universityName: string): any => {
  if (!universityName) return null;

  // Try exact match first
  if (universityLogoMap[universityName]) {
    return universityLogoMap[universityName];
  }

  // Try fuzzy matching by checking if the name contains key terms
  const name = universityName.toLowerCase();
  
  if (name.includes('stat') && name.includes('moldova') && !name.includes('bălți') && !name.includes('comrat')) {
    return universityLogos.usm;
  }
  
  if (name.includes('economice') || name.includes('asem')) {
    return universityLogos.asem;
  }
  
  if (name.includes('liberă') && name.includes('internațională')) {
    return universityLogos.ulim;
  }
  
  if (name.includes('hasdeu') || name.includes('cahul')) {
    return universityLogos.hasdeu;
  }
  
  if (name.includes('alecu russo') || name.includes('bălți')) {
    return universityLogos.usarb;
  }

  if (name.includes('ștefan cel mare') || name.includes('stefan cel mare')) {
    return universityLogos.stefancelmare;
  }

  if (name.includes('usarb')) {
    return universityLogos.usarb;
  }

  if (name.includes('usem') || (name.includes('educație') && name.includes('fizică'))) {
    return universityLogos.usem;
  }
  
  return null;
};

/**
 * Gets all available university logos for display purposes
 */
export const getAllUniversityLogos = () => {
  return universityLogos;
};