export const DEFAULT_APP_THEME = {
	primary: "#0f9b9b",
	ink: "#000000",
};

const isValidHex = (value: string): boolean => /^#([0-9A-F]{6})$/i.test(value);

const normalizeHex = (value: unknown, fallback: string): string => {
	if (typeof value !== "string") return fallback;
	const hex = value.trim();
	if (!isValidHex(hex)) return fallback;
	return hex.toLowerCase();
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
	const normalized = hex.replace("#", "");
	return {
		r: parseInt(normalized.slice(0, 2), 16),
		g: parseInt(normalized.slice(2, 4), 16),
		b: parseInt(normalized.slice(4, 6), 16),
	};
};

const rgbToHex = (r: number, g: number, b: number): string =>
	`#${[r, g, b]
		.map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
		.join("")}`;

const mixHex = (source: string, target: string, ratio: number): string => {
	const src = hexToRgb(source);
	const dst = hexToRgb(target);
	return rgbToHex(
		src.r + (dst.r - src.r) * ratio,
		src.g + (dst.g - src.g) * ratio,
		src.b + (dst.b - src.b) * ratio,
	);
};

export const applyBusinessThemeFromSettings = (
	settings?: { primary_color?: string | null; text_color?: string | null } | null,
): void => {
	const primary = normalizeHex(settings?.primary_color, DEFAULT_APP_THEME.primary);
	const ink = normalizeHex(settings?.text_color, DEFAULT_APP_THEME.ink);

	const root = document.documentElement;
	root.style.setProperty("--color-brand-primary", primary);
	root.style.setProperty("--color-brand-dark", mixHex(primary, "#000000", 0.22));
	root.style.setProperty("--color-brand-light", mixHex(primary, "#ffffff", 0.45));
	root.style.setProperty("--color-brand-bg", mixHex(primary, "#ffffff", 0.93));
	root.style.setProperty("--color-brand-ink", ink);
};

export const applyDefaultAppTheme = (): void => {
	applyBusinessThemeFromSettings({
		primary_color: DEFAULT_APP_THEME.primary,
		text_color: DEFAULT_APP_THEME.ink,
	});
};
