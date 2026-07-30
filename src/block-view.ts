import type HarangNextcloudPlugin from "./main";
import { findProfileForLink, parseInternalLink, ParsedInternalLink } from "./nextcloud/link";
import { fetchFileMeta, NextcloudAuthError, NextcloudNotFoundError } from "./nextcloud/client";
import { NextcloudFileMeta, NextcloudProfile } from "./types";
import { t, localeTag } from "./i18n";
import { errorMessage } from "./util";

const CODE_BLOCK_LANG = "nextcloud-file";
const CACHE_TTL_MS = 60_000;

interface CacheEntry {
	meta: NextcloudFileMeta;
	fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

export function registerNextcloudBlockProcessor(plugin: HarangNextcloudPlugin): void {
	plugin.registerMarkdownCodeBlockProcessor(CODE_BLOCK_LANG, async (source, el) => {
		await renderBlock(plugin, source, el);
	});
}

async function renderBlock(plugin: HarangNextcloudPlugin, source: string, el: HTMLElement): Promise<void> {
	el.empty();
	const container = el.createDiv({ cls: "harang-nc-block" });

	const link = parseInternalLink(source);
	if (!link) {
		renderError(container, t("block.unrecognizedLink"), source.trim());
		return;
	}

	const profile = findProfileForLink(plugin.settings.profiles, link);
	if (!profile) {
		renderError(container, t("block.noProfile"), link.raw);
		return;
	}

	container.createDiv({ cls: "harang-nc-loading", text: t("block.loading") });

	const cacheKey = `${profile.id}:${link.fileId}`;
	let meta: NextcloudFileMeta;
	try {
		const cached = cache.get(cacheKey);
		if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
			meta = cached.meta;
		} else {
			meta = await fetchFileMeta(profile, link.fileId);
			cache.set(cacheKey, { meta, fetchedAt: Date.now() });
		}
	} catch (e) {
		const retry = () => {
			cache.delete(cacheKey);
			void renderBlock(plugin, source, el);
		};
		if (e instanceof NextcloudNotFoundError) {
			renderError(container, e.message, link.raw);
		} else if (e instanceof NextcloudAuthError) {
			renderError(container, e.message, link.raw, retry);
		} else {
			renderError(container, errorMessage(e), link.raw, retry);
		}
		return;
	}

	container.empty();
	renderMeta(container, profile, link, meta);
}

function renderMeta(
	container: HTMLElement,
	profile: NextcloudProfile,
	link: ParsedInternalLink,
	meta: NextcloudFileMeta
): void {
	container.createDiv({ cls: "harang-nc-icon", text: meta.isFolder ? "\u{1F4C1}" : "\u{1F4C4}" });

	const infoEl = container.createDiv({ cls: "harang-nc-info" });
	infoEl.createDiv({ cls: "harang-nc-name", text: meta.name });
	infoEl.createDiv({ cls: "harang-nc-path", text: meta.path });

	const metaRow = infoEl.createDiv({ cls: "harang-nc-meta-row" });
	const parts: string[] = [];
	if (meta.size !== null) parts.push(formatBytes(meta.size));
	if (meta.date) {
		const label = meta.dateIsCreationDate ? t("block.dateCreated") : t("block.dateModified");
		parts.push(`${label} ${formatDate(meta.date)}`);
	}
	parts.push(profile.name);
	metaRow.setText(parts.join(" · "));

	const actionsEl = container.createDiv({ cls: "harang-nc-actions" });
	const openLink = actionsEl.createEl("a", {
		cls: "harang-nc-open-btn",
		text: t("block.openInBrowser"),
		href: link.raw,
	});
	openLink.setAttr("rel", "noopener");
}

function renderError(container: HTMLElement, message: string, raw: string, onRetry?: () => void): void {
	container.empty();
	container.addClass("harang-nc-block-error");
	container.createDiv({ cls: "harang-nc-error-message", text: message });
	container.createDiv({ cls: "harang-nc-error-raw", text: raw });
	if (onRetry) {
		const retryBtn = container.createEl("button", { text: t("block.retry") });
		retryBtn.onclick = onRetry;
	}
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const units = ["KB", "MB", "GB", "TB"];
	let value = bytes / 1024;
	let unitIndex = 0;
	while (value >= 1024 && unitIndex < units.length - 1) {
		value /= 1024;
		unitIndex++;
	}
	return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat(localeTag, {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}
