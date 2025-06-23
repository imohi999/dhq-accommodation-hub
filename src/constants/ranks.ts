
export const RANK_OPTIONS = {
  "Nigerian Army": {
    NCOs: [
      "Pte",
      "LCpl",
      "Cpl",
      "Sgt",
      "SSgt",
      "WO",
      "MWO",
      "AWO"
    ],
    Officer: [
      "2nd Lt",
      "Lt",
      "Capt",
      "Maj",
      "Lt Col",
      "Col",
      "Brig Gen",
      "Maj Gen",
      "Lt Gen",
      "Gen",
      "Field Marshal"
    ]
  },
  "Nigerian Navy": {
    NCOs: [
      "OS",
      "SM",
      "AB",
      "LS",
      "PO",
      "WO",
      "MWO",
      "NWO"
    ],
    Officer: [
      "SLt",
      "Lt",
      "Lt Cdr",
      "Cdr",
      "Capt",
      "Cdre",
      "R Adm",
      "V Adm",
      "Adm",
      "AF"
    ]
  },
  "Nigerian Air Force": {
    NCOs: [
      "ACM/ACW",
      "LCpl",
      "Cpl",
      "Sgt",
      "FS",
      "WO",
      "MWO",
      "AWO"
    ],
    Officer: [
      "Plt Offr",
      "Fg Offr",
      "Flt Lt",
      "Sqn Ldr",
      "Wg Cdr",
      "Gp Capt",
      "Air Cdre",
      "AVM",
      "Air Mshl",
      "Air Chf Mshl",
      "MNAF"
    ]
  }
};

export const getRankOptions = (armOfService: string, category: string): string[] => {
  if (!armOfService || !category) {
    return [];
  }

  const service = RANK_OPTIONS[armOfService as keyof typeof RANK_OPTIONS];

  if (!service) {
    return [];
  }

  const ranks = service[category as keyof typeof service];

  return ranks || [];
};
