import { Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, HarangNextcloudSettings } from "./types";
import { HarangNextcloudSettingTab } from "./settings";
import { registerNextcloudBlockProcessor } from "./block-view";
import { registerPasteHandler } from "./paste-handler";
import { registerAttachmentUploadHandler } from "./attachment-upload";
import { registerLinkTracker } from "./link-tracker";
import { parseInternalLink } from "./nextcloud/link";
import { nextcloudAppPasswordSecretId } from "./secrets";
import { t } from "./i18n";

export default class HarangNextcloudPlugin extends Plugin {
	settings: HarangNextcloudSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new HarangNextcloudSettingTab(this.app, this));

		registerNextcloudBlockProcessor(this);
		registerPasteHandler(this);
		registerAttachmentUploadHandler(this);
		registerLinkTracker(this);

		this.addCommand({
			id: "convert-selection-to-nextcloud-block",
			name: t("command.convertSelection"),
			editorCallback: (editor: Editor, _info: MarkdownView | MarkdownFileInfo) => {
				const selection = editor.getSelection();
				const link = parseInternalLink(selection);
				if (!link) {
					new Notice(t("command.noticeInvalidSelection"));
					return;
				}
				editor.replaceSelection(`\`\`\`nextcloud-file\n${link.raw}\n\`\`\`\n`);
			},
		});
	}

	async loadSettings(): Promise<void> {
		const stored = (await this.loadData()) as Partial<HarangNextcloudSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, stored);

		let needsMigrationSave = false;
		for (const profile of this.settings.profiles) {
			const secretId = nextcloudAppPasswordSecretId(profile.id);
			const savedSecret = this.app.secretStorage.getSecret(secretId);
			if (savedSecret !== null) {
				profile.appPassword = savedSecret;
			} else if (profile.appPassword) {
				// Pre-SecretStorage data.json still has this profile's app password in plain text - move it over.
				this.app.secretStorage.setSecret(secretId, profile.appPassword);
				needsMigrationSave = true;
			}
		}

		if (needsMigrationSave) await this.saveSettings();
	}

	async saveSettings(): Promise<void> {
		for (const profile of this.settings.profiles) {
			this.app.secretStorage.setSecret(nextcloudAppPasswordSecretId(profile.id), profile.appPassword);
		}

		await this.saveData({
			...this.settings,
			profiles: this.settings.profiles.map((profile) => ({ ...profile, appPassword: "" })),
		});
	}
}
