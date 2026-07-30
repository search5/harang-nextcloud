export const en = {
	// Settings tab
	"settings.heading": "Nextcloud profiles",
	"settings.description":
		"Log in to a Nextcloud server to register a profile. Pasted internal links will then automatically render as file info blocks.",
	"settings.noProfiles": "No profiles registered yet. Add one below.",
	"settings.addProfileHeading": "Add new profile",
	"settings.profileNameLabel": "Profile name",
	"settings.profileNameDesc": "Used to tell multiple Nextcloud accounts apart.",
	"settings.profileNamePlaceholder": "e.g. Work, Personal",
	"settings.serverUrlLabel": "Server URL",
	"settings.serverUrlDesc": "e.g. https://cloud.example.com",
	"settings.cancelConnect": "Cancel connecting",
	"settings.connectButton": "Log in to connect",
	"settings.reconnectButton": "Reconnect",
	"settings.deleteProfileTooltip": "Delete profile",
	"settings.errNameRequired": "Please enter a profile name.",
	"settings.errNameTaken": "That profile name is already in use.",
	"settings.errInvalidUrl": "Please enter a valid server URL (starting with http:// or https://).",
	"settings.noticeCompleteLogin": "Please finish logging in to Nextcloud in your browser.",
	"settings.noticeConnected": "Nextcloud connection complete.",
	"settings.noticeCancelled": "Connection cancelled.",
	"settings.noticeTimeout": "Login timed out. Please try again.",
	"settings.noticeConnectFailed": "Connection failed: {message}",

	// Code block renderer
	"block.unrecognizedLink": "This isn't a recognizable Nextcloud internal link.",
	"block.noProfile": "No Nextcloud profile matches this link. Add one in settings.",
	"block.loading": "Loading...",
	"block.dateCreated": "Created",
	"block.dateModified": "Modified",
	"block.openInBrowser": "Open in browser",
	"block.retry": "Retry",

	// Nextcloud client errors
	"error.authFailed": "Authentication failed. Reconnect this profile in settings.",
	"error.fileNotFound": "File not found. It may have been deleted, or you may not have access.",
	"error.fetchFailed": "Error while querying Nextcloud (HTTP {status}).",
	"error.metaNotFound": "Couldn't retrieve file info.",
	"error.metaNotFoundHttp": "Couldn't retrieve file info (HTTP {status}).",
	"error.folderCreateFailed": "Couldn't create folder: {path} (HTTP {status})",
	"error.uploadFailed": "Upload failed: {filename} (HTTP {status})",
	"error.deleteFailed": "Couldn't delete on Nextcloud (HTTP {status}).",

	// Login flow
	"login.startFailed": "Couldn't start login (HTTP {status}). Check the server address.",
	"login.unexpectedInitResponse": "Unexpected response from the server. Check the Nextcloud server address.",
	"login.cancelled": "Login was cancelled.",
	"login.unexpectedPollResponse": "Unexpected login response from the server.",
	"login.pollError": "Error while checking login status (HTTP {status}).",
	"login.timeout": "Login timed out. Please try again.",

	// Profile / folder resolution
	"link.noProfiles": "No Nextcloud profiles are registered. Add one in settings.",
	"link.specifyProfile":
		'Prefix the nc-folder value with a profile name (e.g. "{example}"). Registered profiles: {profiles}',

	// Paste handler (link)
	"paste.noProfile":
		"No profile is registered for this Nextcloud server. Add one in settings to auto-display file info.",

	// Attachment upload
	"attachment.noActiveFile": "Can't determine the current file, so the attachment can't be uploaded.",
	"attachment.ncFolderMissing":
		"There's no nc-folder property in the frontmatter, so attachments can't be pasted here. Example: nc-folder: ProfileName/path",
	"attachment.folderPrepFailed": "Couldn't prepare the folder: {message}",
	"attachment.uploading": "Uploading {filename}...",
	"attachment.uploadFailed": "Failed to upload {filename}: {message}",

	// Deletion tracking / modal
	"delete.movedToTrash": "Moved {filename} to the Nextcloud trash.",
	"delete.moveFailed": "Couldn't move to the Nextcloud trash: {message}",
	"delete.modalTitle": "Delete Nextcloud attachment",
	"delete.modalBody":
		"The attachment link below was removed from the note. Move it to the Nextcloud trash too?",
	"delete.modalRetention":
		"Files moved to the trash can be restored there for Nextcloud's retention period (30 days by default).",
	"delete.keepButton": "Keep on Nextcloud",
	"delete.moveButton": "Move to trash",

	// Commands
	"command.convertSelection": "Convert selected Nextcloud internal link to a file block",
	"command.noticeInvalidSelection": "The selected text isn't a Nextcloud internal link.",
};

export type TranslationKey = keyof typeof en;
