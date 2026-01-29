// app/lib/parser/armyDomainTypes.ts
export type Statline = {
  M: string
  T: string
  SV: string
  W: string
  LD: string
  OC: string
}

export type Ability = {
  id: string
  name: string
  description: string
  source?: string
}

export type Weapon = {
  id: string
  name: string
  type: "ranged" | "melee"
  range: string
  attacks: string
  skill: string
  strength: string
  ap: string
  damage: string
  keywords: string[]
}

export type Unit = {
  id: string
  name: string
  count: number
  points?: number
  keywords: string[]
  stats?: Statline
  abilities: Ability[]
  weapons: Weapon[]
  rawProfiles?: unknown[]
}
