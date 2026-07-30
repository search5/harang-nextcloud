import { NextcloudProfile } from "../types";
import { t } from "../i18n";

export interface ParsedInternalLink {
	/** The scheme+host(+optional subpath) portion before "/f/{fileid}" */
	baseUrl: string;
	fileId: string;
	raw: string;
}

// Matches Nextcloud "internal link" URLs, e.g.:
//   https://cloud.example.com/f/12345
//   https://cloud.example.com/index.php/f/12345?openfile=true
const INTERNAL_LINK_RE = /^(https?:\/\/[^\s?#]+?)\/(?:index\.php\/)?f\/(\d+)(?:[?#][^\s]*)?$/i;

export function parseInternalLink(text: string): ParsedInternalLink | null {
	const trimmed = text.trim();
	const match = INTERNAL_LINK_RE.exec(trimmed);
	if (!match) return null;
	return {
		baseUrl: normalizeServerUrl(match[1]),
		fileId: match[2],
		raw: trimmed,
	};
}

export function normalizeServerUrl(url: string): string {
	return url.trim().replace(/\/+$/, "");
}

/**
 * Finds the profile whose serverUrl matches the link's base URL.
 * Falls back to a host-only comparison in case one side includes
 * an "/index.php" or sub-path segment the other doesn't.
 */
export function findProfileForLink(
	profiles: NextcloudProfile[],
	link: ParsedInternalLink
): NextcloudProfile | null {
	const exact = profiles.find((p) => normalizeServerUrl(p.serverUrl) === link.baseUrl);
	if (exact) return exact;

	try {
		const linkHost = new URL(link.baseUrl).host;
		const byHost = profiles.find((p) => {
			try {
				return new URL(p.serverUrl).host === linkHost;
			} catch {
				return false;
			}
		});
		if (byHost) return byHost;
	} catch {
		// ignore malformed URL
	}
	return null;
}

export interface UploadTarget {
	profile: NextcloudProfile;
	/** Normalized folder path, starting with "/", no trailing slash (except root "/"). */
	folderPath: string;
}

export interface UploadTargetError {
	error: string;
}

/**
 * Resolves an `nc-folder` frontmatter value into a profile + destination path.
 * Format: "ProfileName/some/path" — the profile name may be omitted only when
 * exactly one profile is registered, in which case the whole value is the path.
 */
export function resolveUploadTarget(
	ncFolder: string,
	profiles: NextcloudProfile[]
): UploadTarget | UploadTargetError {
	if (profiles.length === 0) {
		return { error: t("link.noProfiles") };
	}

	const trimmed = ncFolder.trim().replace(/^\/+/, "");
	const segments = trimmed.split("/").filter(Boolean);
	const firstSegment = segments[0] ?? "";
	const matchedProfile = profiles.find((p) => p.name === firstSegment);

	if (matchedProfile) {
		return {
			profile: matchedProfile,
			folderPath: normalizeFolderPath(segments.slice(1).join("/")),
		};
	}

	if (profiles.length === 1) {
		return { profile: profiles[0], folderPath: normalizeFolderPath(trimmed) };
	}

	return {
		error: t("link.specifyProfile", {
			example: `${profiles[0].name}/${trimmed}`,
			profiles: profiles.map((p) => p.name).join(", "),
		}),
	};
}

function normalizeFolderPath(path: string): string {
	const cleaned = path.replace(/^\/+|\/+$/g, "");
	return cleaned ? `/${cleaned}` : "/";
}
