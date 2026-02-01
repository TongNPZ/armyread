// app/components/Datasheet.tsx
import { useState, useMemo } from "react"
import { ArmyListUnit, WeaponProfile } from "../lib/parser/armyList/armyListTypes"
import { getFactionColor } from "../lib/constants/factionColors"

// ==========================================
// 1. ICONS
// ==========================================

const RangedIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 inline-block mr-1.5 opacity-90">
        <path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm289.1-33.4c6.5 12.4 2.3 27.8-9.7 34.9l-59.5 35.3c-7.7 4.6-17.3 4.4-24.8-.5L113 207c-9.9-6.4-12.7-19.6-6.3-29.5s19.6-12.7 29.5-6.3l109.2 70.6 47.9-28.4c12-7.1 27.4-2.9 34.5 9.1l-61.7 36.6 61.7-36.6zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0z" />
    </svg>
)

const MeleeIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 inline-block mr-1.5 opacity-90">
        <path d="M498.1 5.6c10.1 7.7 15.6 19.8 14.5 32.2-7.4 83.1-28.1 161.9-60.5 233.1-3.4 7.6-10.7 12.8-19 13.5-30.7 2.6-63.5 10.9-96.1 26.6l-2.4 1.2c-5.2-9-10.8-17.7-16.7-26.2-11.2-16.2-24.2-31.1-38.5-44.5-12.9-12-27-22.9-42.1-32.2-7.8-4.8-15.1-9.9-22-15.3l-1.1-.9C230.1 160.6 238.4 127.8 241 97.1c.7-8.3 5.9-15.6 13.5-19 71.2-32.4 150-53.1 233.1-60.5 12.4-1.1 24.5 4.4 32.2 14.5zM153.2 284.5c26.9 16.7 51.6 37 73.1 60.4 19.1 20.8 36.2 43.6 50.8 67.9l7.7 12.9c3.2 5.4 3.7 12 .9 17.6-2.7 5.7-8 9.7-14.2 10.8-42.3 7.3-81.5 24.6-115.9 49.3l-2.2 1.6c-9.2 6.6-21.9 5.2-29.5-3.3-17.3-19.3-32.3-40.3-44.6-62.5-12.7-22.8-22.9-46.9-30.2-71.9-.9-3-1.6-6-2.1-9-1.9-11.2 3.9-22.4 14.3-27.6l1.3-.6c24.7-12.4 51.2-21.7 79.1-27.1 3.9-.7 7.9-.6 11.5 1.5z" />
    </svg>
)

// ==========================================
// 2. INTERACTIVE COMPONENT
// ==========================================

interface RuleInteractiveProps {
    name: string;
    description?: string;
    color?: string;
    isWeaponRule?: boolean;
    onClick: (name: string, desc: string) => void;
    ruleMap: Record<string, string>;
}

const RuleInteractive = ({ name, description, color, isWeaponRule, onClick, ruleMap }: RuleInteractiveProps) => {
    const displayName = name.replace(/^\[|\]$/g, '').trim();

    // ค้นหาคำอธิบายจาก Map
    let finalDesc = description;
    if (!finalDesc || finalDesc === "-" || finalDesc.length < 5) {
        if (ruleMap[displayName]) {
            finalDesc = ruleMap[displayName];
        } else {
            // Fuzzy search key
            const key = Object.keys(ruleMap).find(k =>
                displayName.toLowerCase().startsWith(k.toLowerCase()) ||
                k.toLowerCase().startsWith(displayName.toLowerCase())
            );
            if (key) finalDesc = ruleMap[key];
        }
    }

    if (!finalDesc) finalDesc = "Description not found in roster.";

    const tooltipPositionClass = isWeaponRule
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

    return (
        <span
            className={`group relative cursor-pointer inline-block transition-colors duration-200
                ${isWeaponRule ? "mr-1.5" : "mr-2 mb-1 border-b border-dotted border-zinc-500 hover:border-zinc-800"}
            `}
            onClick={(e) => { e.stopPropagation(); onClick(displayName, finalDesc!); }}
        >
            <span
                className={`font-bold ${isWeaponRule ? "text-[10px] uppercase" : "text-sm text-zinc-800"} group-hover:text-black`}
                style={color && isWeaponRule ? { color: color } : {}}
            >
                {isWeaponRule ? `[${displayName}]` : displayName}
            </span>

            {/* Hover Tooltip */}
            <span className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 w-64 bg-zinc-900 text-white text-xs p-3 rounded shadow-xl z-50 pointer-events-none text-left ${tooltipPositionClass}`}>
                <span className="font-bold block mb-1 border-b border-zinc-700 pb-1 text-yellow-400 text-sm">{displayName}</span>
                <span className="leading-snug">{finalDesc}</span>
                {!isWeaponRule && (
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></span>
                )}
            </span>
        </span>
    );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function Datasheet({ unit, faction }: { unit: ArmyListUnit; faction?: string }) {
    const [selectedRule, setSelectedRule] = useState<{ name: string, description: string } | null>(null);

    if (!unit) return null;

    const primaryColor = getFactionColor(faction)

    // Data Processing
    const models = unit.models || []
    const stats = unit.stats || []
    // เรียง Stats ให้ถูกต้องตามลำดับ Warhammer
    const sortedStats = [...stats].sort((a, b) =>
        ["M", "T", "SV", "W", "LD", "OC"].indexOf(a.name) - ["M", "T", "SV", "W", "LD", "OC"].indexOf(b.name)
    )

    // รวมอาวุธจากทุก Model (Grouping)
    const allWeapons = models.flatMap(m => m.weapons || []).reduce((acc, w) => {
        const existing = acc.find(xw => xw.name === w.name)
        if (existing) {
            existing.count += w.count
        } else {
            // Clone profiles เพื่อความปลอดภัย
            acc.push({ ...w, profiles: [...w.profiles] })
        }
        return acc
    }, [] as typeof unit.models[0]['weapons'])

    // แยกประเภทอาวุธจาก Profile ตัวแรก (สมมติว่าโหมดส่วนใหญ่ประเภทเดียวกัน)
    // ถ้ามี Profile ผสม (Melee & Ranged) ในอาวุธเดียว (หายาก) ให้ถือเป็น Ranged ไว้ก่อนถ้ามี Range
    const rangedWeapons = allWeapons.filter(w => w.profiles.some(p => p.range !== "Melee"))
    const meleeWeapons = allWeapons.filter(w => w.profiles.some(p => p.range === "Melee"))

    // Map for Description Lookup
    const ruleMap: Record<string, string> = useMemo(() => {
        const map: Record<string, string> = {};
        if (unit.abilities) {
            Object.values(unit.abilities).flat().forEach(r => {
                if (r.description && r.description !== "-") {
                    map[r.name] = r.description;
                }
            });
            // เพิ่ม Weapon Rules ลงใน Map ด้วยถ้ามี
            unit.abilities["WeaponRules"]?.forEach(r => {
                map[r.name] = r.description;
            });
        }
        return map;
    }, [unit]);

    const handleRuleClick = (name: string, description: string) => {
        setSelectedRule({ name, description });
    };

    // Helper ในการ Render แถวของ Weapon Profile
    const WeaponProfileRow = ({ profile, isChild = false }: { profile: WeaponProfile, isChild?: boolean }) => (
        <div className={`flex flex-col sm:flex-row sm:items-center px-3 py-2 ${isChild ? 'bg-zinc-50 pl-8 border-l-4 border-zinc-200' : 'bg-white'} hover:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0`}>
            <div className="flex-1 mb-2 sm:mb-0 pr-2">
                <div className="font-bold text-sm uppercase leading-tight text-zinc-900 flex items-center gap-1.5">
                    {/* ถ้าเป็น Child ไม่ต้องโชว์ชื่อซ้ำถ้าชื่อเหมือนแม่ */}
                    {isChild && profile.name.includes("-") ? profile.name.split("-")[1].trim() : profile.name}
                </div>
                {profile.keywords && profile.keywords.length > 0 && (
                    <div className="mt-1 flex flex-wrap">
                        {profile.keywords.map((kw, i) => (
                            <RuleInteractive
                                key={i}
                                name={kw}
                                color={primaryColor}
                                isWeaponRule={true}
                                onClick={handleRuleClick}
                                ruleMap={ruleMap}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-6 sm:flex sm:gap-0 text-center text-sm w-full sm:w-[260px] font-bold text-zinc-700 shrink-0 tabular-nums">
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">RNG</span>{profile.range}</span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">A</span>{profile.attacks}</span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">{profile.range === 'Melee' ? 'WS' : 'BS'}</span>{profile.skill}</span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">S</span>{profile.strength}</span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">AP</span>{profile.ap}</span>
                <span className="flex-1 flex flex-col sm:block"><span className="sm:hidden text-[10px] font-bold text-zinc-400">D</span>{profile.damage}</span>
            </div>
        </div>
    )

    return (
        <div className="w-full bg-white text-zinc-900 shadow-xl font-sans mb-8 border-2 border-zinc-800 rounded-sm relative overflow-hidden">

            {/* --- MODAL POPUP --- */}
            {selectedRule && (
                <div
                    className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedRule(null)}
                >
                    <div
                        className="bg-white border-2 border-zinc-800 shadow-2xl max-w-sm w-full p-0 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-zinc-900 text-white p-3 flex justify-between items-center border-b-2 border-red-600">
                            <h3 className="font-bold uppercase text-lg text-yellow-400">{selectedRule.name}</h3>
                            <button onClick={() => setSelectedRule(null)} className="text-zinc-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 text-sm leading-relaxed text-zinc-800 bg-zinc-50 max-h-[60vh] overflow-y-auto whitespace-pre-line">
                            {selectedRule.description}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="text-white p-3 sm:p-4 pb-5 sm:pb-6 relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><path d="M0 0 L100 0 L100 80 Q 50 100 0 80 Z" fill="white" /></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex flex-row justify-between items-start mb-4 border-b border-white/20 pb-2">
                        <div className="flex-1 pr-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none font-sans drop-shadow-md">{unit.name}</h1>
                                {unit.isWarlord && <span className="text-xs font-bold px-2 py-0.5 bg-yellow-400 text-black rounded uppercase shadow-sm">Warlord</span>}
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold whitespace-nowrap leading-none pt-1 pl-2 shrink-0">
                            {unit.points} <span className="text-xs sm:text-sm font-normal opacity-80">pts</span>
                        </div>
                    </div>

                    {/* STATS ROW */}
                    <div className="flex flex-wrap items-end gap-2 sm:gap-4">
                        {sortedStats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                                <div className="text-[10px] sm:text-xs font-bold uppercase leading-none tracking-wide text-white/90 shadow-sm">{stat.name}</div>
                                <div className="flex items-center justify-center bg-white text-black rounded-sm w-10 h-10 sm:w-12 sm:h-12 shadow-md border border-zinc-400/50 relative overflow-hidden">
                                    {/* Decoration for specific stats */}
                                    {stat.name === "SV" && <div className="absolute inset-0 border-[3px] border-zinc-300 rounded-full opacity-20"></div>}
                                    {stat.name === "W" && <div className="absolute bottom-0 w-full h-1 bg-red-500 opacity-20"></div>}
                                    <div className="font-black text-xl sm:text-2xl tracking-tighter z-10">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col lg:flex-row min-h-[400px]">

                {/* LEFT: WEAPONS */}
                <div className="lg:w-[65%] flex flex-col border-b lg:border-b-0 lg:border-r-2 border-zinc-300">
                    <div className="flex-grow">
                        {/* RANGED */}
                        {rangedWeapons.length > 0 && (
                            <div className="mb-0">
                                <div className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10" style={{ backgroundColor: primaryColor }}>
                                    <span className="flex items-center gap-2"><RangedIcon /> Ranged Weapons</span>
                                    <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90">
                                        <span className="flex-1">Range</span><span className="flex-1">A</span><span className="flex-1">BS</span><span className="flex-1">S</span><span className="flex-1">AP</span><span className="flex-1">D</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-zinc-200 bg-white">
                                    {rangedWeapons.map((w, idx) => (
                                        <div key={idx}>
                                            {w.profiles.length === 1 ? (
                                                <WeaponProfileRow profile={w.profiles[0]} />
                                            ) : (
                                                // Grouped Weapons (Multi-profile)
                                                <div className="border-b border-zinc-200">
                                                    <div className="px-3 py-1.5 bg-zinc-100 font-bold text-sm text-zinc-800 uppercase flex justify-between items-center">
                                                        <span>{w.name} <span className="text-zinc-500 text-xs normal-case ml-2">x{w.count}</span></span>
                                                        <span className="text-[10px] text-zinc-500 font-normal">Select one profile:</span>
                                                    </div>
                                                    {w.profiles.map((p, pIdx) => (
                                                        <WeaponProfileRow key={pIdx} profile={p} isChild={true} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* MELEE */}
                        {meleeWeapons.length > 0 && (
                            <div className="mb-0 border-t-4 border-zinc-300">
                                <div className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10" style={{ backgroundColor: primaryColor }}>
                                    <span className="flex items-center gap-2"><MeleeIcon /> Melee Weapons</span>
                                    <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90">
                                        <span className="flex-1">Range</span><span className="flex-1">A</span><span className="flex-1">WS</span><span className="flex-1">S</span><span className="flex-1">AP</span><span className="flex-1">D</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-zinc-200 bg-white">
                                    {meleeWeapons.map((w, idx) => (
                                        <div key={idx}>
                                            {w.profiles.length === 1 ? (
                                                <WeaponProfileRow profile={w.profiles[0]} />
                                            ) : (
                                                <div className="border-b border-zinc-200">
                                                    <div className="px-3 py-1.5 bg-zinc-100 font-bold text-sm text-zinc-800 uppercase flex justify-between items-center">
                                                        <span>{w.name} <span className="text-zinc-500 text-xs normal-case ml-2">x{w.count}</span></span>
                                                        <span className="text-[10px] text-zinc-500 font-normal">Select one profile:</span>
                                                    </div>
                                                    {w.profiles.map((p, pIdx) => (
                                                        <WeaponProfileRow key={pIdx} profile={p} isChild={true} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: ABILITIES */}
                <div className="lg:w-[35%] flex flex-col bg-[#e8e9eb]">
                    <div className="px-3 py-1.5 text-white text-sm font-bold uppercase shadow-sm" style={{ backgroundColor: primaryColor }}>
                        Abilities
                    </div>

                    <div className="p-4 space-y-4 flex-grow text-sm">

                        {/* 1. CORE */}
                        {unit.abilities?.["Core"]?.length ? (
                            <div className="pb-3 border-b border-zinc-300">
                                <span className="font-bold text-zinc-500 uppercase text-[10px] mr-2">CORE:</span>
                                {unit.abilities["Core"].map((r, i) => (
                                    <RuleInteractive
                                        key={i}
                                        name={r.name}
                                        description={r.description}
                                        onClick={handleRuleClick}
                                        ruleMap={ruleMap}
                                    />
                                ))}
                            </div>
                        ) : null}

                        {/* 2. FACTION */}
                        {unit.abilities?.["Faction"]?.length ? (
                            <div className="pb-3 border-b border-zinc-300">
                                <span className="font-bold text-zinc-500 uppercase text-[10px] mr-2">FACTION:</span>
                                {unit.abilities["Faction"].map((r, i) => (
                                    <RuleInteractive
                                        key={i}
                                        name={r.name}
                                        description={r.description}
                                        onClick={handleRuleClick}
                                        ruleMap={ruleMap}
                                    />
                                ))}
                            </div>
                        ) : null}

                        {/* 3. DATASHEET ABILITIES */}
                        {unit.abilities?.["Abilities"]?.map((rule, rIdx) => (
                            <div key={rIdx} className="bg-white p-2 rounded shadow-sm border border-zinc-200">
                                <div className="font-bold text-zinc-900 text-sm">{rule.name}</div>
                                <div className="text-xs text-zinc-600 leading-snug whitespace-pre-line mt-1">
                                    {rule.description}
                                </div>
                            </div>
                        ))}

                        {/* 4. LEADER / ATTACHED */}
                        {unit.abilities?.["Leader"]?.length ? (
                            <div className="pt-2 border-t border-zinc-300">
                                <div className="font-bold text-[10px] uppercase text-zinc-500 mb-1">Leader / Attached</div>
                                {unit.abilities["Leader"].map((rule, rIdx) => (
                                    <div key={rIdx} className="text-xs bg-zinc-200 p-2 rounded">
                                        <div className="font-bold mb-1">{rule.name}</div>
                                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-700">
                                            {rule.description.split('\n').map((line, i) => (
                                                line.trim().length > 1 && <li key={i}>{line.replace(/^[■-]\s*/, '')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {/* 5. INVULNERABLE SAVE */}
                        {unit.abilities?.["Invuln"]?.map((rule, i) => (
                            <div key={i} className="flex justify-between items-center bg-zinc-800 text-white px-3 py-2 rounded shadow-sm">
                                <span className="text-xs font-bold uppercase">Invulnerable Save</span>
                                <span className="text-lg font-black text-yellow-400">{rule.description.match(/\d+\+/)?.[0] || "Yes"}</span>
                            </div>
                        ))}
                    </div>

                    {/* KEYWORDS FOOTER */}
                    <div className="mt-auto">
                        <div className="bg-[#d4d4d4] p-2 px-3 border-t border-zinc-300">
                            <div className="flex flex-wrap gap-1">
                                <span className="font-bold text-[10px] uppercase text-zinc-500 py-0.5">Faction:</span>
                                {unit.factionKeywords?.map((kw, i) => (
                                    <span key={i} className="text-[10px] font-bold uppercase bg-zinc-600 text-white px-1.5 py-0.5 rounded-sm">{kw}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#bfbfbf] p-2 px-3 border-t border-zinc-400 min-h-[32px]">
                            <div className="flex flex-wrap gap-1 text-[10px] uppercase font-bold text-zinc-700 leading-tight">
                                <span className="text-zinc-500 mr-1">Keywords:</span>
                                {unit.keywords?.join(", ")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}