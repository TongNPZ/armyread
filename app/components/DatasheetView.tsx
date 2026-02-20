// app/components/DatasheetView.tsx
import React from "react";
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes";
import Datasheet from "./Datasheet";
import StratagemCard from "./StratagemCard";
import { getApplicableStratagems } from "../lib/wahapedia/lookup";
import StratagemMiniCard from "./StratagemMiniCard";

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

  // ✅ 1. เอา Roster ทั้งหมดมารวมกันเพื่อใช้เป็นฐานข้อมูลในการแสกน
  const fullRoster = [...(featuredUnit ? [featuredUnit] : []), ...otherUnits];

  // ✅ 2. ตรวจสอบว่า "คำที่พิมพ์" ตรงกับชื่อยูนิตไหนในทัพเราบ้างไหม?
  const searchLower = searchTerm.trim().toLowerCase();
  const isSearching = searchLower !== "";
  const hasMatch = fullRoster.some(unit => unit.name.toLowerCase().includes(searchLower));

  const stratagems = featuredUnit
    ? getApplicableStratagems(
      detachmentName,
      featuredUnit.keywords || [],
      featuredUnit.factionKeywords || []
    )
    : [];

  return (
    <div className="space-y-8 pb-20">

      {/* ======================================= */}
      {/* SEARCH BAR                              */}
      {/* ======================================= */}
      <div className="sticky top-4 z-30">
        <div className="relative">
          <input
            type="text"
            placeholder="Search unit name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // ✅ เปลี่ยนกรอบช่อง Search เป็นสีแดงทันทีถ้าพิมพ์แล้วหาไม่เจอ!
            className={`w-full p-4 pl-12 bg-zinc-900 border rounded-lg shadow-xl focus:outline-none focus:ring-1 text-lg text-white transition-colors duration-300 ${isSearching && !hasMatch
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-zinc-700 focus:border-green-500 focus:ring-green-500"
              }`}
          />
          <svg
            className={`w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isSearching && !hasMatch ? "text-red-500" : "text-zinc-500"
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ======================================= */}
      {/* 🔴 ERROR STATE (โชว์เตือนเมื่อพิมพ์ผิด แต่ไม่ซ่อนยูนิตด้านล่าง!) */}
      {/* ======================================= */}
      {isSearching && !hasMatch && (
        <div className="animate-in fade-in zoom-in-95 duration-300 mt-4">
          <div className="py-6 px-4 bg-red-950/20 border-2 border-red-900/50 rounded-lg text-center shadow-lg backdrop-blur-sm">
            <p className="text-red-500 font-black text-xl uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              TARGET NOT FOUND
            </p>
            <p className="text-red-400/80 text-sm mt-1">
              No unit found matching <span className="font-bold text-white">"{searchTerm}"</span> (Showing the currently selected unit)
            </p>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MAIN DATASHEET AREA                     */}
      {/* ======================================= */}
      {featuredUnit && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            {/* ✅ DYNAMIC HEADER: เปลี่ยนสีและข้อความตามสถานะการค้นหา */}
            <h3 className={`text-xl font-bold uppercase tracking-wide mb-2 flex items-center gap-2 transition-colors duration-300 ${isSearching && !hasMatch ? "text-red-500" : "text-green-500"}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isSearching && !hasMatch ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"}`}></span>
              {isSearching && !hasMatch ? "Target Not Found" : (isSearching ? "Best Match" : "Selected Target")}
            </h3>

            {/* ยูนิตยังโชว์อยู่เหมือนเดิม ไม่โดนซ่อนแล้ว! */}
            <Datasheet unit={featuredUnit} faction={factionName} rosterUnits={fullRoster} />
          </div>

          {/* STRATAGEMS */}
          {stratagems.length > 0 ? (
            <div className="mt-8 mb-8 border-t border-zinc-800 pt-6">
              <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                Applicable Stratagems
              </h3>
              <p className="text-zinc-500 text-sm mb-6 italic">
                Hover over a stratagem to read full rules.
              </p>
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

      {/* ======================================= */}
      {/* OTHER UNITS                             */}
      {/* ======================================= */}
      {otherUnits.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wide">
            {featuredUnit ? "Other Units" : "All Units"}
          </h3>
          <div className="flex flex-col gap-8">
            {otherUnits.map((unit) => (
              <div key={unit.id} className="w-full">
                <Datasheet unit={unit} faction={factionName} rosterUnits={fullRoster} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}