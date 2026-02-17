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

// --- 1. Get Unit Stats (M, T, SV, W, LD, OC) ---
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

// --- 2. Get Weapon Stats (with Grouping Logic) ---
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

// ✅ Helper ใหม่: หาคำอธิบายโดยไล่เช็ค Description -> Effect -> Ability
function findDescription(p: Profile): string | null {
    const fields = ["Description", "Effect", "Ability"];
    for (const field of fields) {
        const val = getCharacteristic(p, field);
        if (val && val !== "-") return val;
    }
    return null;
}

function collectAllRules(node: SelectionNode, collected: Map<string, { description: string, typeName: string }>) {
    // 1. Rules (Node level) -> ถือว่าเป็น Ability ทั่วไป
    node.rules?.forEach(r => {
        if (r.name && r.description) {
            collected.set(r.name, { description: r.description, typeName: "Abilities" });
        }
    });

    // 2. Profiles -> เช็คทุกประเภทที่ไม่ใช่ Unit/Weapon/Model
    node.profiles?.forEach(p => {
        const rawTypeName = (p as any).typeName || p.typeName || "Unknown";
        const typeName = typeof rawTypeName === 'string' ? rawTypeName.trim() : "Unknown";

        const excludedTypes = ["Unit", "Model", "Ranged Weapons", "Melee Weapons"];

        if (!excludedTypes.includes(typeName)) {
            // ✅ FIX: ใช้ฟังก์ชันหา Description ที่ฉลาดขึ้น (แก้ปัญหา "-" บัง Effect)
            const desc = findDescription(p);

            if (p.name && desc) {
                // Debug: เช็คว่าเจอ Custom Rule ไหม (ดูใน Browser Console F12)
                if (typeName !== "Abilities" && typeName !== "Wargear" && typeName !== "Rule") {
                    console.log(`[ArmyHelpers] Found Custom Rule: "${p.name}", Type: "${typeName}", Desc: "${desc.substring(0, 20)}..."`);
                }

                collected.set(p.name, { description: desc, typeName: typeName });
            }
        }
    });

    // 3. Recursive
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
        "Invuln": [],
        "Damaged": [],
        "Wargear": [],
        "WeaponRules": []
    }

    // 1. รวบรวม Rules ทั้งหมดพร้อม TypeName
    const allRulesMap = new Map<string, { description: string, typeName: string }>();
    collectAllRules(node, allRulesMap);

    // 2. แยกหมวดหมู่ (Sorting Logic)
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
        // ✅ เปลี่ยนมาใช้ lowerName === "leader" เพื่อกันปัญหาตัวพิมพ์เล็ก/ใหญ่
        if (lowerName === "leader" || lowerName.includes("attached unit")) {
            // จับใส่กล่อง Leader เพื่อไปสร้างกล่องรายชื่อ Unit ด้านล่าง
            abilities["Leader"].push({ name, description });

            // ✅ ก๊อปปี้เฉพาะคำว่า "Leader" ไปใส่กล่อง Core ด้วย! 
            // เพื่อให้มันโชว์ในบรรทัด CORE: Leader และมี Popup Tooltip ให้จิ้มดูรายชื่อได้
            if (lowerName === "leader") {
                abilities["Core"].push({ name, description });
            }
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
            typeName !== "Unknown"
        ) {
            if (!abilities[typeName]) {
                abilities[typeName] = [];
            }
            abilities[typeName].push({ name, description });
        } else {
            abilities["Abilities"].push({ name, description });
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