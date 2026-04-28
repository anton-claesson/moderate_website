export interface MunicipalityStats {
  name: string;
  smahusCurrent: number;
  flerboCurrent: number;
  flerbo2060: number;
  fortattning: number;
}

export const FORTATTNING_MAX = 386;

export const HOUSING_STATS: Record<string, MunicipalityStats> = {
  Botkyrka: {
    name: 'Botkyrka',
    smahusCurrent: 12540,
    flerboCurrent: 22861,
    flerbo2060: 39861,
    fortattning: 74,
  },
  Danderyd: {
    name: 'Danderyd',
    smahusCurrent: 6859,
    flerboCurrent: 6041,
    flerbo2060: 10741,
    fortattning: 78,
  },
  Ekerö: {
    name: 'Ekerö',
    smahusCurrent: 8844,
    flerboCurrent: 1452,
    flerbo2060: 7052,
    fortattning: 386,
  },
  Haninge: {
    name: 'Haninge',
    smahusCurrent: 15664,
    flerboCurrent: 22691,
    flerbo2060: 43491,
    fortattning: 92,
  },
  Huddinge: {
    name: 'Huddinge',
    smahusCurrent: 19620,
    flerboCurrent: 23678,
    flerbo2060: 55878,
    fortattning: 136,
  },
  Järfälla: {
    name: 'Järfälla',
    smahusCurrent: 11401,
    flerboCurrent: 24818,
    flerbo2060: 53218,
    fortattning: 114,
  },
  Lidingö: {
    name: 'Lidingö',
    smahusCurrent: 7295,
    flerboCurrent: 13645,
    flerbo2060: 19245,
    fortattning: 41,
  },
  Nacka: {
    name: 'Nacka',
    smahusCurrent: 16172,
    flerboCurrent: 28075,
    flerbo2060: 54675,
    fortattning: 95,
  },
  Norrtälje: {
    name: 'Norrtälje',
    smahusCurrent: 19067,
    flerboCurrent: 12578,
    flerbo2060: 29578,
    fortattning: 135,
  },
  Nykvarn: {
    name: 'Nykvarn',
    smahusCurrent: 2951,
    flerboCurrent: 1474,
    flerbo2060: 5274,
    fortattning: 258,
  },
  Nynäshamn: {
    name: 'Nynäshamn',
    smahusCurrent: 6289,
    flerboCurrent: 7284,
    flerbo2060: 12884,
    fortattning: 77,
  },
  Salem: {
    name: 'Salem',
    smahusCurrent: 3761,
    flerboCurrent: 2797,
    flerbo2060: 6597,
    fortattning: 136,
  },
  Sigtuna: {
    name: 'Sigtuna',
    smahusCurrent: 6992,
    flerboCurrent: 12780,
    flerbo2060: 24180,
    fortattning: 89,
  },
  Sollentuna: {
    name: 'Sollentuna',
    smahusCurrent: 13192,
    flerboCurrent: 17110,
    flerbo2060: 34110,
    fortattning: 99,
  },
  Solna: {
    name: 'Solna',
    smahusCurrent: 701,
    flerboCurrent: 40169,
    flerbo2060: 66569,
    fortattning: 66,
  },
  Stockholm: {
    name: 'Stockholm',
    smahusCurrent: 45708,
    flerboCurrent: 425308,
    flerbo2060: 633708,
    fortattning: 49,
  },
  Sundbyberg: {
    name: 'Sundbyberg',
    smahusCurrent: 1442,
    flerboCurrent: 23851,
    flerbo2060: 50451,
    fortattning: 112,
  },
  Södertälje: {
    name: 'Södertälje',
    smahusCurrent: 13216,
    flerboCurrent: 28687,
    flerbo2060: 49487,
    fortattning: 73,
  },
  Tyresö: {
    name: 'Tyresö',
    smahusCurrent: 9353,
    flerboCurrent: 10434,
    flerbo2060: 18934,
    fortattning: 81,
  },
  Täby: {
    name: 'Täby',
    smahusCurrent: 14700,
    flerboCurrent: 16890,
    flerbo2060: 43490,
    fortattning: 157,
  },
  'Upplands-Bro': {
    name: 'Upplands-Bro',
    smahusCurrent: 5108,
    flerboCurrent: 7666,
    flerbo2060: 16166,
    fortattning: 111,
  },
  'Upplands-Väsby': {
    name: 'Upplands-Väsby',
    smahusCurrent: 6933,
    flerboCurrent: 13852,
    flerbo2060: 24152,
    fortattning: 74,
  },
  Vallentuna: {
    name: 'Vallentuna',
    smahusCurrent: 9094,
    flerboCurrent: 4737,
    flerbo2060: 16137,
    fortattning: 241,
  },
  Vaxholm: {
    name: 'Vaxholm',
    smahusCurrent: 2775,
    flerboCurrent: 2249,
    flerbo2060: 6049,
    fortattning: 169,
  },
  Värmdö: {
    name: 'Värmdö',
    smahusCurrent: 12754,
    flerboCurrent: 6514,
    flerbo2060: 19714,
    fortattning: 203,
  },
  Österåker: {
    name: 'Österåker',
    smahusCurrent: 13131,
    flerboCurrent: 5407,
    flerbo2060: 18607,
    fortattning: 244,
  },
};
