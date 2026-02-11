// app/components/StratagemMiniCard.tsx
import React from "react";
import { WahapediaStratagem } from "../lib/wahapedia/lookup";
import StratagemCard from "./StratagemCard";

interface Props {
    stratagem: WahapediaStratagem;
}

export default function StratagemMiniCard({ stratagem }: Props) {
    const getTheme = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("strategic ploy")) return { bgClass: "bg-[#bf0d12] hover:bg-[#a30b0f]" }; // แดง
        if (t.includes("wargear") || t.includes("epic deed")) return { bgClass: "bg-[#096691] hover:bg-[#075375]" }; // น้ำเงิน
        return { bgClass: "bg-[#22796c] hover:bg-[#1c6358]" }; // เขียว (Battle Tactic)
    };

    const theme = getTheme(stratagem.type);

    return (
        <div className="relative w-full group cursor-help">

            {/* 🔹 ป้ายชื่อ (Mini Card) */}
            <div
                className={`flex items-center justify-between w-full px-3 py-2 rounded-md shadow-sm transition-colors duration-200 text-white ${theme.bgClass}`}
            >
                <div className="flex flex-col overflow-hidden pr-2">
                    <span className="font-bold text-[12px] sm:text-[13px] tracking-wide uppercase leading-tight truncate">
                        {stratagem.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-medium opacity-80 uppercase tracking-wider mt-0.5 truncate">
                        {stratagem.type}
                    </span>
                </div>
                <div className="shrink-0 bg-black/20 px-2 py-0.5 rounded text-[11px] sm:text-[12px] font-black tracking-widest">
                    {stratagem.cp_cost}CP
                </div>
            </div>

            {/* 🔹 Tooltip Container */}
            <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full pb-[14px] z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
            >
                {/* ✅ ใช้ drop-shadow ที่ wrapper เพื่อให้เงาคลุมทั้งกล่องและลูกศร */}
                <div className="relative drop-shadow-xl filter">

                    {/* ติ่งลูกศรชี้ลง (เปลี่ยนเป็นสีขาวให้กลืนกับกรอบ) */}
                    <div
                        className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-zinc-100 transform rotate-45 z-0"
                    ></div>

                    {/* ✅ กรอบครอบ Tooltip (พื้นหลังสีขาว มี Padding รอบๆ) */}
                    <div className="relative z-10 bg-white border border-zinc-100 p-3 sm:p-4 overflow-hidden ">
                        <StratagemCard stratagem={stratagem} />
                    </div>
                </div>
            </div>

        </div>
    );
}