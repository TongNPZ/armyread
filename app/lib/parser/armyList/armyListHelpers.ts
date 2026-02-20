// app/lib/parser/armyList/armyListHelpers.ts
import type { SelectionNode, Profile } from "../roster/rosterImportTypes"
import type { ArmyListWeapon, WeaponProfile, StatItem, AbilityRule } from "./armyListTypes"

// --- Helper: ดึงค่าจาก Characteristics ---
export function getCharacteristic(profile: Profile, name: string): string {
    if (!profile.characteristics) return "-"
    const char = profile.characteristics.find(c => c.name.toLowerCase() === name.toLowerCase())
    return char?.$text ?? "-"
}

// --- Helper: แปลง String Keywords เป็น Array ---
function parseKeywords(keywordString: string): string[] {
    if (!keywordString || keywordString === "-") return []
    return keywordString.split(",").map(k => k.trim()).filter(k => k.length > 0)
}

// --- 1. Get Unit Stats ---
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

// --- 2. Get Weapon Stats ---
export function getWeaponStats(weaponNode: SelectionNode): ArmyListWeapon[] {
    const profiles: WeaponProfile[] = []

    const parseProfile = (profile: Profile): WeaponProfile => ({
        name: profile.name ?? "Unknown",
        keywords: parseKeywords(getCharacteristic(profile, "Keywords")),
        range: getCharacteristic(profile, "Range"),
        attacks: getCharacteristic(profile, "A"),
        skill: getCharacteristic(profile, "BS") !== "-" ? getCharacteristic(profile, "BS") : getCharacteristic(profile, "WS"),
        strength: getCharacteristic(profile, "S"),
        ap: getCharacteristic(profile, "AP"),
        damage: getCharacteristic(profile, "D"),
    })

    weaponNode.profiles?.forEach(p => {
        if (p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons") {
            profiles.push(parseProfile(p))
        }
    })

    if (profiles.length === 0 && weaponNode.selections) {
        weaponNode.selections.forEach(child => {
            child.profiles?.forEach(p => {
                if (p.typeName === "Ranged Weapons" || p.typeName === "Melee Weapons") {
                    profiles.push(parseProfile(p))
                }
            })
        })
    }

    if (profiles.length === 0) return []

    return [{
        name: weaponNode.name ?? "Unknown Weapon",
        count: weaponNode.number ?? 1,
        profiles: profiles
    }]
}

// --- 3. Rules Collection & Categorization ---

function findDescription(p: Profile): string | null {
    const fields = ["Description", "Effect", "Ability"];
    for (const field of fields) {
        const val = getCharacteristic(p, field);
        if (val && val !== "-") return val;
    }
    return null;
}

function collectAllRules(node: SelectionNode, collected: Map<string, { description: string, typeName: string }>) {
    node.rules?.forEach(r => {
        if (r.name && r.description) {
            collected.set(r.name, { description: r.description, typeName: "Abilities" });
        }
    });

    node.profiles?.forEach(p => {
        const rawTypeName = (p as any).typeName || p.typeName || "Unknown";
        const typeName = typeof rawTypeName === 'string' ? rawTypeName.trim() : "Unknown";

        // ✅ ป้องกัน "LedBy" ไปโผล่เป็นกล่องเขียวด้านซ้าย
        const excludedTypes = ["Unit", "Model", "Ranged Weapons", "Melee Weapons", "LedBy"];
        if (!excludedTypes.includes(typeName)) {
            const desc = findDescription(p);
            if (p.name && desc) {
                collected.set(p.name, { description: desc, typeName: typeName });
            }
        }
    });

    node.selections?.forEach(child => {
        collectAllRules(child, collected);
    });
}

export function getAbilitiesAndKeywords(node: SelectionNode) {
    const abilities: Record<string, AbilityRule[]> = {
        "Core": [],
        "Faction": [],
        "Abilities": [],
        "Leader": [],
        "LedBy": [], // ✅ เพิ่มหมวดใหม่
        "Invuln": [],
        "Damaged": [],
        "Wargear": [],
        "WeaponRules": []
    }

    const allRulesMap = new Map<string, { description: string, typeName: string }>();
    collectAllRules(node, allRulesMap);

    allRulesMap.forEach((val, name) => {
        const { description, typeName } = val;
        const lowerName = name.toLowerCase();

        // 2.1 Special Hardcoded Checks
        if (lowerName.includes("invulnerable save")) {
            abilities["Invuln"].push({ name, description });
            return;
        }
        if (lowerName.startsWith("damaged:")) {
            abilities["Damaged"].push({ name, description });
            return;
        }

        // ✅ แยก Leader กับ Attached Unit (Led By) ออกจากกัน
        if (lowerName === "leader") {
            abilities["Leader"].push({ name, description });
            abilities["Core"].push({ name, description }); // โชว์ในบรรทัด CORE: Leader
            return;
        }

        // ✅ ดักจับพวกกฎรายชื่อหัวหน้าของยูนิตลูกน้อง
        if (lowerName.includes("attached unit") || lowerName.includes("led by")) {
            abilities["LedBy"].push({ name, description });
            return;
        }

        // 2.2 Core Rules
        const coreRules = [
            "deep strike", "scouts", "infiltrators", "lone operative",
            "stealth", "fights first", "feel no pain", "deadly demise", "hover"
        ];
        if (coreRules.some(k => lowerName.startsWith(k) || lowerName === k)) {
            abilities["Core"].push({ name, description });
            return;
        }

        // 2.3 Faction Rules
        const factionRules = [
            "oath of moment", "synapse", "shadow in the warp",
            "acts of faith", "orders", "waaagh!", "judgement tokens", "strands of fate",
            "blessings of khorne"
        ];
        if (factionRules.some(k => lowerName === k)) {
            abilities["Faction"].push({ name, description });
            return;
        }

        // 2.4 Weapon Rules
        const weaponRules = [
            "anti-", "devastating wounds", "lethal hits", "sustained hits",
            "precision", "rapid fire", "assault", "heavy", "pistol",
            "blast", "indirect fire", "twin-linked", "hazardous",
            "torrent", "lance", "ignores cover", "melta", "extra attacks"
        ];
        if (weaponRules.some(k => lowerName.startsWith(k))) {
            abilities["WeaponRules"].push({ name, description });
            return;
        }

        // 2.5 ✅ CUSTOM CATEGORIES
        if (typeName &&
            typeName !== "Abilities" &&
            typeName !== "Rule" &&
            typeName !== "Wargear" &&
            typeName !== "Unknown" &&
            typeName !== "LedBy" // ✅ กัน LedBy โผล่ซ้าย
        ) {
            if (!abilities[typeName]) {
                abilities[typeName] = [];
            }
            abilities[typeName].push({ name, description });
        } else {
            // คัดแยกอีกที ถ้าชื่อเป็น LedBy ให้ลงกล่อง LedBy
            if (typeName === "LedBy") {
                abilities["LedBy"].push({ name, description });
            } else {
                abilities["Abilities"].push({ name, description });
            }
        }
    });

    // 3. Keywords Logic
    const allKeywords = node.categories?.map(c => c.name ?? "") ?? []
    const factionKeywords = allKeywords.filter(k =>
        k.startsWith("Faction:") ||
        k.includes("Adeptus") || k.includes("Heretic") ||
        k.includes("Aeldari") || k.includes("Tyranids") || k.includes("T'au") ||
        k.includes("Imperium") || k.includes("Chaos") || k.includes("Xenos") ||
        k.includes("World Eaters") || k.includes("Votann")
    ).map(k => k.replace("Faction: ", ""))

    const keywords = allKeywords.filter(k =>
        !k.startsWith("Faction:") &&
        !factionKeywords.includes(k) &&
        !factionKeywords.includes("Faction: " + k) &&
        k !== "Configuration"
    )

    return { abilities, keywords, factionKeywords }
}