// app/components/Datasheet.tsx
import { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import { getFactionColor } from "../lib/constants/factionColors"

function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Datasheet({ unit, faction }: { unit: ArmyListUnit; faction?: string }) {
    const primaryColor = getFactionColor(faction)

    // ✅ Safety Check: ป้องกัน Error ถ้าข้อมูลเป็น undefined
    const models = unit.models || []
    const stats = unit.stats || []

    // รวมอาวุธจากทุกโมเดล (ตัดตัวซ้ำออก)
    const weapons = models.flatMap(m => m.weapons || []).reduce((acc, w) => {
        if (!acc.find(xw => xw.name === w.name)) {
            acc.push(w)
        }
        return acc
    }, [] as typeof unit.models[0]['weapons'])

    return (
        <div className="w-full bg-white text-zinc-900 shadow-2xl overflow-hidden font-sans border-b-4 mb-6 transition-all duration-300"
             style={{ borderColor: primaryColor }}>
            
            {/* ===== HEADER SECTION ===== */}
            <div className="relative text-white pt-6 pb-4 px-3 sm:px-6"
                style={{
                    background: `linear-gradient(90deg, rgb(20, 21, 25) 0%, rgb(48, 57, 62) 45%, rgb(73, 74, 79) 100%)`
                }}>
                
                {/* Decorative Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-20 flex pointer-events-none opacity-50">
                     <div className="w-1/3 h-full" style={{ backgroundColor: primaryColor }}></div>
                     <div className="flex flex-col h-full">
                        <div className="h-10" style={{ backgroundColor: primaryColor }}></div>
                        <svg height="40" width="100" viewBox="0 0 100 40" style={{ fill: primaryColor }}>
                            <path d="m0 0h100c-32 0-68 40-100 40z"></path>
                        </svg>
                     </div>
                     <div className="flex-1 h-10" style={{ backgroundColor: primaryColor }}></div>
                </div>

                <div className="relative z-10">
                    {/* Title & Points: มือถือเรียงตั้ง / จอใหญ่เรียงนอน */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 md:mb-2 border-b border-white/20 pb-2 gap-2">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none font-sans break-words">
                            {unit.name}
                        </h1>
                        <div className="text-lg sm:text-xl font-bold whitespace-nowrap opacity-90">
                            {unit.points} pts
                        </div>
                    </div>

                    {/* Models & Stats */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center mt-4 mb-2">
                        {/* Unit Composition */}
                        <div className="flex-1 text-xs sm:text-sm font-medium opacity-80 flex flex-wrap gap-x-4 gap-y-1">
                           {models.map((m, i) => (
                               <span key={i}>
                                   {m.count}x {m.name}
                               </span>
                           ))}
                        </div>

                        {/* STATS POLYGONS: มือถือจัดกลาง / จอใหญ่ชิดขวา */}
                        <div className="flex gap-1 sm:gap-2 justify-center lg:justify-end flex-wrap">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center w-10 sm:w-12">
                                    <div className="text-[9px] sm:text-[10px] font-bold uppercase mb-0.5">{stat.name}</div>
                                    <div 
                                        className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center font-black text-lg sm:text-xl bg-zinc-200 text-black relative shadow-sm"
                                        style={{
                                            border: `2px solid ${primaryColor}`,
                                            // รูปทรงหกเหลี่ยมตัดมุมตาม Template
                                            clipPath: "polygon(12% 0px, 100% 0px, 100% 20%, 100% 88%, 88% 100%, 20% 100%, 0px 100%, 0px 12%)"
                                        }}
                                    >
                                       {stat.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== BODY SECTION ===== */}
            {/* มือถือเรียงตั้ง (flex-col) / จอใหญ่แบ่งซ้ายขวา (xl:flex-row) */}
            <div className="flex flex-col xl:flex-row bg-[#dfe0e2] min-h-[400px]">
                
                {/* LEFT COLUMN: WEAPONS & WARGEAR */}
                <div className="xl:w-3/4 p-2 sm:p-4 xl:border-r-2 border-white/50" style={{ borderColor: primaryColor }}>
                    
                    {/* Weapons Table */}
                    {weapons.length > 0 && (
                        <div className="mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-400">
                            <table className="w-full text-sm border-collapse min-w-[600px] sm:min-w-full">
                                <thead>
                                    <tr className="text-white text-left uppercase text-[10px] sm:text-xs" style={{ backgroundColor: primaryColor }}>
                                        <th className="p-1 pl-2 w-8 rounded-tl-sm"></th>
                                        <th className="p-1.5 w-1/3">Weapon</th>
                                        <th className="p-1.5 text-center">Range</th>
                                        <th className="p-1.5 text-center">A</th>
                                        <th className="p-1.5 text-center">BS/WS</th>
                                        <th className="p-1.5 text-center">S</th>
                                        <th className="p-1.5 text-center">AP</th>
                                        <th className="p-1.5 text-center">D</th>
                                        <th className="p-1.5 rounded-tr-sm">Keywords</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#dfe0e2] text-zinc-900 text-xs sm:text-sm">
                                    {weapons.map((w, idx) => (
                                        <tr key={idx} className="border-t border-zinc-400/50 hover:bg-zinc-300/50 transition-colors">
                                            <td className="p-1 text-center">
                                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm mx-auto ${w.range === 'Melee' ? 'bg-red-800' : 'bg-blue-800'}`} title={w.range === 'Melee' ? 'Melee' : 'Ranged'}></div>
                                            </td>
                                            <td className="p-1.5 font-bold">{w.name}</td>
                                            <td className="p-1.5 text-center whitespace-nowrap">{w.range}</td>
                                            <td className="p-1.5 text-center">{w.attacks}</td>
                                            <td className="p-1.5 text-center">{w.skill}</td>
                                            <td className="p-1.5 text-center">{w.strength}</td>
                                            <td className="p-1.5 text-center">{w.ap}</td>
                                            <td className="p-1.5 text-center">{w.damage}</td>
                                            <td className="p-1.5 text-[10px] sm:text-xs italic text-zinc-700">{w.abilities}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Wargear Options */}
                    <div className="space-y-2">
                         {models.some(m => m.extras?.length) && (
                            <div className="text-sm pl-2 mb-4">
                                <div className="text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase inline-block mb-1 rounded-sm" style={{ backgroundColor: primaryColor }}>
                                    Wargear / Enhancements
                                </div>
                                <ul className="list-disc pl-5 text-zinc-800 text-xs sm:text-sm space-y-0.5">
                                    {models.flatMap(m => m.extras || []).map((e, i) => (
                                        <li key={i}>{e.name} {e.points ? `(+${e.points} pts)` : ''}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                    </div>
                </div>

                {/* RIGHT COLUMN: ABILITIES & KEYWORDS */}
                <div className="xl:w-1/4 p-3 sm:p-4 flex flex-col relative bg-[#e8e9eb]">
                    <div className="text-white px-2 py-1 font-bold uppercase mb-3 text-xs sm:text-sm text-center rounded-sm shadow-sm" style={{ backgroundColor: primaryColor }}>
                        Abilities
                    </div>

                    {/* Abilities List */}
                    <div className="space-y-4 text-xs sm:text-sm flex-grow">
                        {unit.abilities && Object.entries(unit.abilities).map(([category, rules]) => (
                            <div key={category} className="bg-white/50 p-2 rounded border border-zinc-300">
                                <span className="text-[10px] sm:text-xs font-bold uppercase text-zinc-500 block mb-1 border-b border-zinc-300 pb-1">{category}</span>
                                {rules.map((rule, rIdx) => (
                                    <div key={rIdx} className="mb-2 last:mb-0">
                                        <span className="font-bold block text-zinc-900 text-sm">{rule.name}</span>
                                        <span className="text-zinc-700 text-xs leading-relaxed block whitespace-pre-line">
                                            {rule.description}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    
                    {/* Faction Keywords */}
                    <div className="mt-6 pt-2 border-t-2 border-zinc-400/50">
                        <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">Faction Keywords</div>
                        <div className="font-bold text-xs sm:text-sm uppercase tracking-wide text-zinc-900 leading-tight">
                            {unit.factionKeywords?.join(", ") || faction}
                        </div>
                    </div>

                    {/* General Keywords */}
                    <div className="mt-3 bg-zinc-300/80 p-2 border border-zinc-400 text-[10px] sm:text-xs font-bold uppercase flex flex-wrap gap-1 text-zinc-800 rounded-sm">
                        <span className="opacity-60 mr-1">Keywords:</span>
                        {unit.keywords?.map((k, i) => (
                             <span key={i} className="whitespace-nowrap">{k}{i < (unit.keywords?.length || 0) - 1 ? ", " : ""}</span>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Bottom Color Bar */}
            <div className="h-3 w-full" style={{ backgroundColor: primaryColor }}></div>
        </div>
    )
}