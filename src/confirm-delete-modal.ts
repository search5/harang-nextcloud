import { App, Modal } from "obsidian";
import { t } from "./i18n";

export class ConfirmNextcloudDeleteModal extends Modal {
	private resolved = false;

	constructor(
		app: App,
		private fileName: string,
		private filePath: string,
		private onChoice: (deleteFromNextcloud: boolean) => void
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h3", { text: t("delete.modalTitle") });
		contentEl.createEl("p", { text: t("delete.modalBody") });
		contentEl.createEl("p", { text: `${this.fileName} (${this.filePath})`, cls: "setting-item-description" });
		contentEl.createEl("p", {
			text: t("delete.modalRetention"),
			cls: "setting-item-description",
		});

		const buttonRow = contentEl.createDiv({ cls: "modal-button-container" });

		const keepButton = buttonRow.createEl("button", { text: t("delete.keepButton") });
		keepButton.onclick = () => this.choose(false);

		const deleteButton = buttonRow.createEl("button", { text: t("delete.moveButton"), cls: "mod-warning" });
		deleteButton.onclick = () => this.choose(true);
	}

	private choose(deleteFromNextcloud: boolean): void {
		this.resolved = true;
		this.onChoice(deleteFromNextcloud);
		this.close();
	}

	onClose(): void {
		this.contentEl.empty();
		if (!this.resolved) {
			// Closed without an explicit choice (Esc / outside click) — default to the safe, non-destructive option.
			this.onChoice(false);
		}
	}
}
