import { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import { getFactionColor } from "../lib/constants/factionColors"

// ==========================================
// 1. ICONS & ASSETS
// ==========================================

const RangedIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5 inline-block mr-1.5 opacity-90">
        <path d="M48 256c0 114.9 93.1 208 208 208s208-93.1 208-208S370.9 48 256 48 48 141.1 48 256zm289.1-33.4c6.5 12.4 2.3 27.8-9.7 34.9l-59.5 35.3c-7.7 4.6-17.3 4.4-24.8-.5L113 207c-9.9-6.4-12.7-19.6-6.3-29.5s19.6-12.7 29.5-6.3l109.2 70.6 47.9-28.4c12-7.1 27.4-2.9 34.5 9.1l-61.7 36.6 61.7-36.6zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0z" />
    </svg>
)

const MeleeIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5 inline-block mr-1.5 opacity-90">
        <path d="M498.1 5.6c10.1 7.7 15.6 19.8 14.5 32.2-7.4 83.1-28.1 161.9-60.5 233.1-3.4 7.6-10.7 12.8-19 13.5-30.7 2.6-63.5 10.9-96.1 26.6l-2.4 1.2c-5.2-9-10.8-17.7-16.7-26.2-11.2-16.2-24.2-31.1-38.5-44.5-12.9-12-27-22.9-42.1-32.2-7.8-4.8-15.1-9.9-22-15.3l-1.1-.9C230.1 160.6 238.4 127.8 241 97.1c.7-8.3 5.9-15.6 13.5-19 71.2-32.4 150-53.1 233.1-60.5 12.4-1.1 24.5 4.4 32.2 14.5zM153.2 284.5c26.9 16.7 51.6 37 73.1 60.4 19.1 20.8 36.2 43.6 50.8 67.9l7.7 12.9c3.2 5.4 3.7 12 .9 17.6-2.7 5.7-8 9.7-14.2 10.8-42.3 7.3-81.5 24.6-115.9 49.3l-2.2 1.6c-9.2 6.6-21.9 5.2-29.5-3.3-17.3-19.3-32.3-40.3-44.6-62.5-12.7-22.8-22.9-46.9-30.2-71.9-.9-3-1.6-6-2.1-9-1.9-11.2 3.9-22.4 14.3-27.6l1.3-.6c24.7-12.4 51.2-21.7 79.1-27.1 3.9-.7 7.9-.6 11.5 1.5z" />
    </svg>
)

const RuleTooltip = ({ name, description }: { name: string, description: string }) => (
    <span className="group relative cursor-help border-b border-dotted border-zinc-500 inline-block mr-2 mb-1">
        <span className="font-bold text-zinc-900">{name}</span>
        <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-900 text-white text-xs p-2 rounded shadow-xl z-50 pointer-events-none text-left">
            <span className="font-bold block mb-1 border-b border-zinc-700 pb-1 text-yellow-400">{name}</span>
            {description}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></span>
        </span>
    </span>
)

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function Datasheet({ unit, faction }: { unit: ArmyListUnit; faction?: string }) {
    if (!unit) return null;

    const primaryColor = getFactionColor(faction)

    // Data Processing
    const models = unit.models || []
    const stats = unit.stats || []
    const statOrder = ["M", "T", "SV", "W", "LD", "OC"]
    const sortedStats = [...stats].sort((a, b) => statOrder.indexOf(a.name) - statOrder.indexOf(b.name))

    const allWeapons = models.flatMap(m => m.weapons || []).reduce((acc, w) => {
        const existing = acc.find(xw => xw.name === w.name)
        if (existing) {
            existing.count += w.count
        } else {
            acc.push({ ...w })
        }
        return acc
    }, [] as typeof unit.models[0]['weapons'])

    const rangedWeapons = allWeapons.filter(w => w.range !== 'Melee')
    const meleeWeapons = allWeapons.filter(w => w.range === 'Melee')

    const uniqueAbilities = unit.abilities?.["Abilities"] || [];
    const leaderAbilities = unit.abilities?.["Leader"] || [];
    const coreAbilities = unit.abilities?.["Core"] || [];
    const factionAbilities = unit.abilities?.["Faction"] || [];

    const highlightedRules = [
        ...(unit.abilities?.["Invuln"] || []),
        ...(unit.abilities?.["Damaged"] || [])
    ];

    const otherAbilitiesCategories = unit.abilities
        ? Object.entries(unit.abilities).filter(([key]) => !["Abilities", "Leader", "Core", "Faction", "Invuln", "Damaged"].includes(key))
        : [];

    return (
        <div className="w-full bg-white text-zinc-900 shadow-xl overflow-hidden font-sans mb-8 border-2 border-zinc-800 rounded-none">

            {/* HEADER SECTION */}
            <div className="text-white p-3 sm:p-4 pb-5 sm:pb-6 relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full"><path d="M0 0 L100 0 L100 80 Q 50 100 0 80 Z" fill="white" /></svg>
                </div>

                <div className="relative z-10">
                    {/* ✅ Header Row: ใช้ flex-row + justify-between เสมอ เพื่อให้ pts ชิดขวา */}
                    <div className="flex flex-row justify-between items-start mb-4 border-b border-white/20 pb-2">
                        <div className="flex-1 pr-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none font-sans drop-shadow-md">
                                    {unit.name}
                                </h1>
                                {unit.isWarlord && (
                                    <span className="font-bold text-zinc-200 mb-1">
                                        - Warlord
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Points Box: ชิดขวาสุดเสมอ */}
                        <div className="text-xl sm:text-2xl font-bold whitespace-nowrap leading-none pt-1 pl-2 shrink-0">
                            {unit.points} <span className="text-xs sm:text-sm font-normal opacity-80">pts</span>
                        </div>
                    </div>

                    {/* ✅ STATS SECTION: ลดขนาดกล่องลง */}
                    <div className="flex flex-wrap items-end gap-1.5 sm:gap-3">
                        {sortedStats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-0.5">
                                {/* ชื่อ Stat (M, T...) */}
                                <div className="text-[10px] sm:text-xs font-bold uppercase leading-none tracking-wide text-white/90 shadow-sm">
                                    {stat.name}
                                </div>
                                {/* กล่องค่าพลัง: ลดจาก w-11 h-11 เป็น w-10 h-10 และ text-xl */}
                                <div className="flex items-center justify-center bg-white text-black rounded-sm w-10 h-10 sm:w-12 sm:h-12 shadow-md border border-zinc-400/50">
                                    <div className="font-black text-xl sm:text-2xl tracking-tighter">
                                        {stat.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BODY LAYOUT */}
            <div className="flex flex-col lg:flex-row min-h-[400px]">

                {/* LEFT: WEAPONS */}
                <div className="lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r-2 border-zinc-300">
                    <div className="flex-grow">
                        {rangedWeapons.length > 0 && (
                            <div className="mb-0">
                                <div className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10" style={{ backgroundColor: primaryColor }}>
                                    <span className="flex items-center gap-2"><RangedIcon /> Ranged Weapons</span>
                                    <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[200px] sm:w-[240px] opacity-90">
                                        <span className="flex-1">Range</span><span className="flex-1">A</span><span className="flex-1">BS</span><span className="flex-1">S</span><span className="flex-1">AP</span><span className="flex-1">D</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-zinc-200 bg-white">
                                    {rangedWeapons.map((w, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center px-3 py-2 bg-zinc-50 odd:bg-white hover:bg-zinc-100 transition-colors">
                                            <div className="flex-1 mb-2 sm:mb-0 pr-2">
                                                <div className="font-bold text-sm uppercase leading-tight text-zinc-900 flex items-center gap-1.5">
                                                    {w.name}
                                                    <span className="text-zinc-500 text-xs font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded-sm">x{w.count}</span>
                                                </div>
                                                {w.abilities && w.abilities !== "-" && (
                                                    <div className="text-[10px] font-bold uppercase leading-tight mt-1" style={{ color: '#15803d' }}>[{w.abilities}]</div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-6 sm:flex sm:gap-0 text-center text-sm w-full sm:w-[240px] font-bold text-zinc-700 shrink-0 tabular-nums">
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">RNG</span>{w.range}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">A</span>{w.attacks}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">BS</span>{w.skill}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">S</span>{w.strength}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">AP</span>{w.ap}</span>
                                                <span className="flex-1 flex flex-col sm:block"><span className="sm:hidden text-[10px] font-bold text-zinc-400">D</span>{w.damage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {meleeWeapons.length > 0 && (
                            <div className="mb-0 border-t border-zinc-300">
                                <div className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10" style={{ backgroundColor: primaryColor }}>
                                    <span className="flex items-center gap-2"><MeleeIcon /> Melee Weapons</span>
                                    <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[200px] sm:w-[240px] opacity-90">
                                        <span className="flex-1">Range</span><span className="flex-1">A</span><span className="flex-1">WS</span><span className="flex-1">S</span><span className="flex-1">AP</span><span className="flex-1">D</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-zinc-200 bg-white">
                                    {meleeWeapons.map((w, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center px-3 py-2 bg-zinc-50 odd:bg-white hover:bg-zinc-100 transition-colors">
                                            <div className="flex-1 mb-2 sm:mb-0 pr-2">
                                                <div className="font-bold text-sm uppercase leading-tight text-zinc-900 flex items-center gap-1.5">
                                                    {w.name}
                                                    <span className="text-zinc-500 text-xs font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded-sm">x{w.count}</span>
                                                </div>
                                                {w.abilities && w.abilities !== "-" && (
                                                    <div className="text-[10px] font-bold uppercase leading-tight mt-1" style={{ color: '#15803d' }}>[{w.abilities}]</div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-6 sm:flex sm:gap-0 text-center text-sm w-full sm:w-[240px] font-bold text-zinc-700 shrink-0 tabular-nums">
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">RNG</span>{w.range}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">A</span>{w.attacks}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">WS</span>{w.skill}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">S</span>{w.strength}</span>
                                                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200"><span className="sm:hidden text-[10px] font-bold text-zinc-400">AP</span>{w.ap}</span>
                                                <span className="flex-1 flex flex-col sm:block"><span className="sm:hidden text-[10px] font-bold text-zinc-400">D</span>{w.damage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {models.some(m => m.extras?.length > 0) && (
                            <div className="p-3 border-t border-zinc-300 bg-zinc-50 text-xs">
                                <div className="font-bold uppercase text-zinc-500 mb-1">Wargear Options</div>
                                <ul className="list-disc pl-4 space-y-0.5 text-zinc-800">
                                    {models.flatMap(m => m.extras || []).map((e, i) => (
                                        <li key={i}><span className="font-semibold">{e.name}</span>{e.points ? ` (+${e.points} pts)` : ''}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: ABILITIES */}
                <div className="lg:w-[40%] flex flex-col bg-[#e8e9eb]">
                    <div className="px-3 py-1.5 text-white text-sm font-bold uppercase shadow-sm" style={{ backgroundColor: primaryColor }}>
                        Abilities
                    </div>

                    <div className="p-4 space-y-4 flex-grow">

                        {/* 1. FACTION */}
                        {factionAbilities.length > 0 && (
                            <div className="text-sm border-b border-zinc-300 pb-2">
                                <span className="font-bold text-zinc-600 uppercase text-[10px] mr-2">FACTION:</span>
                                {factionAbilities.map((r, i) => (
                                    <span key={i} className="font-bold text-zinc-900 mr-2">{r.name}</span>
                                ))}
                            </div>
                        )}

                        {/* 2. CORE */}
                        {coreAbilities.length > 0 && (
                            <div className="text-sm border-b border-zinc-300 pb-2">
                                <span className="font-bold text-zinc-600 uppercase text-[10px] mr-2 block sm:inline mb-1 sm:mb-0">CORE:</span>
                                <div className="inline-block">
                                    {coreAbilities.map((r, i) => (
                                        <RuleTooltip key={i} name={r.name} description={r.description} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Highlighted Rules */}
                        {highlightedRules.map((rule, i) => (
                            <div key={i} className="mt-2">
                                <div
                                    className="px-3 py-1.5 text-white text-sm font-bold uppercase shadow-sm mb-1 rounded-sm"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {rule.name}
                                </div>
                                {rule.description && rule.description !== "-" && (
                                    <div className="text-xs text-zinc-700 px-1 leading-snug whitespace-pre-line mb-2">
                                        {rule.description}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* 4. UNIQUE ABILITIES */}
                        {uniqueAbilities.map((rule, rIdx) => (
                            <div key={rIdx} className="text-sm">
                                <div className="font-bold text-zinc-900">{rule.name}</div>
                                <div className="text-xs text-zinc-700 leading-snug whitespace-pre-line mt-0.5">
                                    {rule.description}
                                </div>
                            </div>
                        ))}

                        {/* 5. LEADER */}
                        {leaderAbilities.length > 0 && (
                            <div className="space-y-2 mt-4 pt-2 border-t border-zinc-300/50">
                                <div className="font-bold text-[10px] uppercase text-zinc-500 mb-1">Leader</div>
                                {leaderAbilities.map((rule, rIdx) => (
                                    <div key={rIdx} className="text-sm">
                                        <div className="font-bold text-zinc-900">{rule.name}</div>
                                        <div className="text-xs text-zinc-700 mt-1 pl-2 border-l-2 border-zinc-300">
                                            <ul className="list-disc pl-4 space-y-0.5">
                                                {rule.description.split('\n').map((line, i) => (
                                                    line.trim() && <li key={i}>{line.replace(/^[■-]\s*/, '')}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 6. OTHERS */}
                        {otherAbilitiesCategories.map(([category, rules]) => (
                            <div key={category} className="space-y-2 mt-4 pt-2 border-t border-zinc-300/50">
                                <div className="font-bold text-[10px] uppercase text-zinc-500 mb-1">{category}</div>
                                {rules.map((rule, rIdx) => (
                                    <div key={rIdx} className="text-sm">
                                        <div className="font-bold text-zinc-900">{rule.name}</div>
                                        <div className="text-xs text-zinc-700 leading-snug whitespace-pre-line mt-0.5">
                                            {rule.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* FACTION KEYWORDS FOOTER */}
                    <div className="mt-auto border-t-2 border-zinc-300">
                        <div className="bg-[#dcdcdc] p-2 px-3 text-xs">
                            <div className="font-bold text-[10px] uppercase text-zinc-500 mb-0.5">Faction Keywords:</div>
                            <div className="font-bold text-sm text-zinc-900 uppercase leading-tight">
                                {unit.factionKeywords?.join(", ") || faction}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KEYWORDS */}
            <div className="bg-[#cfcfcf] p-2 px-4 text-xs border-t border-white/50 flex flex-wrap gap-2 items-center min-h-[40px]">
                <span className="font-bold text-[10px] uppercase text-zinc-500">Keywords:</span>
                <span className="font-bold text-xs text-zinc-800 uppercase leading-tight">
                    {unit.keywords?.join(", ")}
                </span>
            </div>
        </div>
    )
}