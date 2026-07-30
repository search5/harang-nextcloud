import { getLanguage } from "obsidian";
import { en, TranslationKey } from "./en";
import { ko } from "./ko";

const DICTS: Record<string, Record<TranslationKey, string>> = { en, ko };

function pickDict(): Record<TranslationKey, string> {
	const lang = getLanguage().toLowerCase();
	if (DICTS[lang]) return DICTS[lang];
	const base = lang.split("-")[0];
	return DICTS[base] ?? en;
}

const dict = pickDict();
/** BCP-47 tag for Intl formatting (e.g. Date), chosen to match the picked dictionary. */
export const localeTag = dict === ko ? "ko-KR" : "en-US";

export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
	let text = dict[key] ?? en[key] ?? key;
	if (vars) {
		for (const [name, value] of Object.entries(vars)) {
			text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
		}
	}
	return text;
}
