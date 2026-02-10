// app/components/Datasheet.tsx
import { useState, useMemo } from "react";
import {
  ArmyListUnit,
  WeaponProfile,
} from "../lib/parser/armyList/armyListTypes";
import { getFactionColor } from "../lib/constants/factionColors";

// ==========================================
// 1. ICONS
// ==========================================

const RangedIcon = () => (
  <svg
    viewBox="0 0 512 512"
    fill="currentColor"
    className="w-5 h-5 inline-block mr-1.5 opacity-90"
  >
    {/* Icon: Reticule (Target) */}
    <path d="M256 16C123.45 16 16 123.45 16 256s107.45 240 240 240 240-107.45 240-240S388.55 16 256 16zm0 34c113.7 0 206 92.3 206 206s-92.3 206-206 206S50 369.7 50 256 142.3 50 256 50zm0 38c-92.8 0-168 75.2-168 168s75.2 168 168 168 168-75.2 168-168S348.8 88 256 88zm0 18c82.76 0 150 67.24 150 150s-67.24 150-150 150S106 338.76 106 256 173.24 106 256 106zm-10 24v116h-97.6c5.58-45.72 39.15-82.6 84.44-91.86l13.16-24.14zm20 0l13.16 24.14C323.25 163.4 356.82 200.28 362.4 246h-96.4V130zm-10 136h116c-5.58 45.72-39.15 82.6-84.44 91.86l-13.16 24.14V266zm-20 0v116l-13.16-24.14c-45.29-9.26-78.86-46.14-84.44-91.86H236z" />
  </svg>
);

const MeleeIcon = () => (
  <svg
    viewBox="0 0 512 512"
    fill="currentColor"
    className="w-5 h-5 inline-block mr-1.5 opacity-90"
  >
    {/* Icon: Sharp Sword (ดาบ) */}
    <path d="M499.5 58.7c-29-37.4-78.1-55.8-124.6-46.7-27.1 5.3-51.7 18.6-70.5 37.4L37.1 316.7c-21.7 21.7-41 57.7-18.7 80 22.3 22.3 58.3 3 80-18.7L365.7 110.7c18.9-18.9 32.1-43.4 37.4-70.5 9.1-46.5-9.3-95.6-46.7-124.6l-8.5-6.6c-7.1-5.5-17.5-1.9-19.6 6.9-3.9 16.3-14.7 30.5-29.6 38.6-14.9 8.1-32.6 8.9-48.1 2.2l-23.7-10.2c-5.8-2.5-12.2 .7-13.8 6.9l-6.3 23.4c-4.9 18.1-17.9 32.7-35.2 39.5L149.3 25.1c-6.8 2.7-9.5 10.6-5.8 16.9l196.9 337.8c-10 16-16.7 34.4-19 53.7-3.9 32.4 4.8 65 24.3 89.9 18.2 23.2 44.8 38.5 73.8 42.4 5.9 .8 11.6-3.2 12.6-9.1 .9-5.3-1.8-10.6-6.4-12.8-18.8-9-32.9-25.5-39.3-45.6-7.8-24.4-4-51.2 10.5-72.9l46.2-69.3c5-7.5 4.5-17.4-1.3-24.4l-7.7-9.3c-6.2-7.5-6.2-18.2 0-25.7l7.7-9.3c5.8-7 6.3-16.9 1.3-24.4l-38.4-57.6c-6.3-9.4-4.2-22.1 4.7-28.8l7.6-5.7c16.3-12.2 37.6-12.2 53.9 0l7.6 5.7c8.9 6.7 21.6 4.7 27.9-4.7l2.8-4.2c5.5-8.3 1.9-19.6-7-23z" />
  </svg>
);

const InvulnIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
    {/* Shield Icon */}
    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-27.4 186.9-69.7 254.8c-37.3 59.8-88.7 99.8-163.4 116.4c-4.5 1-9.2 1-13.7 0c-74.7-16.6-126.1-56.6-163.4-116.4C45.3 326.9 18.5 239.3 18 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z" />
  </svg>
);

const DamagedIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
    {/* Explosion Icon */}
    <path d="M403.4 32.4l-89.9 83.3-22.3-88.4c-3.1-12.2-20.6-14.2-26.5-3L208 132.6 116.4 50.1c-10-9-26.2-3.8-28.7 9.4L73 133 11 118.6c-13.4-3.1-23.7 11.2-15.7 21.8l63.9 84.8-83.3 22.3c-12.2 3.1-14.2 20.6-3 26.5L68.6 304 6.9 375.6c-13.9 16.2 .5 40.5 21.4 36L108 396.9 93.6 481c-3.1 13.4 11.2 23.7 21.8 15.7l84.8-63.9 22.3 83.3c3.3 12.2 20.6 14.2 26.5 3L304 423.4l82.6 62.3c16.2 13.9 40.5-.5 36-21.4L406.9 384l84.1 14.4c13.4 3.1 23.7-11.2 15.7-21.8l-63.9-84.8 83.3-22.3c12.2-3.3 14.2-20.6 3-26.5L443.4 208 505.1 116.4c13.9-16.2-.5-40.5-21.4-36L404 95.1 418.4 21c3.1-13.4-11.2-23.7-21.8-15.7l-83.2 27.1z" />
  </svg>
);

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

const RuleInteractive = ({
  name,
  description,
  color,
  isWeaponRule,
  onClick,
  ruleMap,
}: RuleInteractiveProps) => {
  const displayName = name.replace(/^\[|\]$/g, "").trim();

  // ค้นหาคำอธิบายจาก Map
  let finalDesc = description;
  if (!finalDesc || finalDesc === "-" || finalDesc.length < 5) {
    if (ruleMap[displayName]) {
      finalDesc = ruleMap[displayName];
    } else {
      const key = Object.keys(ruleMap).find(
        (k) =>
          displayName.toLowerCase().startsWith(k.toLowerCase()) ||
          k.toLowerCase().startsWith(displayName.toLowerCase()),
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
                ${isWeaponRule ? "" : "border-b border-dotted border-zinc-500 hover:border-zinc-800"}
            `}
      onClick={(e) => {
        e.stopPropagation();
        onClick(displayName, finalDesc!);
      }}
    >
      <span
        className={`font-bold ${isWeaponRule ? "text-[10px] uppercase" : "text-xs font-bold uppercase text-zinc-600"} group-hover:text-black`}
        style={color && isWeaponRule ? { color: color } : {}}
      >
        {isWeaponRule ? displayName : displayName}
      </span>

      <span
        className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 w-64 bg-zinc-900 text-white text-xs p-3 shadow-xl z-50 pointer-events-none text-left ${tooltipPositionClass}`}
      >
        <span className="font-bold block mb-1 border-b border-zinc-700 pb-1 text-yellow-400 text-sm">
          {displayName}
        </span>
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

  // Data Processing
  const models = unit.models || [];
  const stats = unit.stats || [];
  const sortedStats = [...stats].sort(
    (a, b) =>
      ["M", "T", "SV", "W", "LD", "OC"].indexOf(a.name) -
      ["M", "T", "SV", "W", "LD", "OC"].indexOf(b.name),
  );

  // ==========================================
  // 🛠️ WEAPON LOGIC (Flattened)
  // ==========================================

  interface ProcessedWeapon extends WeaponProfile {
    displayName: string;
    count: number;
  }

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

  // ==========================================

  const handleRuleClick = (name: string, description: string) => {
    setSelectedRule({ name, description });
  };

  // --- SPLIT LOGIC ---
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

  const WeaponProfileRow = ({
    profile,
    striped = false,
  }: {
    profile: ProcessedWeapon;
    striped?: boolean;
  }) => (
    <div
      className={`flex flex-col sm:flex-row sm:items-center px-3 py-2 ${striped ? "bg-zinc-50" : "bg-white"} hover:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0`}
    >
      <div className="flex-1 mb-2 sm:mb-0 pr-2">
        <div className="font-bold text-sm uppercase leading-tight text-zinc-900 flex items-center gap-1.5">
          {profile.displayName}
          {profile.count > 1 && (
            <span className="text-zinc-500 normal-case text-xs">
              (x{profile.count})
            </span>
          )}
        </div>
        {/* Keywords */}
        {profile.keywords && profile.keywords.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-y-1 text-[10px] text-zinc-500 font-bold">
            <span className="mr-0.5">[</span>
            {profile.keywords.map((kw, i) => (
              <span key={i} className="flex items-center">
                <RuleInteractive
                  name={kw}
                  color={primaryColor}
                  isWeaponRule={true}
                  onClick={handleRuleClick}
                  ruleMap={ruleMap}
                />
                {i < profile.keywords.length - 1 && (
                  <span className="mr-1 text-zinc-400">,</span>
                )}
              </span>
            ))}
            <span className="ml-0.5">]</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 sm:flex sm:gap-0 text-center text-sm w-full sm:w-[260px] font-bold text-zinc-700 shrink-0 tabular-nums">
        <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            RNG
          </span>
          {profile.range}
        </span>
        <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            A
          </span>
          {profile.attacks}
        </span>
        <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            {profile.range === "Melee" ? "WS" : "BS"}
          </span>
          {profile.skill}
        </span>
        <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            S
          </span>
          {profile.strength}
        </span>
        <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            AP
          </span>
          {profile.ap}
        </span>
        <span className="flex-1 flex flex-col sm:block">
          <span className="sm:hidden text-[10px] font-bold text-zinc-400">
            D
          </span>
          {profile.damage}
        </span>
      </div>
    </div>
  );

  // Filter Abilities to Separate 'Damaged' rules
  const allAbilities = unit.abilities?.["Abilities"] || [];
  const damagedRules =
    unit.abilities?.["Damaged"] ||
    allAbilities.filter((a) => a.name.includes("Damaged:"));
  const standardAbilities = allAbilities.filter(
    (a) => !a.name.includes("Wargear") && !a.name.includes("Damaged:"),
  );

  // 🛡️ Logic for Invuln: PRIORITY SYSTEM
  const baseInvulns = unit.abilities?.["Invuln"] || [];
  let displayInvulns = [];

  if (baseInvulns.length > 0) {
    // 1. ถ้ามี Base Invuln (เช่น Azrael) ให้ใช้ Base เป็นหลัก
    displayInvulns = baseInvulns;
  } else {
    // 2. ถ้าไม่มี Base Invuln (เช่น Vanguard Vets) ให้กวาดหาจาก Wargear/Abilities
    const potentialSources = [
      ...(unit.abilities?.["Wargear"] || []),
      ...(unit.abilities?.["Abilities"] || []),
    ];

    const extraInvulns = potentialSources.filter((rule) => {
      const desc = rule.description.toLowerCase();
      // หาคำว่า invulnerable และตัวเลข save (เช่น 4+)
      return desc.includes("invulnerable") && /\d+\+/.test(desc);
    });

    // กรองซ้ำออก (เผื่อมีหลายชิ้นให้ผลเหมือนกัน)
    displayInvulns = extraInvulns.filter(
      (v, i, a) => a.findIndex((t) => t.name === v.name) === i,
    );
  }

  return (
    <div className="w-full bg-white text-zinc-900 shadow-xl font-sans mb-4 border-2 border-zinc-800 relative overflow-hidden">
      {/* MODAL */}
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
              <h3 className="font-bold uppercase text-lg text-yellow-400">
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
                  <span className="text-xs font-bold px-2 py-0.5 bg-yellow-400 text-black uppercase shadow-sm">
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
                <div className="text-[10px] sm:text-xs font-bold uppercase leading-none tracking-wide text-white/90 shadow-sm">
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
        {/* LEFT: WEAPONS & SPECIAL ABILITIES (OPTIONS) */}
        <div className="lg:w-[65%] flex flex-col border-b lg:border-b-0 lg:border-r-2 border-zinc-300">
          <div className="flex-grow">
            {/* RANGED */}
            {rangedWeapons.length > 0 && (
              <div className="mb-0">
                <div
                  className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="flex items-center gap-2">
                    <RangedIcon /> Ranged Weapons
                  </span>
                  <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90">
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
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MELEE */}
            {meleeWeapons.length > 0 && (
              <div className="mb-0 border-t-4 border-zinc-300">
                <div
                  className="flex items-center justify-between px-3 py-1.5 text-white text-sm font-bold uppercase border-b border-white/10"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="flex items-center gap-2">
                    <MeleeIcon /> Melee Weapons
                  </span>
                  <div className="hidden sm:flex gap-0 text-center text-xs font-bold w-[260px] opacity-90">
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
                    />
                  ))}
                </div>
              </div>
            )}

            {/* UNIT SPECIAL ABILITIES (Left Side - Options) */}
            {leftSideCategories.length > 0 && (
              <div className="mt-2">
                {leftSideCategories.map((cat, cIdx) => (
                  <div
                    key={cIdx}
                    className="mb-3 border border-zinc-400 bg-zinc-50 overflow-hidden"
                  >
                    <div
                      className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wider"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {cat}
                    </div>
                    <div className="p-3 text-xs text-zinc-800 leading-relaxed">
                      {unit.abilities![cat].map((rule, rIdx) => (
                        <div
                          key={rIdx}
                          className="mb-2 last:mb-0 pl-3 relative"
                        >
                          <span className="absolute left-0 top-0 font-bold text-zinc-500">
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
            <div className="bg-[#bfbfbf] p-2 px-3 border-t border-zinc-400 min-h-[32px]">
              <div className="flex flex-wrap gap-1 text-[10px] uppercase font-bold text-zinc-700 leading-tight">
                <span className="text-zinc-500 mr-1">Keywords:</span>
                {unit.keywords?.join(", ")}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ABILITIES */}
        <div className="lg:w-[35%] flex flex-col bg-[#e8e9eb]">
          <div
            className="px-3 py-1.5 text-white text-sm font-bold uppercase shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Abilities
          </div>
          <div className="p-2 space-y-2 flex-grow text-sm">
            {" "}
            {/* Reduced spacing */}
            {/* CORE */}
            {unit.abilities?.["Core"]?.length ? (
              <div className="pb-3 border-b border-zinc-300">
                <span className="font-bold text-zinc-500 uppercase text-[10px] mr-2">
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
                <span className="font-bold text-zinc-500 uppercase text-[10px] mr-2">
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
            {/* STANDARD ABILITIES (ไม่รวม Damaged) */}
            {standardAbilities.map((rule, rIdx) => (
              <div
                key={rIdx}
                className="bg-white p-2 shadow-sm border border-zinc-200 mt-1.5"
              >
                <div className="font-bold text-zinc-900 text-sm">
                  {rule.name}
                </div>
                <div className="text-xs text-zinc-600 leading-snug whitespace-pre-line mt-1">
                  {rule.description}
                </div>
              </div>
            ))}
            {/* LEADER */}
            {unit.abilities?.["Leader"]?.length ? (
              <div className="pt-2 border-t border-zinc-300 mt-2">
                <div className="font-bold text-[10px] uppercase text-zinc-500 mb-1">
                  Leader / Attached
                </div>
                {unit.abilities["Leader"].map((rule, rIdx) => (
                  <div key={rIdx} className="text-xs bg-zinc-200 p-2">
                    <div className="font-bold mb-1">{rule.name}</div>
                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-700">
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
            {/* DAMAGED: 1-X WOUNDS (New Style with Description) */}
            {damagedRules.map((rule, i) => (
              <div
                key={i}
                className="shadow-sm overflow-hidden border border-zinc-300 mt-2"
              >
                {/* Header */}
                <div
                  className="flex justify-between items-center text-white px-3 py-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-xs font-bold uppercase tracking-wider truncate mr-2">
                    {rule.name}
                  </span>
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 shrink-0">
                    <span className="opacity-90">
                      <DamagedIcon />
                    </span>
                    <span className="text-[10px] font-bold text-yellow-400 leading-none">
                      ACTIVE
                    </span>
                  </div>
                </div>
                {/* Body (Description) */}
                <div className="p-2 bg-white text-xs text-zinc-800 leading-snug whitespace-pre-line border-t border-zinc-200">
                  {rule.description}
                </div>
              </div>
            ))}
            {/* INVULNERABLE SAVE (Priority: Base > Wargear/Abilities) */}
            {displayInvulns.map((rule, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-white px-3 py-2 shadow-sm border border-white/10 mt-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-xs font-bold uppercase tracking-wider truncate mr-2">
                  {/* ถ้าชื่อมีคำว่า Invuln/Invulnerable ให้แสดงว่า Invulnerable Save ถ้าไม่ใช่ (เช่น Storm Shield) ให้แสดงชื่อมัน */}
                  {rule.name.toLowerCase().includes("invulnerable") ||
                    rule.name === "Invuln"
                    ? "Invulnerable Save"
                    : rule.name.toUpperCase()}
                </span>

                <div className="flex items-center gap-2 bg-black/20 px-2 py-1 shrink-0">
                  <span className="opacity-90">
                    <InvulnIcon />
                  </span>
                  <span className="text-xl font-black text-yellow-400 leading-none">
                    {rule.description.match(/\d+\+/)?.[0] || "4+"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* FACTION KEYWORDS */}
          <div className="mt-auto">
            <div className="bg-[#d4d4d4] p-2 px-3 border-t border-zinc-300">
              <div className="flex flex-wrap gap-1">
                <span className="font-bold text-[10px] uppercase text-zinc-500 py-0.5">
                  Faction:
                </span>
                {unit.factionKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold uppercase bg-zinc-600 text-white px-1.5 py-0.5"
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