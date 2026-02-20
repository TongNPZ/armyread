// app/components/Datasheet.tsx
import { useState, useMemo, useEffect } from "react";
import { ArmyListUnit } from "../lib/parser/armyList/armyListTypes";
import { getFactionColor } from "../lib/constants/factionColors";

// ✅ Import ฟังก์ชันค้นหาทั้ง 2 แบบ
import { findGlobalLeaders, findGlobalBodyguards } from "../lib/wahapedia/lookup";

import { RangedIcon, MeleeIcon, InvulnIcon, DamagedIcon } from "./datasheet/DatasheetIcons";
import RuleInteractive from "./datasheet/RuleInteractive";
import WeaponProfileRow, { ProcessedWeapon } from "./datasheet/WeaponProfileRow";

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Datasheet({
  unit,
  faction,
  rosterUnits, 
}: {
  unit: ArmyListUnit;
  faction?: string;
  rosterUnits?: ArmyListUnit[];
}) {
  const [selectedRule, setSelectedRule] = useState<{
    name: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedRule(null);
    };
    if (selectedRule) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRule]);

  const ruleMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    if (unit && unit.abilities) {
      Object.values(unit.abilities).flat().forEach((r) => {
        if (r.description && r.description !== "-") map[r.name] = r.description;
      });
      unit.abilities["WeaponRules"]?.forEach((r) => {
        map[r.name] = r.description;
      });
    }
    return map;
  }, [unit]);

  // 🚀 หา Leader ที่สามารถนำเราได้
  const actualLeaders = useMemo(() => {
    let leaders = findGlobalLeaders(unit.name, faction, unit.factionKeywords || [], rosterUnits || []);

    if (unit.abilities?.["LedBy"]) {
      unit.abilities["LedBy"].forEach(rule => {
        const desc = rule.description.trim();
        const match = desc.match(/can be attached to (?:an? )?(.+?), it can be attached/i);
        if (match) {
          const proxyTarget = match[1].replace(/ unit$/i, '').trim();
          const proxyLeaders = findGlobalLeaders(proxyTarget, faction, unit.factionKeywords || [], rosterUnits || []); 
          leaders = [...leaders, ...proxyLeaders];
        }
      });
    }
    return Array.from(new Set(leaders)).sort();
  }, [unit.name, unit.abilities, faction, unit.factionKeywords, rosterUnits]); 

  // 🚀 หา Bodyguards ที่เราสามารถไปนำได้ (Forward Lookup)
  const actualBodyguards = useMemo(() => {
    if (!unit.abilities?.["Leader"]) return [];
    let bodyguards = findGlobalBodyguards(unit.name, faction, unit.factionKeywords || [], rosterUnits || []);
    return Array.from(new Set(bodyguards)).sort();
  }, [unit.name, unit.abilities, faction, unit.factionKeywords, rosterUnits]);

  if (!unit) return null;

  const primaryColor = getFactionColor(faction);

  const models = unit.models || [];
  const stats = unit.stats || [];
  const sortedStats = [...stats].sort(
    (a, b) =>
      ["M", "T", "SV", "W", "LD", "OC"].indexOf(a.name) -
      ["M", "T", "SV", "W", "LD", "OC"].indexOf(b.name),
  );

  const processWeapons = (
    rangeFilter: (r: string) => boolean,
  ): ProcessedWeapon[] => {
    const result: ProcessedWeapon[] = [];

    models.forEach((m) => {
      m.weapons?.forEach((w) => {
        w.profiles.forEach((p) => {
          if (rangeFilter(p.range)) {
            let displayName = w.name;
            const isMultiProfile = w.profiles.length > 1;
            const isDistinctProfileName =
              p.name &&
              p.name.toLowerCase() !== w.name.toLowerCase() &&
              !p.name.toLowerCase().includes(w.name.toLowerCase());

            if (isMultiProfile || isDistinctProfileName) {
              displayName = p.name.includes("-") ? p.name : `${w.name} - ${p.name}`;
            } else if (p.name) {
              displayName = p.name;
            }

            const existing = result.find(
              (r) => r.displayName === displayName && r.range === p.range && r.attacks === p.attacks &&
                r.skill === p.skill && r.strength === p.strength && r.ap === p.ap && r.damage === p.damage,
            );

            if (existing) {
              existing.count += w.count;
            } else {
              result.push({ ...p, displayName: displayName, count: w.count });
            }
          }
        });
      });
    });
    return result;
  };

  const rangedWeapons = processWeapons((r) => r !== "Melee");
  const meleeWeapons = processWeapons((r) => r === "Melee");

  const handleRuleClick = (name: string, description: string) => {
    setSelectedRule({ name, description });
  };

  const standardCategories = ["Core", "Faction", "Abilities", "Leader", "LedBy", "Invuln", "Damaged", "Wargear", "WeaponRules"];
  const leftSideCategories = Object.keys(unit.abilities || {}).filter(cat => !standardCategories.includes(cat));

  const allAbilities = unit.abilities?.["Abilities"] || [];
  const damagedRules = unit.abilities?.["Damaged"] || allAbilities.filter((a) => a.name.includes("Damaged:"));
  const standardAbilities = allAbilities.filter((a) => !a.name.includes("Wargear") && !a.name.includes("Damaged:"));

  const baseInvulns = unit.abilities?.["Invuln"] || [];
  let displayInvulns = [];

  if (baseInvulns.length > 0) {
    displayInvulns = baseInvulns;
  } else {
    const potentialSources = [...(unit.abilities?.["Wargear"] || []), ...(unit.abilities?.["Abilities"] || [])];
    const extraInvulns = potentialSources.filter((rule) => {
      const desc = rule.description.toLowerCase();
      return desc.includes("invulnerable") && /\d+\+/.test(desc);
    });
    displayInvulns = extraInvulns.filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
  }

  const hasLeaderAbilities = (unit.abilities?.["Leader"]?.length ?? 0) > 0;
  const hasLedByAbilities = (unit.abilities?.["LedBy"]?.length ?? 0) > 0;
  const hasActualLeaders = actualLeaders.length > 0;

  return (
    <div className="w-full bg-white text-zinc-900 shadow-xl font-sans mb-4 border-2 border-zinc-800 relative">
      {/* MODAL */}
      {selectedRule && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedRule(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-sm sm:max-w-xl w-full p-0 overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-900 text-white p-4 flex justify-between items-center border-b border-zinc-800 shrink-0">
              <h3 className="font-black text-[16px] uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-orange-500"></span>
                {selectedRule.name}
              </h3>
              <button
                onClick={() => setSelectedRule(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition shrink-0"
              >
                ✕
              </button>
            </div>
            <div
              className="wahapedia-content dark-theme p-5 text-[14px] sm:text-[15px] leading-relaxed text-zinc-300 bg-zinc-900 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900"
              dangerouslySetInnerHTML={{ __html: selectedRule.description }}
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div
        className="text-white p-3 sm:p-4 pb-5 sm:pb-6 relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 0 L100 0 L100 80 Q 50 100 0 80 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex flex-row justify-between items-start mb-4 border-b border-white/20 pb-2">
            <div className="flex-1 pr-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none font-sans drop-shadow-md">
                  {unit.name}
                </h1>
                {unit.isWarlord && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-white text-black rounded-sm shadow-sm">
                    Warlord
                  </span>
                )}
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold whitespace-nowrap leading-none pt-1 pl-2 shrink-0">
              {unit.points} <span className="text-xs sm:text-sm font-normal opacity-80">pts</span>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2 sm:gap-4">
            {sortedStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <div className="text-[10px] sm:text-xs font-bold leading-none tracking-wide text-white/90 shadow-sm">
                  {stat.name}
                </div>
                <div className="flex items-center justify-center bg-white text-black w-10 h-10 sm:w-12 sm:h-12 shadow-md border border-zinc-400/50 relative overflow-hidden">
                  {stat.name === "SV" && <div className="absolute inset-0 border-[3px] border-zinc-300 opacity-20"></div>}
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
        {/* LEFT: WEAPONS & SPECIAL ABILITIES */}
        <div className="lg:w-[65%] flex flex-col border-b lg:border-b-0 lg:border-r-2 border-zinc-300">
          <div className="flex-grow">
            {/* RANGED */}
            {rangedWeapons.length > 0 && (
              <div className="mb-0">
                <div
                  className="flex items-center justify-between px-3 py-1.5 text-white text-[13px] font-bold border-b border-white/10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="flex items-center gap-2 uppercase tracking-wide">
                    <RangedIcon /> Ranged Weapons
                  </span>
                  <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90 uppercase">
                    <span className="flex-1">Range</span>
                    <span className="flex-1">A</span>
                    <span className="flex-1">BS</span>
                    <span className="flex-1">S</span>
                    <span className="flex-1">AP</span>
                    <span className="flex-1">D</span>
                  </div>
                </div>
                <div className="divide-y divide-zinc-200 bg-white">
                  {rangedWeapons.map((w, idx) => (
                    <WeaponProfileRow key={idx} profile={w} striped={idx % 2 !== 0} primaryColor={primaryColor} ruleMap={ruleMap} onRuleClick={handleRuleClick} />
                  ))}
                </div>
              </div>
            )}

            {/* MELEE */}
            {meleeWeapons.length > 0 && (
              <div className="mb-0 border-t-4 border-zinc-300">
                <div
                  className="flex items-center justify-between px-3 py-1.5 text-white text-[13px] font-bold uppercase border-b border-white/10 tracking-wide"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="flex items-center gap-2">
                    <MeleeIcon /> Melee Weapons
                  </span>
                  <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90 uppercase">
                    <span className="flex-1">Range</span>
                    <span className="flex-1">A</span>
                    <span className="flex-1">WS</span>
                    <span className="flex-1">S</span>
                    <span className="flex-1">AP</span>
                    <span className="flex-1">D</span>
                  </div>
                </div>
                <div className="divide-y divide-zinc-200 bg-white">
                  {meleeWeapons.map((w, idx) => (
                    <WeaponProfileRow key={idx} profile={w} striped={idx % 2 !== 0} primaryColor={primaryColor} ruleMap={ruleMap} onRuleClick={handleRuleClick} />
                  ))}
                </div>
              </div>
            )}

            {/* UNIT SPECIAL ABILITIES */}
            {leftSideCategories.length > 0 && (
              <div className="mt-3 px-2 pb-2">
                {leftSideCategories.map((cat, cIdx) => (
                  <div key={cIdx} className="mb-3 border border-zinc-300 bg-white shadow-sm">
                    <div className="text-white px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: primaryColor }}>
                      {cat}
                    </div>
                    <div className="p-3 text-[13px] sm:text-[14px] text-zinc-800 leading-relaxed">
                      {unit.abilities![cat].map((rule, rIdx) => (
                        <div key={rIdx} className="mb-2 last:mb-0 pl-3 relative">
                          <span className="absolute left-0 top-0 font-bold text-zinc-400">•</span>
                          <strong className="text-black font-bold uppercase block mb-1">{rule.name}:</strong>
                          <div className="wahapedia-content" dangerouslySetInnerHTML={{ __html: rule.description }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KEYWORDS FOOTER */}
          <div className="mt-auto">
            <div className="bg-[#e4e4e4] p-2.5 px-3 border-t border-zinc-400">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-[11px] text-zinc-600 uppercase tracking-wide">Faction:</span>
                {unit.factionKeywords?.map((kw, i) => (
                  <span key={i} className="text-[10px] font-bold bg-zinc-700 text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ABILITIES */}
        <div className="lg:w-[35%] flex flex-col bg-[#f4f4f5]">

          <div className="px-3 py-1.5 text-white text-[13px] tracking-wide font-bold uppercase shadow-sm" style={{ backgroundColor: primaryColor }}>
            Abilities
          </div>
          <div className="p-2.5 space-y-2.5 text-[13px] sm:text-[14px]">
            {unit.abilities?.["Core"]?.length ? (
              <div className="pb-3 border-b border-zinc-300">
                <span className="font-black text-zinc-500 uppercase text-[11px] mr-2">CORE:</span>
                {unit.abilities["Core"].map((r, i) => (
                  <span key={i}>
                    <RuleInteractive name={r.name} description={r.description} onClick={handleRuleClick} ruleMap={ruleMap} />
                    {i < unit.abilities!["Core"].length - 1 && <span className="mr-1.5 text-zinc-500">,</span>}
                  </span>
                ))}
              </div>
            ) : null}

            {unit.abilities?.["Faction"]?.length ? (
              <div className="pb-3 border-b border-zinc-300">
                <span className="font-black text-zinc-500 uppercase text-[11px] mr-2">FACTION:</span>
                {unit.abilities["Faction"].map((r, i) => (
                  <span key={i}>
                    <RuleInteractive name={r.name} description={r.description} onClick={handleRuleClick} ruleMap={ruleMap} />
                    {i < unit.abilities!["Faction"].length - 1 && <span className="mr-1.5 text-zinc-500"> </span>}
                  </span>
                ))}
              </div>
            ) : null}

            {standardAbilities.map((rule, rIdx) => (
              <div key={rIdx} className="bg-white p-2.5 shadow-sm border border-zinc-200">
                <div className="font-bold text-zinc-900 text-[13px] sm:text-[14px] uppercase tracking-wide">{rule.name}</div>
                <div className="wahapedia-content text-[13px] sm:text-[14px] text-zinc-700 leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: rule.description }} />
              </div>
            ))}

            {damagedRules.map((rule, i) => (
              <div key={i} className="shadow-sm overflow-hidden border border-zinc-300 rounded-sm">
                <div className="flex justify-between items-center text-white px-3 py-1.5" style={{ backgroundColor: primaryColor }}>
                  <span className="text-[13px] font-bold uppercase tracking-wider truncate mr-2">{rule.name}</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 shrink-0 bg-black/20 rounded">
                    <span className="opacity-90"><DamagedIcon /></span>
                    <span className="text-[10px] font-black text-yellow-400 tracking-wide">ACTIVE</span>
                  </div>
                </div>
                <div className="wahapedia-content p-2.5 bg-white text-[13px] sm:text-[14px] text-zinc-800 leading-relaxed border-t border-zinc-200" dangerouslySetInnerHTML={{ __html: rule.description }} />
              </div>
            ))}
          </div>

          {/* ======================================= */}
          {/* SECTION 2: LEADER / ATTACHED            */}
          {/* ======================================= */}
          {(hasLeaderAbilities || hasLedByAbilities || hasActualLeaders) ? (
            <>
              <div className="px-3 py-1.5 text-white text-[13px] tracking-wide font-bold uppercase shadow-sm mt-3" style={{ backgroundColor: primaryColor }}>
                Leader / Attached
              </div>
              <div className="p-2.5 space-y-2.5 text-[13px] sm:text-[14px]">
                
                {/* --- 1. สำหรับ Character (Leader) --- */}
                {unit.abilities?.["Leader"]?.map((rule, rIdx) => {
                  
                  // แยกประโยคเงื่อนไขพิเศษออกมา (เช่น "You can attach this model even if...")
                  const lines = rule.description.split(/(?:<br\s*\/?>|\n)+/);
                  const extraRulesText = lines.filter(line => {
                      const t = line.trim();
                      if (!t || t.toLowerCase() === 'leader' || t.toLowerCase().includes('this model can be attached')) return false;
                      if (t.startsWith('■') || t.startsWith('•')) return false;
                      return true;
                  });

                  // กำหนดรายชื่อลูกน้องที่จะแสดง
                  let displayBodyguards = actualBodyguards;
                  if (displayBodyguards.length === 0) {
                      displayBodyguards = lines
                          .filter(line => line.trim().startsWith('■') || line.trim().startsWith('•'))
                          .map(line => line.replace(/■|•/g, '').trim())
                          .filter(Boolean);
                  }

                  return (
                    <div key={`leader-${rIdx}`} className="bg-white p-2.5 shadow-sm border border-zinc-200 rounded-sm">
                      <div className="font-bold mb-1 uppercase text-zinc-900 text-[11px]">Leader</div>
                      <div className="text-zinc-800 mb-2 font-medium leading-tight">This model can be attached to the following units:</div>
                      
                      {/* ✅ 2 คอลัมน์, ฟอนต์บาง, Bullet สีเทา, ตรงแนวกันเป๊ะ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-zinc-700 text-[13px] leading-snug">
                        {displayBodyguards.map((bg, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-zinc-400 text-[10px] mt-[3px]">■</span>
                            <span dangerouslySetInnerHTML={{ __html: bg }} />
                          </div>
                        ))}
                      </div>

                      {/* ✅ แสดงกฎเสริมด้านล่าง (ถ้ามี) */}
                      {extraRulesText.length > 0 && (
                        <div className="mt-2 text-zinc-700 text-[13px] leading-relaxed border-t border-zinc-200 pt-2">
                          {extraRulesText.map((txt, idx) => (
                            <div key={idx} dangerouslySetInnerHTML={{ __html: txt }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* --- 2. สำหรับ Bodyguard (LedBy) --- */}
                {hasActualLeaders ? (
                  <div className="bg-white p-2.5 shadow-sm border border-zinc-200 rounded-sm">
                    <div className="font-bold mb-1 uppercase text-zinc-900 text-[11px]">LED BY</div>
                    <div className="text-zinc-800 mb-2 font-medium leading-tight">This unit can be led by the following units:</div>
                    
                    {/* ✅ 2 คอลัมน์, ฟอนต์บาง เหมือนกับ Leader ด้านบน */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-zinc-700 text-[13px] leading-snug">
                      {actualLeaders.map((leader, idx) => {
                        const text = leader.replace(/■|•/g, '').trim(); 
                        return (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-zinc-400 text-[10px] mt-[3px]">■</span>
                            <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  unit.abilities?.["LedBy"]?.map((rule, rIdx) => {
                    let desc = rule.description.trim();
                    const match = desc.match(/can be attached to (?:an? )?(.+?), it can be attached/i);
                    
                    if (match) {
                      const targetUnit = match[1].replace(/ unit$/i, '').trim();
                      return (
                        <div key={`ledby-${rIdx}`} className="bg-white p-2.5 shadow-sm border border-zinc-200 rounded-sm">
                          <div className="font-bold mb-1 uppercase text-zinc-900 text-[11px]">LED BY</div>
                          <div className="text-zinc-800 mb-2 font-medium leading-tight">This unit can be led by any Character that can lead:</div>
                          <div className="flex items-start gap-1.5 text-zinc-700 text-[13px] leading-snug">
                            <span className="text-zinc-400 text-[10px] mt-[3px]">■</span>
                            <span>{targetUnit}</span>
                          </div>
                        </div>
                      );
                    }
                    
                    const fallbackItems = desc.replace(/Attached Unit\n?/gi, '').split(/(?:<br\s*\/?>|\n)+/).filter(i => i.trim() !== '');

                    return (
                      <div key={`ledby-${rIdx}`} className="bg-white p-2.5 shadow-sm border border-zinc-200 rounded-sm">
                        <div className="font-bold mb-1 uppercase text-zinc-900 text-[11px]">{rule.name.toLowerCase() === "attached unit" ? "LED BY" : rule.name}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-zinc-700 text-[13px] leading-snug mt-1.5">
                          {fallbackItems.map((item, idx) => {
                            const text = item.replace(/■|•/g, '').trim();
                            if(!text) return null;
                            return (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-zinc-400 text-[10px] mt-[3px]">■</span>
                                <span dangerouslySetInnerHTML={{ __html: text }} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : null}

          <div className="flex-grow"></div>

          {displayInvulns.map((rule, i) => (
            <div key={`invuln-${i}`} className="flex justify-between items-center text-white px-4 py-2.5 shadow-md border-t border-black/10" style={{ backgroundColor: primaryColor }}>
              <span className="text-[13px] sm:text-[14px] font-black uppercase tracking-widest truncate mr-2 drop-shadow-sm">
                {rule.name.toLowerCase().includes("invulnerable") || rule.name === "Invuln" ? "Invulnerable Save" : rule.name.toUpperCase()}
              </span>
              <div className="flex items-center gap-2.5 px-2 py-1 shrink-0">
                <span className="opacity-100"><InvulnIcon /></span>
                <span className="text-2xl font-black text-yellow-400 leading-none drop-shadow-md">{rule.description.match(/\d+\+/)?.[0] || "4+"}</span>
              </div>
            </div>
          ))}

          <div className="mt-auto">
            <div className="bg-[#d4d4d4] p-2.5 px-3 border-t border-zinc-300">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-[11px] text-zinc-600 uppercase tracking-wide">Faction:</span>
                {unit.factionKeywords?.map((kw, i) => (
                  <span key={i} className="text-[10px] font-bold bg-zinc-700 text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">{kw}</span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}