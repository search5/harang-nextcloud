import { Editor, MarkdownFileInfo, MarkdownView, Notice } from "obsidian";
import type HarangNextcloudPlugin from "./main";
import { findProfileForLink, parseInternalLink } from "./nextcloud/link";
import { t } from "./i18n";

export function registerPasteHandler(plugin: HarangNextcloudPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on(
			"editor-paste",
			(evt: ClipboardEvent, editor: Editor, _info: MarkdownView | MarkdownFileInfo) => {
				if (evt.defaultPrevented) return;

				const text = evt.clipboardData?.getData("text/plain");
				if (!text) return;

				const link = parseInternalLink(text);
				if (!link) return;

				evt.preventDefault();

				const profile = findProfileForLink(plugin.settings.profiles, link);
				if (!profile) {
					new Notice(t("paste.noProfile"));
				}

				editor.replaceSelection(`\`\`\`nextcloud-file\n${link.raw}\n\`\`\`\n`);
			}
		)
	);
}
