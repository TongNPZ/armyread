import { ArmyListUnit } from "../lib/parser/armyList/armyListTypes";

interface ArmyListViewProps {
  units: ArmyListUnit[];
  faction?: string;
  onSelectUnit: (unit: ArmyListUnit) => void;
}

export default function ArmyListView({
  units,
  faction,
  onSelectUnit,
}: ArmyListViewProps) {
  const groupedUnits = units.reduce(
    (acc, unit) => {
      const cat = unit.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(unit);
      return acc;
    },
    {} as Record<string, ArmyListUnit[]>,
  );

  const categoryOrder = [
    "Epic Hero",
    "Character",
    "Battleline",
    "Infantry",
    "Vehicle",
    "Monster",
    "Dedicated Transport",
    "Other",
  ];
  const sortedCategories = Object.keys(groupedUnits).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  return (
    <div className="space-y-6 pb-20">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-bold uppercase border-b-2 border-zinc-700 text-zinc-400 mb-3 pb-1">
            {category}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedUnits[category].map((unit, idx) => (
              <div
                key={unit.id || idx}
                onClick={() => onSelectUnit(unit)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg hover:border-blue-500/50 hover:shadow-blue-900/10 cursor-pointer transition-all overflow-hidden flex flex-col group"
              >
                {/* Header */}
                <div className="bg-zinc-800/50 p-3 border-b border-zinc-700/50 flex justify-between items-start group-hover:bg-zinc-800 transition-colors">
                  <div className="pr-2">
                    <h4 className="font-bold text-gray-100 leading-tight">
                      {unit.name}
                    </h4>
                    {unit.isWarlord && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 shadow-sm uppercase tracking-wider">
                        Warlord
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-zinc-400 whitespace-nowrap font-mono">
                    {unit.points}{" "}
                    <span className="text-[10px] uppercase">pts</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 text-xs text-zinc-400 space-y-3 flex-grow">
                  {unit.models.map((model, mIdx) => (
                    <div
                      key={mIdx}
                      className="border-b border-zinc-800 last:border-0 pb-2 last:pb-0"
                    >
                      {/* Model Count & Name */}
                      <div className="font-bold text-zinc-200 mb-1.5 flex items-baseline gap-2">
                        <span className="bg-zinc-800 px-1.5 rounded text-zinc-300 font-mono text-[11px] border border-zinc-700">
                          {model.count}
                        </span>
                        <span>{model.name}</span>
                      </div>

                      {/* Weapons List */}
                      {model.weapons.length > 0 && (
                        <div className="pl-1 mb-1.5">
                          {model.weapons.map((w, wIdx) => (
                            <div
                              key={wIdx}
                              className="flex justify-between items-baseline py-0.5 border-b border-zinc-800/50 last:border-0"
                            >
                              <span className="text-zinc-400">{w.name}</span>
                              {/* ✅ FIX: แสดงจำนวนอาวุธเสมอ แม้จะเป็น x1 */}
                              <span className="text-zinc-500 text-[10px] ml-2">
                                x{w.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Wargear: สีฟ้า */}
                      {model.wargear && model.wargear.length > 0 && (
                        <div className="mt-2 text-blue-200 p-2 rounded border border-blue-500/30 bg-blue-900/10">
                          <span className="text-[10px] uppercase font-bold text-blue-400 block mb-0.5 tracking-wider">
                            Wargear
                          </span>
                          <div className="leading-relaxed italic text-blue-300/80">
                            {model.wargear
                              .map(
                                (wg) =>
                                  // แสดงจำนวนเสมอเช่นกัน
                                  `${wg.name} (x${wg.count})`,
                              )
                              .join(", ")}
                          </div>
                        </div>
                      )}

                      {/* Enhancement: สีม่วง */}
                      {model.enhancements && model.enhancements.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-purple-500 bg-purple-900/10 p-2 rounded-r">
                          <span className="font-bold text-purple-400 block text-[10px] uppercase mb-0.5 tracking-wider">
                            Enhancement
                          </span>
                          {model.enhancements.map((enh, eIdx) => (
                            <div
                              key={eIdx}
                              className="text-purple-300 font-bold leading-tight flex justify-between items-center"
                            >
                              <span>{enh.name}</span>
                              <span className="text-purple-500/70 font-mono text-[10px] bg-purple-900/20 px-1 rounded">
                                {enh.points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                {unit.keywords && unit.keywords.length > 0 && (
                  <div className="px-3 py-2 bg-zinc-950/50 border-t border-zinc-800 text-[10px] text-zinc-500 truncate flex gap-1">
                    {unit.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="bg-zinc-800/50 px-1 rounded">
                        {kw}
                      </span>
                    ))}
                    {unit.keywords.length > 3 && (
                      <span className="self-center">...</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

