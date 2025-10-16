export type Preset = {
  id: string;
  name: string;
  pool: string[];
  // Optional cap for this preset (e.g., MASH = 4)
  max?: number;
};

export const PRESETS: Record<string, Preset> = {
  home: {
    id: 'home',
    name: 'Home (MASH)',
    pool: ['Mansion', 'Apartment', 'Shack', 'House'],
    max: 4,
  },
  partner: {
    id: 'partner',
    name: 'Partner',
    pool: [
      'Alex','Jamie','Taylor','Jordan','Riley','Casey','Sam','Avery','Morgan','Quinn',
      'Harper','Charlie','Rowan','Drew','Parker','Emerson','Reese','Sage','Devin','Skyler'
    ],
  },
  kids: {
    id: 'kids',
    name: 'Kids',
    pool: [
      'None','1','2','3','4','5','8','10','20','50','100'
    ],
  },
  job: {
    id: 'job',
    name: 'Job',
    pool: [
      'Engineer','Artist','Chef','Streamer','Teacher','Doctor','Pilot','Game Designer','Paramedic','Scientist',
      'Writer','Photographer','Carpenter','Musician','Software Dev','Architect','Mechanic','Data Analyst','Producer','Brewmaster'
    ],
  },
  city: {
    id: 'city',
    name: 'City',
    pool: [
      'London','Tokyo','New York','Reykjavik','Berlin','Seoul','Paris','Sydney','Toronto','Barcelona',
      'Lisbon','Copenhagen','Oslo','Auckland','Vancouver','Dublin','Prague','Vienna','Chicago','Kyoto'
    ],
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle',
    pool: [
      'Motorbike','Tesla','Bicycle','Sailboat','Camper Van','Skateboard',
      'Truck','Scooter','Subaru','Jeep','Classic Beetle','Kayak','E-Bike','Pickup','Convertible','SUV','Hot Hatch','Retro Mini'
    ],
  },
  salary: {
    id: 'salary',
    name: 'Salary',
    pool: ['£10k','£20k','£30k','£40k','£50k','£60k','£75k','£90k','£110k','£150k','£250k+'],
  },
};

/** Pick up to k unique items from a pool */
export function sample(pool: string[], k = 5): string[] {
  const n = Math.min(k, pool.length);
  // Fisher–Yates over a shallow copy
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}