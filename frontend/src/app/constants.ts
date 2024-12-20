const Testaments = ["Antiguo Testamento", "Nuevo Testamento"] as const;
export type Testament = typeof Testaments[number];

export interface Book {
  names: string[];
  chapters: number;
  abrev: string;
  testament: Testament;
  englishName?: string;
  apiName: string; // Nombre requerido por la API
}

export enum Version {
    Rv60 = "rv1960",
    Rv95 = "rv1995",
    Nvi = "nvi",
    Dhh = "dhh",
    Pdt = "pdt",
    KJV = "kjv",
  }
  
  export const getVersionName = (version: Version): string => {
    switch (version) {
      case Version.Rv60:
        return "Reina Valera 1960";
      case Version.Rv95:
        return "Reina Valera 1995";
      case Version.Nvi:
        return "Nueva Versión Internacional";
      case Version.Dhh:
        return "Dios Habla Hoy";
      case Version.Pdt:
        return "Palabra de Dios para Todos";
      case Version.KJV:
        return "King James Version";
      default:
        return "Versión desconocida";
    }
  };
  

/*
 * Array of Bible books
 * Elements
 * {string} name
 * {number} chapters
 */
export const books: Book[] = [
  {
    names: ["Genesis"],
    abrev: "GN",
    chapters: 50,
    testament: "Antiguo Testamento",
    apiName: "genesis",
  },
  {
    names: ["Exodo", "Exodus"],
    abrev: "EX",
    chapters: 40,
    testament: "Antiguo Testamento",
    apiName: "exodo",
  },
  {
    names: ["Levitico", "Leviticus"],
    abrev: "LV",
    chapters: 27,
    testament: "Antiguo Testamento",
    apiName: "levitico",
  },
  {
    names: ["Numeros", "Numbers"],
    abrev: "NM",
    chapters: 36,
    testament: "Antiguo Testamento",
    apiName: "numeros",
  },
  {
    names: ["Deuteronomio", "Deuteronomy"],
    abrev: "DT",
    chapters: 34,
    testament: "Antiguo Testamento",
    apiName: "deuteronomio",
  },
  {
    names: ["Josue", "Joshua"],
    abrev: "JOS",
    chapters: 24,
    testament: "Antiguo Testamento",
    apiName: "josue",
  },
  {
    names: ["Jueces", "Judges"],
    abrev: "JUE",
    chapters: 21,
    testament: "Antiguo Testamento",
    apiName: "jueces",
  },
  {
    names: ["Rut", "Ruth"],
    abrev: "RT",
    chapters: 4,
    testament: "Antiguo Testamento",
    apiName: "rut",
  },
  {
    names: ["1-Samuel"],
    abrev: "1S",
    chapters: 31,
    testament: "Antiguo Testamento",
    apiName: "1-samuel",
  },
  {
    names: ["2-Samuel"],
    abrev: "2S",
    chapters: 24,
    testament: "Antiguo Testamento",
    apiName: "2-samuel",
  },
  {
    names: ["1-Reyes", "1-Kings"],
    abrev: "1R",
    chapters: 22,
    testament: "Antiguo Testamento",
    apiName: "1-reyes",
  },
  {
    names: ["2-Reyes", "2-Kings"],
    abrev: "2R",
    chapters: 25,
    testament: "Antiguo Testamento",
    apiName: "2-reyes",
  },
  {
    names: ["1-Cronicas", "1-Chronicles"],
    abrev: "1CR",
    chapters: 29,
    testament: "Antiguo Testamento",
    apiName: "1-cronicas",
  },
  {
    names: ["2-Cronicas", "2-Chronicles"],
    abrev: "2CR",
    chapters: 36,
    testament: "Antiguo Testamento",
    apiName: "2-cronicas",
  },
  {
    names: ["Esdras", "Ezra"],
    abrev: "ESD",
    chapters: 10,
    testament: "Antiguo Testamento",
    apiName: "esdras",
  },
  {
    names: ["Nehemias", "Nehemiah"],
    abrev: "NEH",
    chapters: 13,
    testament: "Antiguo Testamento",
    apiName: "nehemias",
  },
  {
    names: ["Ester", "Esther"],
    abrev: "EST",
    chapters: 10,
    testament: "Antiguo Testamento",
    apiName: "ester",
  },
  {
    names: ["Job"],
    abrev: "JOB",
    chapters: 42,
    testament: "Antiguo Testamento",
    apiName: "job",
  },
  {
    names: ["Salmos", "Psalms"],
    abrev: "SAL",
    chapters: 150,
    testament: "Antiguo Testamento",
    apiName: "salmos",
  },
  {
    names: ["Proverbios", "Proverbs"],
    abrev: "PR",
    chapters: 31,
    testament: "Antiguo Testamento",
    apiName: "proverbios",
  },
  {
    names: ["Eclesiastes", "Ecclesiastes"],
    abrev: "EC",
    chapters: 12,
    testament: "Antiguo Testamento",
    apiName: "eclesiastes",
  },
  {
    names: ["Cantares", "Song of Solomon"],
    abrev: "CNT",
    chapters: 8,
    testament: "Antiguo Testamento",
    apiName: "cantares",
  },
  {
    names: ["Isaias", "Isaiah"],
    abrev: "IS",
    chapters: 66,
    testament: "Antiguo Testamento",
    apiName: "isaias",
  },
  {
    names: ["Jeremias", "Jeremiah"],
    abrev: "JER",
    chapters: 52,
    testament: "Antiguo Testamento",
    apiName: "jeremias",
  },
  {
    names: ["Lamentaciones", "Lamentations"],
    abrev: "LM",
    chapters: 5,
    testament: "Antiguo Testamento",
    apiName: "lamentaciones",
  },
  {
    names: ["Ezequiel", "Ezekiel"],
    abrev: "EZ",
    chapters: 48,
    testament: "Antiguo Testamento",
    apiName: "ezequiel",
  },
  {
    names: ["Daniel"],
    abrev: "DN",
    chapters: 12,
    testament: "Antiguo Testamento",
    apiName: "daniel",
  },
  {
    names: ["Mateo", "Matthew"],
    abrev: "MT",
    chapters: 28,
    testament: "Nuevo Testamento",
    apiName: "mateo",
  },
  {
    names: ["Marcos", "Mark"],
    abrev: "MR",
    chapters: 16,
    testament: "Nuevo Testamento",
    apiName: "marcos",
  },
  {
    names: ["Lucas", "Luke"],
    abrev: "LC",
    chapters: 24,
    testament: "Nuevo Testamento",
    apiName: "lucas",
  },
  {
    names: ["Juan", "John"],
    abrev: "JN",
    chapters: 21,
    testament: "Nuevo Testamento",
    apiName: "juan",
  },
  {
    names: ["Hechos", "Acts"],
    abrev: "HCH",
    chapters: 28,
    testament: "Nuevo Testamento",
    apiName: "hechos",
  },
  {
    names: ["Romanos", "Romans"],
    abrev: "RO",
    chapters: 16,
    testament: "Nuevo Testamento",
    apiName: "romanos",
  },
  {
    names: ["1-Corintios", "1-Corinthians"],
    abrev: "1CO",
    chapters: 16,
    testament: "Nuevo Testamento",
    apiName: "1-corintios",
  },
  {
    names: ["2-Corintios", "2-Corinthians"],
    abrev: "2CO",
    chapters: 13,
    testament: "Nuevo Testamento",
    apiName: "2-corintios",
  },
  {
    names: ["Galatas", "Galatians"],
    abrev: "GA",
    chapters: 6,
    testament: "Nuevo Testamento",
    apiName: "galatas",
  },
  {
    names: ["Efesios", "Ephesians"],
    abrev: "EF",
    chapters: 6,
    testament: "Nuevo Testamento",
    apiName: "efesios",
  },
  {
    names: ["Filipenses", "Philippians"],
    abrev: "FIL",
    chapters: 4,
    testament: "Nuevo Testamento",
    apiName: "filipenses",
  },
  {
    names: ["Colosenses", "Colossians"],
    abrev: "COL",
    chapters: 4,
    testament: "Nuevo Testamento",
    apiName: "colosenses",
  },
  {
    names: ["1-Tesalonicenses", "1-Thessalonians"],
    abrev: "1TS",
    chapters: 5,
    testament: "Nuevo Testamento",
    apiName: "1-tesalonicenses",
  },
  {
    names: ["2-Tesalonicenses", "2-Thessalonians"],
    abrev: "2TS",
    chapters: 3,
    testament: "Nuevo Testamento",
    apiName: "2-tesalonicenses",
  },
  {
    names: ["1-Timoteo", "1-Timothy"],
    abrev: "1TI",
    chapters: 6,
    testament: "Nuevo Testamento",
    apiName: "1-timoteo",
  },
  {
    names: ["2-Timoteo", "2-Timothy"],
    abrev: "2TI",
    chapters: 4,
    testament: "Nuevo Testamento",
    apiName: "2-timoteo",
  },
  {
    names: ["Tito", "Titus"],
    abrev: "TIT",
    chapters: 3,
    testament: "Nuevo Testamento",
    apiName: "tito",
  },
  {
    names: ["Filemon", "Philemon"],
    abrev: "FLM",
    chapters: 1,
    testament: "Nuevo Testamento",
    apiName: "filemon",
  },
  {
    names: ["Hebreos", "Hebrews"],
    abrev: "HE",
    chapters: 13,
    testament: "Nuevo Testamento",
    apiName: "hebreos",
  },
  {
    names: ["Santiago", "James"],
    abrev: "STG",
    chapters: 5,
    testament: "Nuevo Testamento",
    apiName: "santiago",
  },
  {
    names: ["1-Pedro", "1-Peter"],
    abrev: "1P",
    chapters: 5,
    testament: "Nuevo Testamento",
    apiName: "1-pedro",
  },
  {
    names: ["2-Pedro", "2-Peter"],
    abrev: "2P",
    chapters: 3,
    testament: "Nuevo Testamento",
    apiName: "2-pedro",
  },
  {
    names: ["1-Juan", "1-John"],
    abrev: "1JN",
    chapters: 5,
    testament: "Nuevo Testamento",
    apiName: "1-juan",
  },
  {
    names: ["2-Juan", "2-John"],
    abrev: "2JN",
    chapters: 1,
    testament: "Nuevo Testamento",
    apiName: "2-juan",
  },
  {
    names: ["3-Juan", "3-John"],
    abrev: "3JN",
    chapters: 1,
    testament: "Nuevo Testamento",
    apiName: "3-juan",
  },
  {
    names: ["Judas", "Jude"],
    abrev: "JUD",
    chapters: 1,
    testament: "Nuevo Testamento",
    apiName: "judas",
  },
  {
    names: ["Apocalipsis", "Revelation"],
    abrev: "AP",
    chapters: 22,
    testament: "Nuevo Testamento",
    apiName: "apocalipsis",
  },
];
