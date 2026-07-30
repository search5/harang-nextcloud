/**
 * Nextcloud app passwords are kept out of data.json (which syncs in plain
 * text via whatever the vault's sync method is) and stored instead through
 * Obsidian's SecretStorage (app.secretStorage, since 1.11.4). See
 * main.ts's loadSettings/saveSettings for where this is read/written.
 */
export function nextcloudAppPasswordSecretId(profileId: string): string {
	return `harang-nextcloud-app-password-${profileId}`;
}
