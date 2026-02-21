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
// ✅ Import Enhancements & Detachments
import enhancementsJson from '@/app/data/wahapedia/Enhancements.json';
import detachmentsJson from '@/app/data/wahapedia/Detachments.json';

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
const enhancementsData = enhancementsJson as any[]; 
const detachmentsData = detachmentsJson as any[]; 

// ==========================================
// 📜 คลังกติกากลางสำหรับ "อาวุธ"
// ==========================================
const CORE_WEAPON_RULES: Record<string, string> = {
    "rapid fire": `<em>Rapid fire weapons are capable of long-ranged precision shots or controlled bursts at nearby targets.</em><br/><br/>Weapons with <strong>[RAPID FIRE X]</strong> in their profile are known as Rapid Fire weapons. Each time such a weapon targets a unit within half that weapon’s range, the Attacks characteristic of that weapon is increased by the amount denoted by ‘x’.<br/><br/><strong>Example:</strong> A model targets a unit that is within half range of a weapon with an Attacks characteristic of 1 and the <strong>[RAPID FIRE 1]</strong> ability. That weapon therefore makes two attacks at the target, and you make two Hit rolls.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[RAPID FIRE X]:</strong> Increase the Attacks by ‘x’ when targeting units within half range.</div>`,
    "devastating wounds": `<em>Weapons with Devastating Wounds can inflict massive damage, bypassing enemy armor.</em><br/><br/>Weapons with <strong>[DEVASTATING WOUNDS]</strong> in their profile are known as Devastating Wounds weapons. Each time an attack is made with such a weapon, a Critical Wound inflicts a number of mortal wounds on the target equal to the Damage characteristic of that weapon and the attack sequence ends.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[DEVASTATING WOUNDS]:</strong> A Critical Wound inflicts mortal wounds equal to the weapon's Damage characteristic, instead of normal damage.</div>`,
    "lethal hits": `<em>Weapons with Lethal Hits can automatically wound targets.</em><br/><br/>Weapons with <strong>[LETHAL HITS]</strong> in their profile are known as Lethal Hits weapons. Each time an attack is made with such a weapon, a Critical Hit automatically wounds the target. (Do not make a Wound roll for that attack).<br/><br/><div style="padding-left: 10px;">&bull; <strong>[LETHAL HITS]:</strong> A Critical Hit automatically wounds the target.</div>`,
    "sustained hits": `<em>Weapons with Sustained Hits can score additional hits.</em><br/><br/>Weapons with <strong>[SUSTAINED HITS X]</strong> in their profile are known as Sustained Hits weapons. Each time an attack is made with such a weapon, a Critical Hit scores 'x' additional hits on the target.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[SUSTAINED HITS X]:</strong> A Critical Hit scores 'x' additional hits.</div>`,
    "blast": `<em>Weapons with Blast are highly effective against large groups of enemies.</em><br/><br/>Weapons with <strong>[BLAST]</strong> in their profile are known as Blast weapons. Each time you shoot with such a weapon, add 1 to the Attacks characteristic for every 5 models in the target unit (rounding down).<br/><br/><div style="padding-left: 10px;">&bull; <strong>[BLAST]:</strong> Add 1 to the Attacks characteristic for every 5 models in the target unit.</div>`,
    "heavy": `<em>Weapons with Heavy are more accurate when the firer remains stationary.</em><br/><br/>Weapons with <strong>[HEAVY]</strong> in their profile are known as Heavy weapons. Each time an attack is made with such a weapon, if the attacking model's unit Remained Stationary this phase, add 1 to the Hit roll.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[HEAVY]:</strong> Add 1 to Hit rolls if the unit Remained Stationary.</div>`,
    "anti": `<em>Anti weapons are specialized to take down specific target types.</em><br/><br/>Weapons with <strong>[ANTI-KEYWORD X+]</strong> in their profile are known as Anti weapons. Each time an attack is made with such a weapon against a target with the matching keyword, an unmodified Wound roll of 'x' or more scores a Critical Wound.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[ANTI-KEYWORD X+]:</strong> An unmodified Wound roll of 'x'+ against a target with the matching keyword scores a Critical Wound.</div>`,
    "twin-linked": `<em>Weapons with Twin-linked are reliable and precise.</em><br/><br/>Weapons with <strong>[TWIN-LINKED]</strong> in their profile are known as Twin-linked weapons. Each time an attack is made with such a weapon, you can re-roll the Wound roll.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[TWIN-LINKED]:</strong> You can re-roll the Wound roll.</div>`,
    "ignores cover": `<em>Weapons with Ignores Cover bypass the enemy's defensive positions.</em><br/><br/>Weapons with <strong>[IGNORES COVER]</strong> in their profile are known as Ignores Cover weapons. Each time an attack is made with such a weapon, the target cannot have the Benefit of Cover against that attack.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[IGNORES COVER]:</strong> Target cannot have the Benefit of Cover.</div>`,
    "precision": `<em>Weapons with Precision can pick out key enemy personnel.</em><br/><br/>Weapons with <strong>[PRECISION]</strong> in their profile are known as Precision weapons. Each time an attack is made with such a weapon, if a Character model is visible to the attacking model, the attacking model's player can allocate that attack to that Character model instead of following the normal attack allocation rules.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[PRECISION]:</strong> Can allocate attacks to visible Character models.</div>`,
    "melta": `<em>Weapons with Melta are incredibly destructive at close range.</em><br/><br/>Weapons with <strong>[MELTA X]</strong> in their profile are known as Melta weapons. Each time an attack made with such a weapon targets a unit within half that weapon's range, the Damage characteristic of that weapon is increased by the amount denoted by 'x'.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[MELTA X]:</strong> Increase the Damage by 'x' when targeting units within half range.</div>`,
    "indirect fire": `<em>Weapons with Indirect Fire can hit targets that are out of sight.</em><br/><br/>Weapons with <strong>[INDIRECT FIRE]</strong> in their profile are known as Indirect Fire weapons. They can target units that are not visible to the firing model. If the target is not visible, subtract 1 from the Hit roll and the target has the Benefit of Cover against that attack.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[INDIRECT FIRE]:</strong> Can target units that are not visible. If not visible, -1 to Hit and target has Benefit of Cover.</div>`,
    "pistol": `<em>Weapons with Pistol can be fired in close combat.</em><br/><br/>Weapons with <strong>[PISTOL]</strong> in their profile are known as Pistol weapons. A model can shoot with a Pistol weapon even if its unit is within Engagement Range of one or more enemy units. A model cannot shoot with both Pistol and non-Pistol ranged weapons in the same phase.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[PISTOL]:</strong> Can shoot even if within Engagement Range. Cannot be fired with non-Pistol weapons.</div>`,
    "assault": `<em>Weapons with Assault can be fired on the move.</em><br/><br/>Weapons with <strong>[ASSAULT]</strong> in their profile are known as Assault weapons. A unit can shoot with Assault weapons even if it Advanced this turn.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[ASSAULT]:</strong> Can shoot even if the unit Advanced.</div>`,
    "lance": `<em>Weapons with Lance are devastating on the charge.</em><br/><br/>Weapons with <strong>[LANCE]</strong> in their profile are known as Lance weapons. Each time an attack is made with such a weapon, if the attacking model's unit made a Charge move this turn, add 1 to the Wound roll.<br/><br/><div style="padding-left: 10px;">&bull; <strong>[LANCE]:</strong> +1 to Wound rolls if the unit charged this turn.</div>`
};

// ==========================================
// 🌟 6. ฟังก์ชันค้นหากฎอัตโนมัติจากฐานข้อมูล JSON 100% (Fuzzy Search)
// ไม่ใช้ Hardcode แล้ว ค้นหาจาก Wahapedia ตรงๆ เลย
// ==========================================
export const findWahapediaRuleByText = (text: string): { name: string, description: string } | null => {
    if (!text || text.length < 10) return null;

    // ล้างข้อความแบบโหดสุดๆ: ตัดทุกอย่างที่ไม่ใช่ตัวอักษรและตัวเลข (ใช้หา Substring แม่นยำ 100%)
    const cleanInputExact = text.replace(/<[^>]*>?/gm, ' ').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // แบบแยกคำ: เอาไว้ใช้เช็คความคล้าย (Fuzzy matching) ตัดคำที่สั้นกว่า 3 ตัวอักษรทิ้ง
    const inputWords = text.replace(/<[^>]*>?/gm, ' ').replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const allSources = [detachmentAbilitiesData, abilitiesData, datasheetsAbilitiesData];

    let bestMatch = null;
    let highestScore = 0;

    for (const source of allSources) {
        if (!source) continue;

        for (const a of source) {
            if (!a.description) continue;

            const cleanTargetExact = a.description.replace(/<[^>]*>?/gm, ' ').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            // 🎯 วิธีที่ 1: ตรวจสอบแบบ Substring (สแกนข้อความซ้อนทับกัน)
            // ถ้า New Recruit ตัดข้อความมาแค่ครึ่งเดียว แต่มันตรงกับ Wahapedia เป๊ะๆ จะโดนจับคู่ทันที
            if (cleanTargetExact.includes(cleanInputExact) || cleanInputExact.includes(cleanTargetExact)) {
                let desc = a.description;
                if ((a as any).legend) {
                    desc = `<div style="margin-bottom: 8px; font-style: italic; color: #888;">${(a as any).legend}</div>${desc}`;
                }
                return { name: a.name, description: desc };
            }

            // 🎯 วิธีที่ 2: ตรวจสอบความคล้ายคลึงของคำศัพท์ (Fuzzy Word Match)
            // แก้ปัญหากรณี New Recruit พิมพ์เว้นวรรคผิด หรือตกหล่นบางตัว
            if (inputWords.length >= 3) {
                const targetWords = a.description.replace(/<[^>]*>?/gm, ' ').replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
                
                let matchCount = 0;
                for (const w of inputWords) {
                    if (targetWords.includes(w)) matchCount++;
                }

                const score = matchCount / inputWords.length;
                
                // ถ้าระบุตรงกันเกิน 60% ของคำทั้งหมด ถือว่าเป็นกฎเดียวกัน
                if (score > highestScore && score >= 0.6) {
                    highestScore = score;
                    let desc = a.description;
                    if ((a as any).legend) {
                        desc = `<div style="margin-bottom: 8px; font-style: italic; color: #888;">${(a as any).legend}</div>${desc}`;
                    }
                    bestMatch = { name: a.name, description: desc };
                }
            }
        }
    }

    // ส่งคืนผลลัพธ์ที่ใกล้เคียงที่สุด (ถ้าหาเจอ)
    return bestMatch;
};

// ==========================================
// 🛡️ Helper 1: ล้างชื่อยูนิตให้สะอาดก่อนสืบค้น
// ==========================================
export const cleanDatasheetName = (name: string): string => {
    if (!name) return "";
    let n = name.toLowerCase().trim();
    n = n.replace(/\s+-\s+warlord/gi, '');
    n = n.replace(/\s*\[.*?\]/g, '');
    n = n.replace(/\s*\(.*?\)/g, '');
    n = n.split(' - ')[0];
    return n.trim();
};

// ==========================================
// 🛑 Helper 2: ฟังก์ชันกรองยูนิตขยะ
// ==========================================
export const isValidUnit = (sheet: any): boolean => {
    if (!sheet || !sheet.name) return false;
    const linkStr = (sheet.link || "").toLowerCase();
    const lowerName = sheet.name.toLowerCase();

    if (
        linkStr.includes('/legends/') ||
        linkStr.includes('/combat-patrol/') ||
        linkStr.includes('/kill-team/') ||
        linkStr.includes('/boarding-actions/') ||
        linkStr.includes('/box-sets/') ||
        linkStr.includes('/titans/')
    ) return false;

    if (sheet.virtual === "true" || sheet.virtual === true) return false;
    if (lowerName.includes('legend')) return false;

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
export const getAbilityDescription = (name: string, bypassBlocklist = false): string | null => {
    if (!name) return null;
    let normalizedName = name.toLowerCase().trim();

    if (!bypassBlocklist) {
        if (
            normalizedName === "attached unit" ||
            normalizedName === "leader" ||
            normalizedName === "transport"
        ) {
            return null;
        }
    }

    let noBracketName = normalizedName.replace(/\[|\]|\(|\)/g, '').trim();
    noBracketName = noBracketName.replace(/aura\s*\d+"/gi, 'aura').trim();

    let cleanName = noBracketName.replace(/\s*[-]?\s*([Dd]?\d+)\+?$/, '').trim();

    if (CORE_WEAPON_RULES[cleanName]) {
        return CORE_WEAPON_RULES[cleanName];
    }
    if (cleanName.startsWith('anti-')) {
        return CORE_WEAPON_RULES['anti'];
    }

    const foundEnhancement = enhancementsData.find(e => e.name.toLowerCase().trim() === normalizedName || e.name.toLowerCase().trim() === cleanName);
    if (foundEnhancement && foundEnhancement.description) {
        return foundEnhancement.description;
    }

    const allSources = [datasheetsAbilitiesData, abilitiesData, detachmentAbilitiesData];

    for (const source of allSources) {
        let found = source.find(a => a.name.toLowerCase().trim() === normalizedName);
        if (!found) found = source.find(a => a.name.toLowerCase().trim() === noBracketName);
        if (!found) found = source.find(a => a.name.toLowerCase().trim() === cleanName);
        if (!found) found = source.find(a => a.name.toLowerCase().trim() === `${cleanName} x`);
        if (!found && cleanName.startsWith('anti-')) found = source.find(a => a.name.toLowerCase().trim() === 'anti-');

        if (found && found.description) {
            return found.description;
        }
    }

    return null;
};

// ==========================================
// 🌟 3. ฟังก์ชันดึงกฎทั้งหมดของ Detachment
// ==========================================
export const getWahapediaDetachmentRules = (detachmentName: string): { name: string, description: string }[] => {
    if (!detachmentName) return [];

    let cleanName = detachmentName.toLowerCase().replace(/\(detachment.*?\)/gi, '').trim();

    const detachment = detachmentsData.find(d => d.name.toLowerCase().trim() === cleanName);
    if (!detachment) return [];

    const rules = (detachmentAbilitiesData as any[]).filter(a => a.detachment_id === detachment.id);

    return rules.map(r => {
        let desc = r.description || "";

        if (r.legend) {
            desc = `<div style="margin-bottom: 8px; font-style: italic; color: #888;">${r.legend}</div>${desc}`;
        }

        return {
            name: r.name,
            description: desc
        };
    });
};

// ==========================================
// 🔍 4. หา Leader (LED BY)
// ==========================================
export const findGlobalLeaders = (
    targetUnitName: string,
    armyFaction: string = "",
    unitFactionKeywords: string[] = [],
    rosterUnits: any[] = []
): string[] => {
    if (!targetUnitName) return [];

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
                            conflict = true;
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
// 🔍 5. หา Bodyguards 
// ==========================================
export const findGlobalBodyguards = (
    leaderName: string,
    armyFaction: string = "",
    unitFactionKeywords: string[] = [],
    rosterUnits: any[] = []
): string[] => {
    if (!leaderName) return [];

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

// ✅ ฟังก์ชันช่วยลบเครื่องหมาย ^^ และล้างเนื้อหา Wahapedia
export const formatWahapediaText = (text: string) => {
    if (!text) return "";
    return text.replace(/\^\^/g, '').trim();
};