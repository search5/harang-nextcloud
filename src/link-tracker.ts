import { Notice, TFile } from "obsidian";
import type HarangNextcloudPlugin from "./main";
import { findProfileForLink, parseInternalLink, ParsedInternalLink } from "./nextcloud/link";
import {
	deleteFile,
	fetchFileMeta,
	NextcloudAuthError,
	NextcloudNotFoundError,
} from "./nextcloud/client";
import { ConfirmNextcloudDeleteModal } from "./confirm-delete-modal";
import { t } from "./i18n";
import { errorMessage } from "./util";

const BLOCK_RE = /```nextcloud-file\r?\n([\s\S]*?)\r?\n```/g;

function extractLinks(content: string): ParsedInternalLink[] {
	const links: ParsedInternalLink[] = [];
	let match: RegExpExecArray | null;
	BLOCK_RE.lastIndex = 0;
	while ((match = BLOCK_RE.exec(content)) !== null) {
		const link = parseInternalLink(match[1]);
		if (link) links.push(link);
	}
	return links;
}

function linkKey(link: ParsedInternalLink): string {
	return `${link.baseUrl}|${link.fileId}`;
}

/**
 * Watches markdown files for nextcloud-file blocks that get removed (edited out or the
 * note itself deleted) and asks the user whether the underlying Nextcloud file should
 * also be deleted. Only files opened/modified during this Obsidian session are tracked —
 * changes made to a note while Obsidian wasn't watching it can't be detected.
 */
export function registerLinkTracker(plugin: HarangNextcloudPlugin): void {
	const baseline = new Map<string, Map<string, ParsedInternalLink>>();
	let queue: Promise<void> = Promise.resolve();

	const setBaseline = (path: string, content: string) => {
		baseline.set(path, new Map(extractLinks(content).map((l) => [linkKey(l), l])));
	};

	plugin.app.workspace.onLayoutReady(() => {
		const active = plugin.app.workspace.getActiveFile();
		if (active && active.extension === "md") {
			void plugin.app.vault.cachedRead(active).then((c) => setBaseline(active.path, c));
		}
	});

	plugin.registerEvent(
		plugin.app.workspace.on("file-open", (file) => {
			if (file && file.extension === "md" && !baseline.has(file.path)) {
				void plugin.app.vault.cachedRead(file).then((c) => setBaseline(file.path, c));
			}
		})
	);

	plugin.registerEvent(
		plugin.app.vault.on("modify", (file) => {
			if (!(file instanceof TFile) || file.extension !== "md") return;
			void plugin.app.vault.cachedRead(file).then((content) => {
				const previous = baseline.get(file.path);
				const currentMap = new Map(extractLinks(content).map((l) => [linkKey(l), l]));

				if (previous) {
					const removed = Array.from(previous.entries())
						.filter(([key]) => !currentMap.has(key))
						.map(([, link]) => link);
					if (removed.length > 0) {
						queue = queue.then(() => processRemovals(plugin, removed));
					}
				}

				baseline.set(file.path, currentMap);
			});
		})
	);

	plugin.registerEvent(
		plugin.app.vault.on("delete", (file) => {
			if (!(file instanceof TFile) || file.extension !== "md") return;
			const previous = baseline.get(file.path);
			baseline.delete(file.path);
			if (previous && previous.size > 0) {
				const removed = Array.from(previous.values());
				queue = queue.then(() => processRemovals(plugin, removed));
			}
		})
	);
}

async function processRemovals(plugin: HarangNextcloudPlugin, removed: ParsedInternalLink[]): Promise<void> {
	for (const link of removed) {
		await processOneRemoval(plugin, link);
	}
}

async function processOneRemoval(plugin: HarangNextcloudPlugin, link: ParsedInternalLink): Promise<void> {
	const profile = findProfileForLink(plugin.settings.profiles, link);
	if (!profile) return;

	let name = link.raw;
	let path = "";
	try {
		const meta = await fetchFileMeta(profile, link.fileId);
		name = meta.name;
		path = meta.path;
	} catch (e) {
		// Already gone, or we can't authenticate to check — nothing actionable either way.
		if (e instanceof NextcloudNotFoundError || e instanceof NextcloudAuthError) return;
		return;
	}

	const shouldDelete = await new Promise<boolean>((resolve) => {
		new ConfirmNextcloudDeleteModal(plugin.app, name, path, resolve).open();
	});
	if (!shouldDelete) return;

	try {
		await deleteFile(profile, path);
		new Notice(t("delete.movedToTrash", { filename: name }));
	} catch (e) {
		new Notice(t("delete.moveFailed", { message: errorMessage(e) }));
	}
}
