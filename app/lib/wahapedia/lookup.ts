// app/lib/wahapedia/lookup.ts

// 1. Import JSON
import stratagemsJson from '@/app/data/wahapedia/Stratagems.json';
import abilitiesJson from '@/app/data/wahapedia/Abilities.json';
import detachmentAbilitiesJson from '@/app/data/wahapedia/Detachment_abilities.json';
import datasheetsAbilitiesJson from '@/app/data/wahapedia/Datasheets_abilities.json';
import factionsJson from '@/app/data/wahapedia/Factions.json';

// --- Type Definitions ---
export interface WahapediaStratagem {
    id: string;
    name: string;
    type: string;
    cp_cost: string;
    legend: string;
    turn: string;
    phase: string;
    detachment: string;
    description: string;
    faction_id: string;
}

export interface WahapediaAbility {
    id?: string;
    name: string;
    description: string;
    detachment?: string; // บางไฟล์มี บางไฟล์ไม่มี
}

// 2. แปลง (Cast) ข้อมูล JSON ให้เป็น Type ที่เราระบุ
const stratagemsData = stratagemsJson as WahapediaStratagem[];
const abilitiesData = abilitiesJson as WahapediaAbility[];
const detachmentAbilitiesData = detachmentAbilitiesJson as WahapediaAbility[];
const datasheetsAbilitiesData = datasheetsAbilitiesJson as WahapediaAbility[];

// ==========================================
// 🔍 1. ฟังก์ชันค้นหา Stratagems (Ultimate Strict Filter)
// ==========================================
export const getApplicableStratagems = (
    detachmentName: string,
    unitKeywords: string[] = [],
    factionKeywords: string[] = []
): WahapediaStratagem[] => {

    // 1. ดึง Core Stratagems และลบพวกภารกิจ/โหมดแปลกๆ ทิ้ง
    const coreStratagems = stratagemsData.filter((s) => {
        const typeStr = (s.type || "").toLowerCase();
        const name = s.name.toUpperCase().trim();

        if (!typeStr.includes("core")) return false;
        if (typeStr.includes("boarding") || typeStr.includes("challenger") || typeStr.includes("crusade")) return false;
        if (name === "NEW ORDERS") return false; // ภารกิจทิ้งการ์ด

        return true; // ✅ เอา INSANE BRAVERY กลับมาแล้ว!
    });

    const detachmentStratagems = detachmentName
        ? stratagemsData.filter(s => s.detachment?.toLowerCase() === detachmentName.toLowerCase())
        : [];

    const allStratagemsRaw = [...coreStratagems, ...detachmentStratagems];
    const uniqueStratagems = Array.from(
        new Map(allStratagemsRaw.map((strat) => [strat.name.trim(), strat])).values()
    );

    if (unitKeywords.length === 0 && factionKeywords.length === 0) return uniqueStratagems;

    const allKws = [...unitKeywords, ...factionKeywords].map(k => k.toLowerCase().trim());

    return uniqueStratagems.filter((strat) => {
        const desc = strat.description?.toLowerCase() || "";
        const name = strat.name.toUpperCase().trim();

        // ----------------------------------------------------------------
        // RULE 1: Hardcoded Core (ล็อกเป้าพวกท่ามาตรฐาน)
        // ----------------------------------------------------------------
        if (name === "COMMAND RE-ROLL" || name === "RAPID INGRESS" || name === "COUNTER-OFFENSIVE" || name === "INSANE BRAVERY") return true;
        if (name === "GO TO GROUND") return allKws.includes("infantry") || allKws.includes("beast") || allKws.includes("swarm");
        if (name === "HEROIC INTERVENTION" || name === "FIRE OVERWATCH") return !allKws.includes("titanic") && !allKws.includes("aircraft");
        if (name === "EPIC CHALLENGE") return allKws.includes("character");
        if (name === "GRENADE") return allKws.includes("grenades");
        if (name === "SMOKESCREEN") return allKws.includes("smokescreen");
        if (name === "TANK SHOCK") return allKws.includes("vehicle");

        // ----------------------------------------------------------------
        // RULE 2: Exclusions (ข้อห้ามเด็ดขาด)
        // ----------------------------------------------------------------
        if (allKws.includes("vehicle") && desc.includes("excluding vehicles")) return false;
        if (allKws.includes("monster") && desc.includes("excluding monsters")) return false;
        if (allKws.includes("character") && desc.includes("excluding characters")) return false;
        if (allKws.includes("titanic") && desc.includes("excluding titanic")) return false;

        // ----------------------------------------------------------------
        // RULE 3: TARGET Parsing (สแกนแบบ Regex Word Boundary)
        // ----------------------------------------------------------------
        const targetMatch = desc.match(/target:.*?<br>/);
        const targetText = targetMatch ? targetMatch[0] : desc;

        // หาคีย์เวิร์ดบังคับ โดยใช้ \b (Word Boundary) เพื่อไม่ให้คำว่า "infantry" ไปจับมั่ว
        const coreTypes = ["infantry", "vehicle", "monster", "mounted", "swarm", "beast", "character", "fly", "aircraft"];

        // เช็คว่าใน Target มีคำบังคับพวกนี้ไหม
        const neededTypes = coreTypes.filter(type => new RegExp(`\\b${type}\\b`).test(targetText));

        // ถ้าระบุว่าต้องการอย่างน้อย 1 ประเภทในนี้ ตัวเราต้องมีตรงกับมัน!
        if (neededTypes.length > 0) {
            const hasIt = neededTypes.some(type => allKws.includes(type));
            if (!hasIt) return false;
        }

        // RULE 4: เช็คเผื่อบังคับ Faction (เช่น Target: One Adeptus Astartes unit)
        const factionTypes = ["adeptus astartes", "dark angels", "deathwing", "ravenwing"];
        const neededFactions = factionTypes.filter(f => targetText.includes(f));

        if (neededFactions.length > 0) {
            const hasFaction = neededFactions.some(f => allKws.includes(f));
            if (!hasFaction) return false;
        }

        return true;
    });
};

// ==========================================
// 🔍 2. ฟังก์ชันค้นหา Descriptions ของ Abilities และ Rules
// ==========================================
export const getAbilityDescription = (name: string): string | null => {
    if (!name) return null;

    // แบบที่ 1: ชื่อตรงตัว
    const normalizedName = name.toLowerCase().trim();

    // ✅ ปลดล็อกเอาบรรทัดที่บล็อก Leader ทิ้งไปแล้วครับ!
    
    // แบบที่ 2: ชื่อที่ตัด (Aura) หรือ [Psychic] ออก เผื่อ New Recruit พ่วงมา
    const cleanName = name.split('(')[0].replace(/\[.*?\]/g, '').toLowerCase().trim();

    // ลำดับการค้นหา: 1. ความสามารถเฉพาะ Unit -> 2. ความสามารถทั่วไป -> 3. ความสามารถ Detachment
    const allSources = [
        datasheetsAbilitiesData,
        abilitiesData,
        detachmentAbilitiesData
    ];

    for (const source of allSources) {
        // หาจากชื่อเต็มก่อน
        let found = source.find(a => a.name.toLowerCase().trim() === normalizedName);

        // ถ้าไม่เจอ ลองหาจากชื่อที่คลีนแล้ว
        if (!found) {
            found = source.find(a => a.name.toLowerCase().trim() === cleanName);
        }

        if (found && found.description) {
            // ส่งคืนค่า Description (ไม่บังคับลบ <br> เผื่อนำไปแปลงเป็น HTML ในหน้า UI ทีหลัง)
            return found.description;
        }
    }

    return null; // ถ้าหาไม่เจอจริงๆ ค่อยกลับไปใช้ของเดิมจาก New Recruit
};