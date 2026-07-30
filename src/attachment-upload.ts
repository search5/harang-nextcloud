import { Editor, MarkdownFileInfo, MarkdownView, Notice } from "obsidian";
import type HarangNextcloudPlugin from "./main";
import { resolveUploadTarget, UploadTarget } from "./nextcloud/link";
import { ensureFolder, findAvailableUploadName, uploadFile } from "./nextcloud/client";
import { t } from "./i18n";
import { errorMessage } from "./util";

export function registerAttachmentUploadHandler(plugin: HarangNextcloudPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on(
			"editor-paste",
			(evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
				if (evt.defaultPrevented) return;

				const files = evt.clipboardData?.files;
				if (!files || files.length === 0) return;

				const nonImageFiles = Array.from(files).filter((f) => !f.type.startsWith("image/"));
				if (nonImageFiles.length === 0) return; // let Obsidian paste images normally

				evt.preventDefault();

				const activeFile = info.file;
				if (!activeFile) {
					new Notice(t("attachment.noActiveFile"));
					return;
				}

				const ncFolderRaw: unknown = plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter?.[
					"nc-folder"
				];
				const ncFolder = typeof ncFolderRaw === "string" ? ncFolderRaw.trim() : "";

				if (!ncFolder) {
					new Notice(t("attachment.ncFolderMissing"));
					return;
				}

				const target = resolveUploadTarget(ncFolder, plugin.settings.profiles);
				if ("error" in target) {
					new Notice(target.error);
					return;
				}

				void uploadAndInsert(editor, target, nonImageFiles);
			}
		)
	);
}

async function uploadAndInsert(editor: Editor, target: UploadTarget, files: File[]): Promise<void> {
	const { profile, folderPath } = target;
	const blocks: string[] = [];

	try {
		await ensureFolder(profile, folderPath);
	} catch (e) {
		new Notice(t("attachment.folderPrepFailed", { message: errorMessage(e) }));
		return;
	}

	for (const file of files) {
		const notice = new Notice(t("attachment.uploading", { filename: file.name }), 0);
		try {
			const buffer = await file.arrayBuffer();
			const finalName = await findAvailableUploadName(profile, folderPath, file.name);
			const meta = await uploadFile(profile, folderPath, finalName, buffer, file.type);
			const rawLink = `${profile.serverUrl}/index.php/f/${meta.fileId}`;
			blocks.push("```nextcloud-file\n" + rawLink + "\n```");
		} catch (e) {
			new Notice(t("attachment.uploadFailed", { filename: file.name, message: errorMessage(e) }));
		} finally {
			notice.hide();
		}
	}

	if (blocks.length > 0) {
		editor.replaceSelection(blocks.join("\n") + "\n");
	}
}
