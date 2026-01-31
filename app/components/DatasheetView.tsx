import React from "react"
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import Datasheet from "./Datasheet"

interface Props {
    searchTerm: string
    // ✅ FIX: Type for setState
    setSearchTerm: React.Dispatch<React.SetStateAction<string>> 
    // ✅ FIX: Allow null
    featuredUnit: ArmyListUnit | null 
    otherUnits: ArmyListUnit[]
    factionName?: string
}

export default function DatasheetView({ searchTerm, setSearchTerm, featuredUnit, otherUnits, factionName }: Props) {
    return (
        <div className="space-y-8">
            <div className="sticky top-4 z-30">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search unit name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-lg"
                    />
                    <svg className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {featuredUnit && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Datasheet unit={featuredUnit} faction={factionName} />
                    <div className="mt-4 p-4 border border-zinc-800 bg-zinc-900/50 rounded text-center text-zinc-500 text-sm italic">
                        Stratagems for {featuredUnit.name} will appear here.
                    </div>
                </div>
            )}

            {otherUnits.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-zinc-800">
                    <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wide">Other Units</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otherUnits.map(unit => (
                            <div
                                key={unit.id}
                                className="bg-zinc-900 border border-zinc-700 p-4 hover:border-zinc-500 hover:bg-zinc-800 transition cursor-pointer group"
                                onClick={() => setSearchTerm(unit.name)}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-zinc-200 group-hover:text-white">{unit.name}</h4>
                                    <span className="text-sm text-zinc-500">{unit.points} pts</span>
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {unit.models.map(m => m.name).join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}