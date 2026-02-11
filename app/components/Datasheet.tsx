// app/components/Datasheet.tsx
import { useState, useMemo } from "react";
import { ArmyListUnit } from "../lib/parser/armyList/armyListTypes";
import { getFactionColor } from "../lib/constants/factionColors";

// ✅ 1. Import Component ที่แยกออกไป
import { RangedIcon, MeleeIcon, InvulnIcon, DamagedIcon } from "./datasheet/DatasheetIcons";
import RuleInteractive from "./datasheet/RuleInteractive";
import WeaponProfileRow, { ProcessedWeapon } from "./datasheet/WeaponProfileRow";

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Datasheet({
  unit,
  faction,
}: {
  unit: ArmyListUnit;
  faction?: string;
}) {
  const [selectedRule, setSelectedRule] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const ruleMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    if (unit && unit.abilities) {
      Object.values(unit.abilities)
        .flat()
        .forEach((r) => {
          if (r.description && r.description !== "-") {
            map[r.name] = r.description;
          }
        });
      unit.abilities["WeaponRules"]?.forEach((r) => {
        map[r.name] = r.description;
      });
    }
    return map;
  }, [unit]);

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
              displayName = p.name.includes("-")
                ? p.name
                : `${w.name} - ${p.name}`;
            } else if (p.name) {
              displayName = p.name;
            }

            const existing = result.find(
              (r) =>
                r.displayName === displayName &&
                r.range === p.range &&
                r.attacks === p.attacks &&
                r.skill === p.skill &&
                r.strength === p.strength &&
                r.ap === p.ap &&
                r.damage === p.damage,
            );

            if (existing) {
              existing.count += w.count;
            } else {
              result.push({
                ...p,
                displayName: displayName,
                count: w.count,
              });
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

  const standardCategories = [
    "Core",
    "Faction",
    "Abilities",
    "Leader",
    "Invuln",
    "Damaged",
    "Wargear",
    "WeaponRules",
  ];

  const leftSideCategories = Object.keys(unit.abilities || {}).filter(
    (cat) => !standardCategories.includes(cat),
  );

  const allAbilities = unit.abilities?.["Abilities"] || [];
  const damagedRules =
    unit.abilities?.["Damaged"] ||
    allAbilities.filter((a) => a.name.includes("Damaged:"));
  const standardAbilities = allAbilities.filter(
    (a) => !a.name.includes("Wargear") && !a.name.includes("Damaged:"),
  );

  const baseInvulns = unit.abilities?.["Invuln"] || [];
  let displayInvulns = [];

  if (baseInvulns.length > 0) {
    displayInvulns = baseInvulns;
  } else {
    const potentialSources = [
      ...(unit.abilities?.["Wargear"] || []),
      ...(unit.abilities?.["Abilities"] || []),
    ];

    const extraInvulns = potentialSources.filter((rule) => {
      const desc = rule.description.toLowerCase();
      return desc.includes("invulnerable") && /\d+\+/.test(desc);
    });

    displayInvulns = extraInvulns.filter(
      (v, i, a) => a.findIndex((t) => t.name === v.name) === i,
    );
  }

  return (
    <div className="w-full bg-white text-zinc-900 shadow-xl font-sans mb-4 border-2 border-zinc-800 relative">
      {/* MODAL (ยังเก็บไว้เผื่อเล่นในมือถือแล้วจิ้ม) */}
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
              <h3 className="font-bold text-lg text-yellow-400">
                {selectedRule.name}
              </h3>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-5 text-sm leading-relaxed text-zinc-800 bg-zinc-50 max-h-[60vh] overflow-y-auto whitespace-pre-line">
              {selectedRule.description}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div
        className="text-white p-3 sm:p-4 pb-5 sm:pb-6 relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
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
              {unit.points}{" "}
              <span className="text-xs sm:text-sm font-normal opacity-80">
                pts
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2 sm:gap-4">
            {sortedStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <div className="text-[10px] sm:text-xs font-bold leading-none tracking-wide text-white/90 shadow-sm">
                  {stat.name}
                </div>
                <div className="flex items-center justify-center bg-white text-black w-10 h-10 sm:w-12 sm:h-12 shadow-md border border-zinc-400/50 relative overflow-hidden">
                  {stat.name === "SV" && (
                    <div className="absolute inset-0 border-[3px] border-zinc-300 opacity-20"></div>
                  )}
                  {stat.name === "W" && (
                    <div className="absolute bottom-0 w-full h-1 bg-red-500 opacity-20"></div>
                  )}
                  <div className="font-black text-xl sm:text-2xl tracking-tighter z-10">
                    {stat.value}
                  </div>
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
                    <WeaponProfileRow
                      key={idx}
                      profile={w}
                      striped={idx % 2 !== 0}
                      primaryColor={primaryColor}
                      ruleMap={ruleMap}
                      onRuleClick={handleRuleClick}
                    />
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
                    <WeaponProfileRow
                      key={idx}
                      profile={w}
                      striped={idx % 2 !== 0}
                      primaryColor={primaryColor}
                      ruleMap={ruleMap}
                      onRuleClick={handleRuleClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* UNIT SPECIAL ABILITIES */}
            {leftSideCategories.length > 0 && (
              <div className="mt-3 px-2 pb-2">
                {leftSideCategories.map((cat, cIdx) => (
                  <div
                    key={cIdx}
                    className="mb-3 border border-zinc-300 bg-white shadow-sm"
                  >
                    <div
                      className="text-white px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {cat}
                    </div>
                    <div className="p-3 text-[13px] sm:text-[14px] text-zinc-800 leading-relaxed">
                      {unit.abilities![cat].map((rule, rIdx) => (
                        <div
                          key={rIdx}
                          className="mb-2 last:mb-0 pl-3 relative"
                        >
                          <span className="absolute left-0 top-0 font-bold text-zinc-400">
                            •
                          </span>
                          <strong className="text-black font-bold uppercase">
                            {rule.name}:
                          </strong>{" "}
                          {rule.description}
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
                <span className="font-bold text-[11px] text-zinc-600 uppercase tracking-wide">
                  Faction:
                </span>
                {unit.factionKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-zinc-700 text-white px-2 py-0.5 rounded-sm uppercase tracking-wider"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ABILITIES */}
        <div className="lg:w-[35%] flex flex-col bg-[#f4f4f5]">
          <div
            className="px-3 py-1.5 text-white text-[13px] tracking-wide font-bold uppercase shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Abilities
          </div>
          <div className="p-2.5 space-y-2.5 flex-grow text-[13px] sm:text-[14px]">
            {/* CORE */}
            {unit.abilities?.["Core"]?.length ? (
              <div className="pb-3 border-b border-zinc-300">
                <span className="font-black text-zinc-500 uppercase text-[11px] mr-2">
                  CORE:
                </span>
                {unit.abilities["Core"].map((r, i) => (
                  <span key={i}>
                    <RuleInteractive
                      name={r.name}
                      description={r.description}
                      onClick={handleRuleClick}
                      ruleMap={ruleMap}
                    />
                    {i < unit.abilities!["Core"].length - 1 && (
                      <span className="mr-1.5 text-zinc-500">,</span>
                    )}
                  </span>
                ))}
              </div>
            ) : null}
            {/* FACTION */}
            {unit.abilities?.["Faction"]?.length ? (
              <div className="pb-3 border-b border-zinc-300">
                <span className="font-black text-zinc-500 uppercase text-[11px] mr-2">
                  FACTION:
                </span>
                {unit.abilities["Faction"].map((r, i) => (
                  <span key={i}>
                    <RuleInteractive
                      name={r.name}
                      description={r.description}
                      onClick={handleRuleClick}
                      ruleMap={ruleMap}
                    />
                    {i < unit.abilities!["Faction"].length - 1 && (
                      <span className="mr-1.5 text-zinc-500"> </span>
                    )}
                  </span>
                ))}
              </div>
            ) : null}
            {/* STANDARD ABILITIES */}
            {standardAbilities.map((rule, rIdx) => (
              <div
                key={rIdx}
                className="bg-white p-2.5 shadow-sm border border-zinc-200 mt-1.5"
              >
                <div className="font-bold text-zinc-900 text-[13px] sm:text-[14px] uppercase tracking-wide">
                  {rule.name}
                </div>
                <div className="text-[13px] sm:text-[14px] text-zinc-700 leading-relaxed whitespace-pre-line mt-1.5">
                  {rule.description}
                </div>
              </div>
            ))}
            {/* LEADER */}
            {unit.abilities?.["Leader"]?.length ? (
              <div className="pt-2 border-t border-zinc-300 mt-3">
                <div className="font-black text-[11px] uppercase text-zinc-500 mb-1.5">
                  Leader / Attached
                </div>
                {unit.abilities["Leader"].map((rule, rIdx) => (
                  <div key={rIdx} className="text-[13px] sm:text-[14px] bg-zinc-200/70 border border-zinc-300 p-2.5 mb-2 rounded-sm">
                    <div className="font-bold mb-1.5 uppercase text-zinc-800">{rule.name}</div>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-700">
                      {rule.description
                        .split("\n")
                        .map(
                          (line, i) =>
                            line.trim().length > 1 && (
                              <li key={i}>{line.replace(/^[■-]\s*/, "")}</li>
                            ),
                        )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
            {/* DAMAGED */}
            {damagedRules.map((rule, i) => (
              <div
                key={i}
                className="shadow-sm overflow-hidden border border-zinc-300 mt-3 rounded-sm"
              >
                <div
                  className="flex justify-between items-center text-white px-3 py-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-[13px] font-bold uppercase tracking-wider truncate mr-2">
                    {rule.name}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 shrink-0 bg-black/20 rounded">
                    <span className="opacity-90">
                      <DamagedIcon />
                    </span>
                    <span className="text-[10px] font-black text-yellow-400 tracking-wide">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <div className="p-2.5 bg-white text-[13px] sm:text-[14px] text-zinc-800 leading-relaxed whitespace-pre-line border-t border-zinc-200">
                  {rule.description}
                </div>
              </div>
            ))}
            {/* INVULNERABLE SAVE */}
            {displayInvulns.map((rule, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-white px-4 py-2.5 shadow-md border-2  mt-3"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-[13px] sm:text-[14px] font-black uppercase tracking-widest truncate mr-2 drop-shadow-sm">
                  {rule.name.toLowerCase().includes("invulnerable") ||
                    rule.name === "Invuln"
                    ? "Invulnerable Save"
                    : rule.name.toUpperCase()}
                </span>
                <div className="flex items-center gap-2.5 px-2 py-1 shrink-0">
                  <span className="opacity-100">
                    <InvulnIcon />
                  </span>
                  <span className="text-2xl font-black text-yellow-400 leading-none drop-shadow-md">
                    {rule.description.match(/\d+\+/)?.[0] || "4+"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* FACTION KEYWORDS */}
          <div className="mt-auto">
            <div className="bg-[#d4d4d4] p-2.5 px-3 border-t border-zinc-300">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-[11px] text-zinc-600 uppercase tracking-wide">
                  Faction:
                </span>
                {unit.factionKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-zinc-700 text-white px-2 py-0.5 rounded-sm uppercase tracking-wider"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}