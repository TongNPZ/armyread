// app/lib/constants/factionColors.ts

export const DEFAULT_COLOR = "#206173"

export const FACTION_COLORS: Record<string, string> = {
    // ==========================================
    // ⚔️ SPACE MARINES & IMPERIUM
    // ==========================================
    "Ultramarines": "#0D407F",
    "Blood Angels": "#9A1115",
    "Dark Angels": "#004427",
    "Space Wolves": "#6C7F8E",
    "Imperial Fists": "#E6A700",
    "Crimson Fists": "#0B1F3F",
    "Black Templars": "#000000",
    "Salamanders": "#24A348",
    "Raven Guard": "#1A1A1A",
    "White Scars": "#D1D1D1",
    "Iron Hands": "#454545",
    "Deathwatch": "#2C2C2C",

    "Adeptus Custodes": "#C29643",
    "Adepta Sororitas": "#750E13",
    "Adeptus Mechanicus": "#8C2F28",
    "Astra Militarum": "#435640",
    "Imperial Guard": "#435640",
    "Imperial Knights": "#102845",
    "Grey Knights": "#6F808C",
    "Agents of the Imperium": "#B6882D",

    // ==========================================
    // 💀 CHAOS
    // ==========================================
    "World Eaters": "#880E08",
    "Death Guard": "#566236",
    "Thousand Sons": "#005068",
    "Chaos Space Marines": "#181C1F",
    "Black Legion": "#000000",
    "Word Bearers": "#581216",
    "Alpha Legion": "#265C62",
    "Iron Warriors": "#585552",
    "Night Lords": "#081545",
    "Emperor's Children": "#5C2652",
    "Chaos Knights": "#463628",
    "Daemons": "#5E1E23",

    // ==========================================
    // 👽 XENOS
    // ==========================================
    "Necrons": "#195627",
    "Orks": "#3D6628",

    "Tyranids": "#4E3056",
    "Genestealer Cults": "#4E3056",

    "T'au Empire": "#138c97",
    "Tau Empire": "#138c97",
    "Leagues of Votann": "#005952",

    // Aeldari Logic Update
    "Aeldari": "#166970",           // Teal (Saim-Hann/Generic) - จะถูกใช้ถ้าไม่เจอ Craftworld
    "Asuryani": "#166970",
    "Craftworlds": "#166970",
    "Drukhari": "#093836",
    "Harlequins": "#75181C",
    "Ynnari": "#78080E",

    // ==========================================
    // 📦 GENERIC / FALLBACKS
    // ==========================================
    "Adeptus Astartes": "#3A4B56",
    "Space Marines": "#3A4B56",
    "Imperium": "#3A4B56",
    "Chaos": "#261616",
    "Xenos": "#3D6628" // สีเขียวนี้จะใช้ก็ต่อเมื่อไม่เจอเผ่าอื่นเลย
}

// ✅ แก้ไขรายการคำทั่วไป (Priority ต่ำสุด)
const GENERIC_KEYWORDS = [
    "Adeptus Astartes",
    "Space Marines",
    "Chaos Space Marines",
    "Heretic Astartes",
    "Imperium",
    "Chaos",
    "Tyranids",
    "Xenos" // ✅ เพิ่ม Xenos เพื่อให้เป็นสีสุดท้ายจริงๆ
    // ❌ ลบ Aeldari ออก เพื่อให้มันเป็นสีหลักได้
];

export function getFactionColor(factionName?: string): string {
    if (!factionName) return DEFAULT_COLOR

    const nameLower = factionName.toLowerCase()

    // 1. หา Keys ทั้งหมดที่ "มีส่วน" อยู่ใน factionName
    const matches = Object.keys(FACTION_COLORS).filter(k =>
        nameLower.includes(k.toLowerCase())
    )

    if (matches.length === 0) return DEFAULT_COLOR

    // 2. Priority Check: หาคำที่ไม่ใช่ Generic ก่อน
    const specificMatch = matches.find(k => !GENERIC_KEYWORDS.includes(k))

    if (specificMatch) {
        return FACTION_COLORS[specificMatch]
    }

    // 3. Fallback
    return FACTION_COLORS[matches[0]]
}