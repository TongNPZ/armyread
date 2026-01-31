import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"

interface Props {
    orderedCategories: string[]
    groupedUnits: Record<string, ArmyListUnit[]>
}

export default function ArmyListView({ orderedCategories, groupedUnits }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orderedCategories.map(category => {
                const list = groupedUnits[category]
                if (!list?.length) return null
                
                const sortedList = [...list].sort((a, b) => {
                    if (a.isWarlord && !b.isWarlord) return -1
                    if (!a.isWarlord && b.isWarlord) return 1
                    if (a.points !== b.points) return b.points - a.points
                    return a.name.localeCompare(b.name)
                })

                return (
                    <section key={category} className="border border-zinc-700 bg-zinc-900/80 p-4 space-y-4">
                        <h2 className="text-xl font-semibold border-b border-zinc-700 pb-1">{category}</h2>
                        {sortedList.map((unit, idx) => (
                            <div key={unit.id} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="font-semibold">{unit.name}</div>
                                    <div className="text-zinc-400">{unit.points} pts</div>
                                </div>
                                {unit.isWarlord && <div className="text-xs text-red-500 font-semibold">Warlord</div>}
                                {unit.models.map((model, mIdx) => {
                                    const enhancements = model.extras?.filter(e => !e.name.toLowerCase().includes("warlord")) ?? []
                                    return (
                                        <div key={`${model.name}-${mIdx}`} className="ml-2 space-y-1">
                                            <div className="font-medium">{model.count}x {model.name}</div>
                                            {model.weapons.length > 0 && (
                                                <ul className="ml-4 list-disc text-sm text-zinc-400">
                                                    {model.weapons.map((w, wIdx) => (
                                                        <li key={`${w.name}-${wIdx}`}>{w.count}x {w.name}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {enhancements.length > 0 && (
                                                <ul className="ml-4 list-disc text-sm text-purple-400">
                                                    {enhancements.map(e => (
                                                        <li key={e.name}>Enhancement: {e.name} {e.points ? `(+${e.points} pts)` : ""}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )
                                })}
                                {idx < sortedList.length - 1 && <div className="border-t border-zinc-700/70 pt-2 mt-3" />}
                            </div>
                        ))}
                    </section>
                )
            })}
        </div>
    )
}