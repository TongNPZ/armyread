// app/lib/parser/armyList/armyListHelpers.ts
import type { SelectionNode, Profile } from "../roster/rosterImportTypes"
import type { ArmyListWeapon, StatItem, AbilityRule } from "./armyListTypes"

export function getCharacteristic(profile: Profile, name: string): string {
    if (!profile.characteristics) return "-"
    const char = profile.characteristics.find(c => c.name.toLowerCase() === name.toLowerCase())
    return char?.$text ?? "-"
}

export function getUnitStats(node: SelectionNode): StatItem[] {
    const unitProfile = node.profiles?.find(p => p.typeName === "Unit")
    if (!unitProfile) return []

    const statMap: Record<string, string> = {
        "M": "M", "Movement": "M",
        "T": "T", "Toughness": "T",
        "SV": "SV", "Save": "SV",
        "W": "W", "Wounds": "W",
        "LD": "LD", "Leadership": "LD",
        "OC": "OC", "Objective Control": "OC"
    }

    return Object.entries(statMap).map(([bsName, shortName]) => {
        const val = getCharacteristic(unitProfile, bsName)
        return val !== "-" ? { name: shortName, value: val } : null
    }).filter((s): s is StatItem => s !== null)
}

export function getWeaponStats(weaponNode: SelectionNode): ArmyListWeapon[] {
    const weapons: ArmyListWeapon[] = []

    const parseProfile = (profile: Profile): ArmyListWeapon => ({
        name: profile.name ?? weaponNode.name ?? "Unknown",
        count: weaponNode.number ?? 1,
        range: getCharacteristic(profile, "Range"),
        attacks: getCharacteristic(profile, "A"),
        skill: getCharacteristic(profile, "BS") !== "-" ? getCharacteristic(profile, "BS") : getCharacteristic(profile, "WS"),
        strength: getCharacteristic(profile, "S"),
        ap: getCharacteristic(profile, "AP"),
        damage: getCharacteristic(profile, "D"),
        abilities: getCharacteristic(profile, "Keywords")
    })

    weaponNode.profiles?.forEach(p => {
        if (p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons") {
            weapons.push(parseProfile(p))
        }
    })

    if (weapons.length === 0 && weaponNode.selections) {
        weaponNode.selections.forEach(child => {
            child.profiles?.forEach(p => {
                if (p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons") {
                    weapons.push(parseProfile(p))
                }
            })
        })
    }

    return weapons
}

export function getAbilitiesAndKeywords(node: SelectionNode) {
    const abilities: Record<string, AbilityRule[]> = {
        "Core": [],
        "Faction": [],
        "Abilities": [],
        "Leader": [],
        "Invuln": [],
        "Damaged": [],
        "Wargear": []
    }

    const categorizeAbility = (name: string, desc: string) => {
        const lowerName = name.toLowerCase();

        // 1. Invulnerable Save -> Highlight Header
        if (lowerName.includes("invulnerable save")) {
            abilities["Invuln"].push({ name, description: desc });
        }
        // 2. Damaged (Bracket) -> Highlight Header
        else if (lowerName.includes("damaged:")) {
            abilities["Damaged"].push({ name, description: desc });
        }
        // 3. Leader -> Leader Section
        else if (name === "Leader") {
            abilities["Leader"].push({ name, description: desc });
        }
        // 4. Core Rules -> Tooltip List (✅ เพิ่ม deadly demise เข้าไปที่นี่)
        else if (["deep strike", "scouts", "infiltrators", "lone operative", "stealth", "fights first", "feel no pain", "deadly demise"].some(k => lowerName.includes(k))) {
            abilities["Core"].push({ name, description: desc });
        }
        // 5. General -> Text block
        else {
            abilities["Abilities"].push({ name, description: desc });
        }
    }

    node.rules?.forEach(r => {
        categorizeAbility(r.name ?? "", r.description ?? "");
    })

    node.profiles?.forEach(p => {
        if (p.typeName === "Abilities") {
            const desc = getCharacteristic(p, "Description")
            categorizeAbility(p.name ?? "", desc);
        }
    })

    const allKeywords = node.categories?.map(c => c.name ?? "") ?? []

    const factionKeywords = allKeywords.filter(k =>
        k.startsWith("Faction:") ||
        k.includes("Adeptus") || k.includes("Heretic") || k.includes("Aeldari") || k.includes("Tyranids") || k.includes("T'au")
    ).map(k => k.replace("Faction: ", ""))

    const keywords = allKeywords.filter(k =>
        !k.startsWith("Faction:") && !factionKeywords.includes(k) && k !== "Configuration"
    )

    return { abilities, keywords, factionKeywords }
}