// app/components/StratagemCard.tsx
import React from "react";
import { WahapediaStratagem } from "../lib/wahapedia/lookup";

interface Props {
    stratagem: WahapediaStratagem;
}

export default function StratagemCard({ stratagem }: Props) {
    // 🎨 จัดการสีตามจำพวก (Type)
    const getThemeColor = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("strategic ploy")) return "#bf0d12"; // แดง
        if (t.includes("wargear") || t.includes("epic deed")) return "#096691"; // น้ำเงิน
        return "#22796c"; // เขียวอมฟ้า (Battle Tactic)
    };

    const getPhaseIcon = (phase: string) => {
        const p = phase.toLowerCase();
        if (p.includes("command")) return "https://www.wahapedia.ru/wh40k10ed/img/expansions/CommandPhase_logo3.png";
        if (p.includes("movement")) return "https://www.wahapedia.ru/wh40k10ed/img/expansions/MovementPhase_logo3.png";
        if (p.includes("shooting")) return "https://www.wahapedia.ru/wh40k10ed/img/expansions/ShootingPhase_logo3.png";
        if (p.includes("charge")) return "https://www.wahapedia.ru/wh40k10ed/img/expansions/ChargePhase_logo3.png";
        if (p.includes("fight")) return "https://www.wahapedia.ru/wh40k10ed/img/expansions/FightPhase_logo3.png";
        return "https://wahapedia.ru/wh40k10ed/img/stratAny.png";
    };

    const styleColor = getThemeColor(stratagem.type);
    const iconUrl = getPhaseIcon(stratagem.phase);

    const getTopBorder = (turn: string) => {
        const t = turn.toLowerCase();
        if (t.includes("either")) return `8px double ${styleColor}`;
        if (t.includes("opponent")) return `4px dotted ${styleColor}`;
        return `4px solid ${styleColor}`;
    };

    const cleanedHTML = stratagem.description.replace(/(<br>\s*)+/gi, '<div class="my-2"></div>');

    return (
        // 📱 รองรับ Mobile (w-[340px]) และ Desktop (sm:w-[420px])
        <div className="relative flex w-[340px] sm:w-[420px] bg-transparent font-sans drop-shadow-xl">

            {/* 🔹 กลุ่มเพชร (Diamonds) ถูกย้ายมาอยู่ที่ left-0 แทนการติดลบ (ไม่มีทางโดนตัด) */}
            <div className="absolute top-[12px] left-0 flex flex-col gap-[14px] z-20 w-[40px]">
                {/* Phase Diamond */}
                <div
                    className="w-[36px] h-[36px] bg-white flex justify-center items-center transform rotate-45 shadow-sm"
                    style={{ border: `3px solid ${styleColor}` }}
                >
                    <div
                        className="w-[26px] h-[26px] bg-contain bg-center bg-no-repeat transform -rotate-45"
                        style={{ backgroundImage: `url('${iconUrl}')` }}
                    />
                </div>
                {/* CP Diamond */}
                <div
                    className="w-[36px] h-[36px] bg-white flex justify-center items-center transform rotate-45 shadow-sm"
                    style={{ border: `3px solid ${styleColor}` }}
                >
                    <span
                        className="font-black text-[18px] transform -rotate-45"
                        style={{ color: styleColor }}
                    >
                        {stratagem.cp_cost}
                    </span>
                </div>
            </div>

            {/* 🔹 การ์ดเนื้อหา (Main Card) ดันตัวเองออกขวาด้วย ml-[18px] เพื่อหลบเพชร */}
            <div
                className="relative flex-1 flex ml-[18px] bg-[#fcfcfc] rounded-tr-md rounded-br-sm rounded-bl-sm overflow-hidden"
                style={{
                    borderTop: getTopBorder(stratagem.turn),
                    borderBottom: `2px solid ${styleColor}`,
                    borderRight: `2px solid ${styleColor}`
                }}
            >
                {/* แถบสีหนาด้านซ้าย */}
                <div className="w-[20px] shrink-0" style={{ backgroundColor: styleColor }} />

                {/* เนื้อหา */}
                <div className="flex-1 py-3 pr-4 pl-3 sm:pl-4 text-zinc-800">
                    <h2
                        className="font-black text-[18px] sm:text-[22px] uppercase leading-none tracking-tighter mb-1.5"
                        style={{ color: styleColor, fontFamily: 'Arial Black, Impact, sans-serif' }}
                    >
                        {stratagem.name}
                    </h2>

                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-500 border-b-2 border-dotted border-zinc-300 pb-1.5 mb-2.5">
                        {stratagem.type}
                    </div>

                    <div
                        className="text-[12px] sm:text-[13.5px] leading-relaxed stratagem-desc-html text-justify"
                        dangerouslySetInnerHTML={{ __html: cleanedHTML }}
                    />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .stratagem-desc-html b { color: ${styleColor}; font-weight: 900; }
        .stratagem-desc-html i { color: #52525b; font-style: italic; display: block; margin-bottom: 4px; }
        .stratagem-desc-html p { margin-bottom: 8px; }
      `}} />
        </div>
    );
}