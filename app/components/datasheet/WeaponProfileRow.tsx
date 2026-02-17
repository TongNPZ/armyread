// app/components/datasheet/WeaponProfileRow.tsx
import React from "react";
import RuleInteractive from "./RuleInteractive";

export interface ProcessedWeapon {
    name: string;
    range: string;
    attacks: string;
    skill: string;
    strength: string;
    ap: string;
    damage: string;
    keywords?: string[];
    displayName: string;
    count: number;
}

interface Props {
    profile: ProcessedWeapon;
    striped?: boolean;
    primaryColor?: string;
    ruleMap: Record<string, string>;
    onRuleClick: (name: string, description: string) => void;
}

export default function WeaponProfileRow({
    profile,
    striped = false,
    primaryColor,
    ruleMap,
    onRuleClick,
}: Props) {
    const keywords = profile.keywords
        ?.flatMap((k) => k.split(",").map((s) => s.trim()))
        .filter(Boolean) || [];

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-center px-3 py-2.5 ${striped ? "bg-zinc-50" : "bg-white"} hover:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0`}
        >
            <div className="flex-1 mb-2 sm:mb-0 pr-2">
                <div className="font-bold text-[13px] sm:text-[14px] leading-tight text-zinc-900 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span>{profile.displayName}</span>
                    {profile.count > 1 && (
                        <span className="text-zinc-500 normal-case text-xs">
                            (x{profile.count})
                        </span>
                    )}

                    {keywords.length > 0 && (
                        <span className="flex flex-wrap items-center gap-x-1 text-[11px] text-zinc-600 sm:ml-1">
                            {keywords.map((kw, i) => (
                                <span key={i} className="flex items-center">
                                    {/* ✅ ปรับให้วงเล็บ [ ] มีสีเดียวกับ Faction */}
                                    <span className="mr-[1px] font-bold opacity-80" style={primaryColor ? { color: primaryColor } : {}}>[</span>
                                    <RuleInteractive
                                        name={kw}
                                        color={primaryColor}
                                        isWeaponRule={true}
                                        onClick={onRuleClick}
                                        ruleMap={ruleMap}
                                    />
                                    <span className="ml-[1px] font-bold opacity-80" style={primaryColor ? { color: primaryColor } : {}}>]</span>
                                    {i < keywords.length - 1 && (
                                        <span className="ml-0.5 text-zinc-400">,</span>
                                    )}
                                </span>
                            ))}
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-6 sm:flex sm:gap-0 text-center text-[13px] sm:text-[14px] w-full sm:w-[260px] font-bold text-zinc-700 shrink-0 tabular-nums">
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">RNG</span>
                    {profile.range}
                </span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">A</span>
                    {profile.attacks}
                </span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">
                        {profile.range === "Melee" ? "WS" : "BS"}
                    </span>
                    {profile.skill}
                </span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">S</span>
                    {profile.strength}
                </span>
                <span className="flex-1 flex flex-col sm:block border-r sm:border-0 border-zinc-200">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">AP</span>
                    {profile.ap}
                </span>
                <span className="flex-1 flex flex-col sm:block">
                    <span className="sm:hidden text-[10px] font-bold text-zinc-400">D</span>
                    {profile.damage}
                </span>
            </div>
        </div>
    );
}