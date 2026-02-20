// app/lib/wahapedia/lookup.ts
// 1. Import JSON
import stratagemsJson from '@/app/data/wahapedia/Stratagems.json';
import abilitiesJson from '@/app/data/wahapedia/Abilities.json';
import detachmentAbilitiesJson from '@/app/data/wahapedia/Detachment_abilities.json';
import datasheetsAbilitiesJson from '@/app/data/wahapedia/Datasheets_abilities.json';
import factionsJson from '@/app/data/wahapedia/Factions.json';
import datasheetsJson from '@/app/data/wahapedia/Datasheets.json';
import datasheetsLeaderJson from '@/app/data/wahapedia/Datasheets_leader.json'; 
import datasheetsKeywordsJson from '@/app/data/wahapedia/Datasheets_keywords.json'; 

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
    detachment?: string;
}

const stratagemsData = stratagemsJson as WahapediaStratagem[];
const abilitiesData = abilitiesJson as WahapediaAbility[];
const detachmentAbilitiesData = detachmentAbilitiesJson as WahapediaAbility[];
const datasheetsAbilitiesData = datasheetsAbilitiesJson as WahapediaAbility[];
const datasheetsData = datasheetsJson as any[];
const leaderData = datasheetsLeaderJson as any[];
const factionsData = factionsJson as any[];
const keywordsData = datasheetsKeywordsJson as any[];

// ==========================================
// 🛡️ Helper 1: ล้างชื่อยูนิตให้สะอาดก่อนสืบค้น (ป้องกันการ Fallback ไปหา Raw Text)
// ==========================================
const cleanDatasheetName = (name: string): string => {
    if (!name) return "";
    let n = name.toLowerCase().trim();
    n = n.replace(/\s+-\s+warlord/gi, ''); // ลบ Warlord
    n = n.replace(/\s*\[.*?\]/g, ''); // ลบวงเล็บเหลี่ยม เช่น [1]
    n = n.replace(/\s*\(.*?\)/g, ''); // ลบวงเล็บกลม เช่น (5 models)
    n = n.split(' - ')[0]; // เผื่อมีอาวุธต่อท้าย
    return n.trim();
};

// ==========================================
// 🛑 Helper 2: ฟังก์ชันกรองยูนิตขยะ อิงจากโครงสร้าง URL และ Flag ของ Wahapedia
// ==========================================
const isValidUnit = (sheet: any): boolean => {
    if (!sheet || !sheet.name) return false;
    const linkStr = (sheet.link || "").toLowerCase();
    const lowerName = sheet.name.toLowerCase();

    // 1. กรองจาก URL โฟลเดอร์พิเศษ (ไดนามิก 100% ไม่ต้องจำชื่อยูนิต)
    if (
        linkStr.includes('/legends/') || 
        linkStr.includes('/combat-patrol/') || 
        linkStr.includes('/kill-team/') || 
        linkStr.includes('/boarding-actions/') ||
        linkStr.includes('/box-sets/') ||
        linkStr.includes('/titans/')
    ) return false;

    // 2. กรองยูนิตจำลอง (Virtual)
    if (sheet.virtual === "true" || sheet.virtual === true) return false;

    // 3. กรองคำว่า Legend หรือตัวโปรโมบางตัวที่ยังตกค้าง
    if (lowerName.includes('legend')) return false;
    
    // 4. Blacklist เฉพาะตัวที่เคยเป็นปัญหาในโคเด็กซ์เก่า
    const exactTrashNames = [
        'primaris company champion', 'inquisitor eisenhorn',
        'inquisitor ostromandeus', 'inquisitor in terminator armour',
        'inquisitor karamazov', 'relic terminator squad',
        'deathwing command squad', 'deathwing strikemaster',
        'command squad'
    ];
    if (exactTrashNames.includes(lowerName)) return false;

    const partialTrashNames = ['kastiel', 'xacharus', 'titus'];
    if (partialTrashNames.some(t => lowerName.includes(t))) return false;

    return true; 
};

// ==========================================
// 🔍 1. ฟังก์ชันค้นหา Stratagems 
// ==========================================
export const getApplicableStratagems = (
    detachmentName: string,
    unitKeywords: string[] = [],
    factionKeywords: string[] = []
): WahapediaStratagem[] => {
    // (คงโค้ด Stratagems เดิมไว้ ไม่มีการเปลี่ยนแปลง)
    const coreStratagems = stratagemsData.filter((s) => {
        const typeStr = (s.type || "").toLowerCase();
        const name = s.name.toUpperCase().trim();
        if (!typeStr.includes("core")) return false;
        if (typeStr.includes("boarding") || typeStr.includes("challenger") || typeStr.includes("crusade")) return false;
        if (name === "NEW ORDERS") return false;
        return true; 
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

        if (name === "COMMAND RE-ROLL" || name === "RAPID INGRESS" || name === "COUNTER-OFFENSIVE" || name === "INSANE BRAVERY") return true;
        if (name === "GO TO GROUND") return allKws.includes("infantry") || allKws.includes("beast") || allKws.includes("swarm");
        if (name === "HEROIC INTERVENTION" || name === "FIRE OVERWATCH") return !allKws.includes("titanic") && !allKws.includes("aircraft");
        if (name === "EPIC CHALLENGE") return allKws.includes("character");
        if (name === "GRENADE") return allKws.includes("grenades");
        if (name === "SMOKESCREEN") return allKws.includes("smokescreen");
        if (name === "TANK SHOCK") return allKws.includes("vehicle");

        if (allKws.includes("vehicle") && desc.includes("excluding vehicles")) return false;
        if (allKws.includes("monster") && desc.includes("excluding monsters")) return false;
        if (allKws.includes("character") && desc.includes("excluding characters")) return false;
        if (allKws.includes("titanic") && desc.includes("excluding titanic")) return false;

        const targetMatch = desc.match(/target:.*?<br>/);
        const targetText = targetMatch ? targetMatch[0] : desc;
        const coreTypes = ["infantry", "vehicle", "monster", "mounted", "swarm", "beast", "character", "fly", "aircraft"];
        const neededTypes = coreTypes.filter(type => new RegExp(`\\b${type}\\b`).test(targetText));

        if (neededTypes.length > 0) {
            const hasIt = neededTypes.some(type => allKws.includes(type));
            if (!hasIt) return false;
        }
        return true;
    });
};

// ==========================================
// 🔍 2. ฟังก์ชันค้นหา Descriptions
// ==========================================
export const getAbilityDescription = (name: string): string | null => {
    if (!name) return null;
    const normalizedName = name.toLowerCase().trim();
    if (normalizedName === "attached unit" || normalizedName === "leader") return null; 

    const cleanName = name.split('(')[0].replace(/\[.*?\]/g, '').toLowerCase().trim();
    const allSources = [datasheetsAbilitiesData, abilitiesData, detachmentAbilitiesData];

    for (const source of allSources) {
        let found = source.find(a => a.name.toLowerCase().trim() === normalizedName);
        if (!found) found = source.find(a => a.name.toLowerCase().trim() === cleanName);
        if (found && found.description) return found.description;
    }
    return null;
};

// ==========================================
// 🔍 3. หา Leader (LED BY) ที่สามารถนำลูกน้องตัวนี้ได้
// ==========================================
export const findGlobalLeaders = (
    targetUnitName: string, 
    armyFaction: string = "", 
    unitFactionKeywords: string[] = [],
    rosterUnits: any[] = [] 
): string[] => {
    if (!targetUnitName) return [];
    
    // ✅ ทำความสะอาดชื่อก่อนส่งค้นหา
    const normalizedTarget = cleanDatasheetName(targetUnitName);
    const foundLeaders = new Set<string>();

    const smChapters = [
        "dark angels", "blood angels", "space wolves", "deathwatch", "black templars",
        "ultramarines", "imperial fists", "iron hands", "raven guard", "salamanders", "white scars", "flesh tearers", "crimson fists"
    ];

    const myChapters = new Set<string>();
    const checkAndAddChapter = (kw: string) => {
        if (!kw) return;
        const k = kw.toLowerCase().trim();
        smChapters.forEach(ch => { if (k.includes(ch)) myChapters.add(ch); });
    };

    checkAndAddChapter(armyFaction);
    unitFactionKeywords.forEach(checkAndAddChapter);
    rosterUnits.forEach(u => {
        if (u.factionKeywords) u.factionKeywords.forEach(checkAndAddChapter);
        if (u.keywords) u.keywords.forEach(checkAndAddChapter);
        checkAndAddChapter(u.name); 
    });

    const targetDatasheet = datasheetsData.find(d => 
        cleanDatasheetName(d.name) === normalizedTarget && isValidUnit(d)
    );
    
    if (targetDatasheet) {
        const targetId = targetDatasheet.id;
        const targetFactionId = targetDatasheet.faction_id;

        const agentsFaction = factionsData.find(f => f.name.toLowerCase().includes("agents of the imperium"));
        const agentsId = agentsFaction ? agentsFaction.id : "AoI";

        const allowedFactionIds = new Set<string>([targetFactionId, agentsId]);
        
        factionsData.forEach(fac => {
            const facName = fac.name.toLowerCase();
            if (myChapters.has(facName) || armyFaction.toLowerCase() === facName || armyFaction.toLowerCase().includes(facName)) {
                allowedFactionIds.add(fac.id);
            }
        });

        if (targetFactionId === 'SM') {
            factionsData.forEach(fac => {
                if (smChapters.includes(fac.name.toLowerCase())) allowedFactionIds.add(fac.id);
            });
        }

        const matchedLinks = leaderData.filter(link => link.attached_id === targetId);

        matchedLinks.forEach(link => {
            const leaderSheet = datasheetsData.find(d => d.id === link.leader_id);
            
            if (leaderSheet && isValidUnit(leaderSheet)) { 
                
                const leaderFactionId = leaderSheet.faction_id;

                if (allowedFactionIds.has(leaderFactionId)) {
                    // ✅ ปลดล็อกการค้นหา Chapter (ไม่ต้องอิง is_faction_keyword อีกต่อไป)
                    const leaderKeywords = keywordsData
                        .filter(k => k.datasheet_id === leaderSheet.id)
                        .map(k => k.keyword.toLowerCase());

                    const leaderChapters = smChapters.filter(ch => leaderKeywords.some(lk => lk.includes(ch)));

                    let conflict = false;
                    
                    if (leaderChapters.length > 0) {
                        if (myChapters.size > 0) {
                            const overlap = leaderChapters.some(ch => myChapters.has(ch));
                            if (!overlap) conflict = true; 
                        } else {
                            conflict = true; // บล็อกฮีโร่เจาะจงค่าย ถ้าทัพเราไม่มีค่าย
                        }
                    }

                    if (!conflict) {
                        let cleanName = leaderSheet.name
                            .toLowerCase()
                            .replace(/\b\w/g, (c: string) => c.toUpperCase())
                            .replace(/'S\b/g, "'s"); 
                        
                        foundLeaders.add(cleanName);
                    }
                }
            }
        });
    }

    return Array.from(foundLeaders).sort();
};

// ==========================================
// 🔍 4. หา Bodyguards ที่ Leader คนนี้จะไปนำได้
// ==========================================
export const findGlobalBodyguards = (
    leaderName: string, 
    armyFaction: string = "", 
    unitFactionKeywords: string[] = [],
    rosterUnits: any[] = [] 
): string[] => {
    if (!leaderName) return [];
    
    // ✅ ทำความสะอาดชื่อก่อนส่งค้นหา
    const normalizedLeader = cleanDatasheetName(leaderName);
    const foundBodyguards = new Set<string>();

    const smChapters = [
        "dark angels", "blood angels", "space wolves", "deathwatch", "black templars",
        "ultramarines", "imperial fists", "iron hands", "raven guard", "salamanders", "white scars", "flesh tearers", "crimson fists"
    ];

    const myChapters = new Set<string>();
    const checkAndAddChapter = (kw: string) => {
        if (!kw) return;
        const k = kw.toLowerCase().trim();
        smChapters.forEach(ch => { if (k.includes(ch)) myChapters.add(ch); });
    };

    checkAndAddChapter(armyFaction);
    unitFactionKeywords.forEach(checkAndAddChapter);
    rosterUnits.forEach(u => {
        if (u.factionKeywords) u.factionKeywords.forEach(checkAndAddChapter);
        if (u.keywords) u.keywords.forEach(checkAndAddChapter);
        checkAndAddChapter(u.name); 
    });

    const leaderDatasheet = datasheetsData.find(d => 
        cleanDatasheetName(d.name) === normalizedLeader && isValidUnit(d)
    );
    
    if (leaderDatasheet) {
        const leaderId = leaderDatasheet.id;
        const matchedLinks = leaderData.filter(link => link.leader_id === leaderId);

        matchedLinks.forEach(link => {
            const bgSheet = datasheetsData.find(d => d.id === link.attached_id);
            
            if (bgSheet && isValidUnit(bgSheet)) { 
                
                // ✅ ปลดล็อกการค้นหา Chapter
                const bgKeywords = keywordsData
                    .filter(k => k.datasheet_id === bgSheet.id)
                    .map(k => k.keyword.toLowerCase());

                const bgChapters = smChapters.filter(ch => bgKeywords.some(lk => lk.includes(ch)));

                let conflict = false;
                
                if (bgChapters.length > 0) {
                    if (myChapters.size > 0) {
                        const overlap = bgChapters.some(ch => myChapters.has(ch));
                        if (!overlap) conflict = true; 
                    } else {
                        conflict = true; 
                    }
                }

                if (!conflict) {
                    let cleanName = bgSheet.name
                        .toLowerCase()
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())
                        .replace(/'S\b/g, "'s"); 
                    
                    foundBodyguards.add(cleanName);
                }
            }
        });
    }

    return Array.from(foundBodyguards).sort();
};