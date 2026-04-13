import React from "react";

interface SmartosStatCardProps {
	icon: React.ReactNode;
	iconBg: string;
	value: string | number;
	subtitle: string;
	badge?: {
		text: string;
		type?: "emerald" | "amber" | "blue" | "orange" | "purple";
	};
}

const BADGE_COLORS = {
	emerald: "text-emerald-600 bg-emerald-50",
	amber: "text-brand-dark bg-brand-bg",
	blue: "text-blue-600 bg-blue-50",
	orange: "text-orange-600 bg-orange-50",
	purple: "text-purple-600 bg-purple-50",
};

export const SmartosStatCard = ({ icon, iconBg, value, subtitle, badge }: SmartosStatCardProps) => {
	return (
		<div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-shadow group h-full">
			<div
				className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${iconBg}`}
			>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-2xl leading-none font-bold text-slate-900 tracking-tight">{value}</span>
					{badge && (
						<span
							className={`inline-flex items-center h-5 text-[10px] font-bold uppercase tracking-wide px-2 rounded-full ${BADGE_COLORS[badge.type || "emerald"]}`}
						>
							{badge.text}
						</span>
					)}
				</div>
				<p className="mt-1 text-sm font-semibold text-slate-600 leading-tight truncate">
					{subtitle}
				</p>
			</div>
		</div>
	);
};
