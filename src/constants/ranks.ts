
export const RANK_OPTIONS = {
  Army: {
    Men: [
      "Private",
      "Lance Corporal",
      "Corporal",
      "Sergeant",
      "Staff Sergeant",
      "Warrant Officer",
      "Master Warrant Officer",
      "Army Warrant Officer"
    ],
    Officer: [
      "Second Lieutenant",
      "Lieutenant",
      "Captain",
      "Major",
      "Lieutenant Colonel",
      "Colonel",
      "Brigadier General",
      "Major General",
      "Lieutenant General",
      "General",
      "Field Marshal"
    ]
  },
  Navy: {
    Men: [
      "Ordinary Seaman",
      "Seaman",
      "Able Seaman",
      "Leading Seaman",
      "Petty Officer",
      "Warrant Officer",
      "Master Warrant Officer",
      "Navy Warrant Officer"
    ],
    Officer: [
      "Midshipman",
      "Sub-Lieutenant",
      "Lieutenant",
      "Lieutenant Commander",
      "Commander",
      "Captain",
      "Commodore",
      "Rear Admiral",
      "Vice Admiral",
      "Admiral",
      "Admiral of the Fleet"
    ]
  },
  "Air Force": {
    Men: [
      "Aircraftman/Aircraftwoman",
      "Lance Corporal",
      "Corporal",
      "Sergeant",
      "Flight Sergeant",
      "Warrant Officer",
      "Master Warrant Officer",
      "Air Warrant Officer"
    ],
    Officer: [
      "Officer Cadet",
      "Pilot Officer",
      "Flying Officer",
      "Flight Lieutenant",
      "Squadron Leader",
      "Wing Commander",
      "Group Captain",
      "Air Commodore",
      "Air Vice Marshal",
      "Air Marshal",
      "Air Chief Marshal",
      "Marshal of the Air Force"
    ]
  }
};

export const getRankOptions = (armOfService: string, category: string) => {
  if (!armOfService || !category) {
    return [];
  }
  
  const serviceKey = armOfService as keyof typeof RANK_OPTIONS;
  const categoryKey = category as keyof typeof RANK_OPTIONS[typeof serviceKey];
  
  return RANK_OPTIONS[serviceKey]?.[categoryKey] || [];
};
