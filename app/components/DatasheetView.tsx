// app/components/DatasheetView.tsx
import React from "react";
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes";
import Datasheet from "./Datasheet";
import StratagemCard from "./StratagemCard";
import { getApplicableStratagems } from "../lib/wahapedia/lookup";
import StratagemMiniCard from "./StratagemMiniCard"; // ✅ Import Component ใหม่

interface Props {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  featuredUnit: ArmyListUnit | null;
  otherUnits: ArmyListUnit[];
  factionName?: string;
  detachmentName?: string;
}

export default function DatasheetView({
  searchTerm,
  setSearchTerm,
  featuredUnit,
  otherUnits,
  factionName,
  detachmentName = "",
}: Props) {

  // กรอง Stratagem เฉพาะอันที่ใช้ได้
  const stratagems = featuredUnit
    ? getApplicableStratagems(
      detachmentName,
      featuredUnit.keywords || [],
      featuredUnit.factionKeywords || []
    )
    : [];

  return (
    <div className="space-y-8 pb-20">
      {/* Search Bar */}
      <div className="sticky top-4 z-30">
        <div className="relative">
          <input
            type="text"
            placeholder="Search unit name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-lg text-white"
          />
          <svg
            className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Featured Unit (Exact Match) */}
      {featuredUnit && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-green-500 uppercase tracking-wide mb-2">
              Best Match
            </h3>
            <Datasheet unit={featuredUnit} faction={factionName} />
          </div>

          {/* ✅ ส่วนแสดง Stratagems เปลี่ยนมาใช้ Mini Card */}
          {stratagems.length > 0 ? (
            <div className="mt-8 mb-8 border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                Applicable Stratagems
              </h3>
              <p className="text-zinc-500 text-sm mb-6 italic">
                Hover over a stratagem to read full rules.
              </p>

              {/* ✅ เปลี่ยนเป็น Grid 2-3 คอลัมน์ (เพราะการ์ดเราเล็กลงแล้ว) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stratagems.map((strat) => (
                  <StratagemMiniCard key={strat.name} stratagem={strat} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded text-center text-zinc-500 text-sm italic mb-8">
              No applicable stratagems found for {featuredUnit.name}.
            </div>
          )}
        </div>
      )}

      {/* Other Units / All Units List */}
      {otherUnits.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wide">
            {featuredUnit ? "Other Units" : "All Units"}
          </h3>
          <div className="flex flex-col gap-8">
            {otherUnits.map((unit) => (
              <div key={unit.id} className="w-full">
                <Datasheet unit={unit} faction={factionName} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!featuredUnit && otherUnits.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          No units found matching {searchTerm}
        </div>
      )}
    </div>
  );
}