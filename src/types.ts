export interface NextcloudProfile {
	id: string;
	name: string;
	/** Normalized, no trailing slash, includes protocol (e.g. https://cloud.example.com) */
	serverUrl: string;
	loginName: string;
	appPassword: string;
}

export interface HarangNextcloudSettings {
	profiles: NextcloudProfile[];
}

export const DEFAULT_SETTINGS: HarangNextcloudSettings = {
	profiles: [],
};

export interface NextcloudFileMeta {
	/** Path relative to the user's files root, e.g. /Documents/report.pdf */
	path: string;
	name: string;
	isFolder: boolean;
	/** Size in bytes, if known */
	size: number | null;
	/** Best-effort "registered" date (creationdate if available, else last modified) */
	date: Date | null;
	dateIsCreationDate: boolean;
	contentType: string | null;
	/** Nextcloud numeric file id, used to build internal links (may be empty if unavailable) */
	fileId: string;
}
