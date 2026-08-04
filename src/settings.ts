import { App, Notice, PluginSettingTab } from "obsidian";
import type { Setting, SettingDefinitionItem, SettingGroupItem } from "obsidian";
import type HarangNextcloudPlugin from "./main";
import { NextcloudProfile } from "./types";
import {
	initiateLoginFlow,
	LoginFlowCancelledError,
	LoginFlowTimeoutError,
	pollLoginFlow,
} from "./nextcloud/loginFlow";
import { normalizeServerUrl } from "./nextcloud/link";
import { nextcloudAppPasswordSecretId } from "./secrets";
import { t } from "./i18n";
import { errorMessage } from "./util";

function makeId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class HarangNextcloudSettingTab extends PluginSettingTab {
	plugin: HarangNextcloudPlugin;

	private newProfileName = "";
	private newProfileServerUrl = "";
	private connecting: { profileId: string | null; cancelled: boolean } | null = null;

	constructor(app: App, plugin: HarangNextcloudPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const profiles = this.plugin.settings.profiles;

		const profileItems: SettingGroupItem[] = [];
		if (profiles.length === 0) {
			profileItems.push({ name: "", desc: t("settings.noProfiles") });
		}
		for (const profile of profiles) {
			profileItems.push({
				name: profile.name,
				desc: `${profile.serverUrl} · ${profile.loginName}`,
				render: (setting) => {
					this.renderProfile(setting, profile);
				},
			});
		}

		const isConnectingNew = this.connecting !== null && this.connecting.profileId === null;

		return [
			{
				type: "group",
				heading: t("settings.heading"),
				items: [{ name: "", desc: t("settings.description") }, ...profileItems],
			},
			{
				type: "group",
				heading: t("settings.addProfileHeading"),
				items: [
					{
						name: t("settings.profileNameLabel"),
						desc: t("settings.profileNameDesc"),
						render: (setting) => {
							setting.addText((text) =>
								text
									.setPlaceholder(t("settings.profileNamePlaceholder"))
									.setValue(this.newProfileName)
									.setDisabled(isConnectingNew)
									.onChange((value) => (this.newProfileName = value))
							);
						},
					},
					{
						name: t("settings.serverUrlLabel"),
						desc: t("settings.serverUrlDesc"),
						render: (setting) => {
							setting.addText((text) =>
								text
									.setPlaceholder("https://cloud.example.com")
									.setValue(this.newProfileServerUrl)
									.setDisabled(isConnectingNew)
									.onChange((value) => (this.newProfileServerUrl = value))
							);
						},
					},
					{
						name: "",
						render: (setting) => {
							setting.addButton((button) => {
								if (isConnectingNew) {
									button
										.setButtonText(t("settings.cancelConnect"))
										.setDestructive()
										.onClick(() => {
											if (this.connecting) this.connecting.cancelled = true;
										});
								} else {
									button
										.setButtonText(t("settings.connectButton"))
										.setCta()
										.onClick(() => this.startNewProfileConnection());
								}
							});
						},
					},
				],
			},
		];
	}

	private renderProfile(setting: Setting, profile: NextcloudProfile): void {
		const isConnecting = this.connecting !== null && this.connecting.profileId === profile.id;

		if (isConnecting) {
			setting.addButton((button) =>
				button
					.setButtonText(t("settings.cancelConnect"))
					.setDestructive()
					.onClick(() => {
						if (this.connecting) this.connecting.cancelled = true;
					})
			);
			return;
		}

		setting.addButton((button) =>
			button.setButtonText(t("settings.reconnectButton")).onClick(() => this.reconnectProfile(profile))
		);
		setting.addButton((button) =>
			button
				.setIcon("trash")
				.setTooltip(t("settings.deleteProfileTooltip"))
				.setDestructive()
				.onClick(async () => {
					this.plugin.settings.profiles = this.plugin.settings.profiles.filter(
						(p) => p.id !== profile.id
					);
					this.app.secretStorage.setSecret(nextcloudAppPasswordSecretId(profile.id), "");
					await this.plugin.saveSettings();
					this.update();
				})
		);
	}

	private async startNewProfileConnection(): Promise<void> {
		const name = this.newProfileName.trim();
		const serverUrlInput = this.newProfileServerUrl.trim();

		if (!name) {
			new Notice(t("settings.errNameRequired"));
			return;
		}
		if (this.plugin.settings.profiles.some((p) => p.name === name)) {
			new Notice(t("settings.errNameTaken"));
			return;
		}
		if (!/^https?:\/\/.+/i.test(serverUrlInput)) {
			new Notice(t("settings.errInvalidUrl"));
			return;
		}

		const serverUrl = normalizeServerUrl(serverUrlInput);
		await this.runLoginFlow(serverUrl, (result) => {
			const profile: NextcloudProfile = {
				id: makeId(),
				name,
				serverUrl: result.server,
				loginName: result.loginName,
				appPassword: result.appPassword,
			};
			this.plugin.settings.profiles.push(profile);
			this.newProfileName = "";
			this.newProfileServerUrl = "";
		});
	}

	private async reconnectProfile(profile: NextcloudProfile): Promise<void> {
		await this.runLoginFlow(
			profile.serverUrl,
			(result) => {
				profile.loginName = result.loginName;
				profile.appPassword = result.appPassword;
				profile.serverUrl = result.server;
			},
			profile.id
		);
	}

	private async runLoginFlow(
		serverUrl: string,
		onSuccess: (result: import("./nextcloud/loginFlow").LoginFlowResult) => void,
		profileId: string | null = null
	): Promise<void> {
		this.connecting = { profileId, cancelled: false };
		this.update();

		try {
			const init = await initiateLoginFlow(serverUrl);
			window.open(init.loginUrl, "_blank");
			new Notice(t("settings.noticeCompleteLogin"));

			const result = await pollLoginFlow(init, () => this.connecting?.cancelled ?? false);
			onSuccess(result);
			await this.plugin.saveSettings();
			new Notice(t("settings.noticeConnected"));
		} catch (e) {
			if (e instanceof LoginFlowCancelledError) {
				new Notice(t("settings.noticeCancelled"));
			} else if (e instanceof LoginFlowTimeoutError) {
				new Notice(t("settings.noticeTimeout"));
			} else {
				new Notice(t("settings.noticeConnectFailed", { message: errorMessage(e) }));
			}
		} finally {
			this.connecting = null;
			this.update();
		}
	}
}
