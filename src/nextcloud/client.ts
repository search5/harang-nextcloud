import { requestUrl } from "obsidian";
import { NextcloudFileMeta, NextcloudProfile } from "../types";
import { t } from "../i18n";

const DAV_NS = "DAV:";
const OC_NS = "http://owncloud.org/ns";
// Year 2000 — well before Nextcloud existed, so anything at/before the epoch is clearly a placeholder value.
const MIN_PLAUSIBLE_DATE_MS = Date.UTC(2000, 0, 1);

export class NextcloudAuthError extends Error {}
export class NextcloudNotFoundError extends Error {}

function toBase64(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function authHeader(profile: NextcloudProfile): string {
	return "Basic " + toBase64(`${profile.loginName}:${profile.appPassword}`);
}

/** Builds the WebDAV URL for a path (must start with "/") relative to the user's files root. */
function davUrl(profile: NextcloudProfile, path: string): string {
	const encodedPath = path
		.split("/")
		.map((seg) => encodeURIComponent(seg))
		.join("/");
	return `${profile.serverUrl}/remote.php/dav/files/${encodeURIComponent(profile.loginName)}${encodedPath}`;
}

function buildSearchBody(loginName: string, fileId: string): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
	<d:basicsearch>
		<d:select>
			<d:prop>
				<d:displayname/>
				<oc:fileid/>
				<oc:size/>
				<d:getcontentlength/>
				<d:getlastmodified/>
				<d:creationdate/>
				<d:getcontenttype/>
				<d:resourcetype/>
			</d:prop>
		</d:select>
		<d:from>
			<d:scope>
				<d:href>/files/${escapeXml(loginName)}</d:href>
				<d:depth>infinity</d:depth>
			</d:scope>
		</d:from>
		<d:where>
			<d:eq>
				<d:prop><oc:fileid/></d:prop>
				<d:literal>${escapeXml(fileId)}</d:literal>
			</d:eq>
		</d:where>
	</d:basicsearch>
</d:searchrequest>`;
}

const PROPFIND_BODY = `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
	<d:prop>
		<d:displayname/>
		<oc:fileid/>
		<oc:size/>
		<d:getcontentlength/>
		<d:getlastmodified/>
		<d:creationdate/>
		<d:getcontenttype/>
		<d:resourcetype/>
	</d:prop>
</d:propfind>`;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function nsText(el: Element, ns: string, localName: string): string | null {
	const nodes = el.getElementsByTagNameNS(ns, localName);
	if (nodes.length === 0) return null;
	return nodes[0].textContent;
}

/** Parses a single <d:response> element (from SEARCH or PROPFIND) into file metadata. */
function parseResponseToMeta(response: Element, profile: NextcloudProfile): NextcloudFileMeta {
	const hrefRaw = nsText(response, DAV_NS, "href") ?? "";
	const href = decodeURIComponent(hrefRaw);
	const prop = response.getElementsByTagNameNS(DAV_NS, "prop")[0] ?? response;

	const isFolder = prop.getElementsByTagNameNS(DAV_NS, "collection").length > 0;

	const ocSize = nsText(prop, OC_NS, "size");
	const contentLength = nsText(prop, DAV_NS, "getcontentlength");
	const sizeStr = ocSize ?? contentLength;
	const size = sizeStr !== null ? Number(sizeStr) : null;

	const lastModifiedStr = nsText(prop, DAV_NS, "getlastmodified");
	const creationDateStr = nsText(prop, DAV_NS, "creationdate");

	let date: Date | null = null;
	let dateIsCreationDate = false;
	if (creationDateStr) {
		const parsed = new Date(creationDateStr);
		// Some Nextcloud versions return a placeholder/epoch value here instead of the
		// real creation time — treat anything implausibly old as "not actually known".
		if (!isNaN(parsed.getTime()) && parsed.getTime() >= MIN_PLAUSIBLE_DATE_MS) {
			date = parsed;
			dateIsCreationDate = true;
		}
	}
	if (!date && lastModifiedStr) {
		const parsed = new Date(lastModifiedStr);
		if (!isNaN(parsed.getTime())) {
			date = parsed;
			dateIsCreationDate = false;
		}
	}

	const pathPrefix = `/remote.php/dav/files/${profile.loginName}`;
	const path = href.startsWith(pathPrefix) ? href.slice(pathPrefix.length) || "/" : href;
	const cleanPath = path.replace(/\/+$/, "") || "/";
	const name = decodeURIComponent(cleanPath.split("/").filter(Boolean).pop() ?? cleanPath);

	return {
		path: cleanPath,
		name,
		isFolder,
		size: size !== null && !isNaN(size) ? size : null,
		date,
		dateIsCreationDate,
		contentType: nsText(prop, DAV_NS, "getcontenttype"),
		fileId: nsText(prop, OC_NS, "fileid") ?? "",
	};
}

/** Fetches file metadata for a Nextcloud fileid via WebDAV SEARCH. */
export async function fetchFileMeta(
	profile: NextcloudProfile,
	fileId: string
): Promise<NextcloudFileMeta> {
	const res = await requestUrl({
		url: `${profile.serverUrl}/remote.php/dav/`,
		method: "SEARCH",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			Authorization: authHeader(profile),
		},
		body: buildSearchBody(profile.loginName, fileId),
		throw: false,
	});

	if (res.status === 401 || res.status === 403) {
		throw new NextcloudAuthError(t("error.authFailed"));
	}
	if (res.status !== 207) {
		throw new Error(t("error.fetchFailed", { status: res.status }));
	}

	const xml = new DOMParser().parseFromString(res.text, "text/xml");
	const responses = xml.getElementsByTagNameNS(DAV_NS, "response");
	if (responses.length === 0) {
		throw new NextcloudNotFoundError(t("error.fileNotFound"));
	}

	return parseResponseToMeta(responses[0], profile);
}

/** Fetches file metadata for a known path via WebDAV PROPFIND (Depth: 0). */
export async function fetchFileMetaByPath(
	profile: NextcloudProfile,
	path: string
): Promise<NextcloudFileMeta> {
	const res = await requestUrl({
		url: davUrl(profile, path),
		method: "PROPFIND",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			Authorization: authHeader(profile),
			Depth: "0",
		},
		body: PROPFIND_BODY,
		throw: false,
	});

	if (res.status === 401 || res.status === 403) {
		throw new NextcloudAuthError(t("error.authFailed"));
	}
	if (res.status !== 207) {
		throw new NextcloudNotFoundError(t("error.metaNotFoundHttp", { status: res.status }));
	}

	const xml = new DOMParser().parseFromString(res.text, "text/xml");
	const responses = xml.getElementsByTagNameNS(DAV_NS, "response");
	if (responses.length === 0) {
		throw new NextcloudNotFoundError(t("error.metaNotFound"));
	}

	return parseResponseToMeta(responses[0], profile);
}

/** Returns true if a file or folder exists at the given path. */
export async function pathExists(profile: NextcloudProfile, path: string): Promise<boolean> {
	const res = await requestUrl({
		url: davUrl(profile, path),
		method: "PROPFIND",
		headers: {
			Authorization: authHeader(profile),
			Depth: "0",
		},
		throw: false,
	});
	if (res.status === 401 || res.status === 403) {
		throw new NextcloudAuthError(t("error.authFailed"));
	}
	return res.status === 207;
}

/** Creates the folder (and any missing parent folders) at the given path. Idempotent. */
export async function ensureFolder(profile: NextcloudProfile, folderPath: string): Promise<void> {
	const segments = folderPath.split("/").filter(Boolean);
	let current = "";
	for (const segment of segments) {
		current += `/${segment}`;
		const res = await requestUrl({
			url: davUrl(profile, current),
			method: "MKCOL",
			headers: { Authorization: authHeader(profile) },
			throw: false,
		});
		if (res.status === 401 || res.status === 403) {
			throw new NextcloudAuthError(t("error.authFailed"));
		}
		// 201 = created, 405 = already exists
		if (res.status !== 201 && res.status !== 405) {
			throw new Error(t("error.folderCreateFailed", { path: current, status: res.status }));
		}
	}
}

/** Finds a filename that doesn't collide with an existing file in folderPath, appending " (n)" if needed. */
export async function findAvailableUploadName(
	profile: NextcloudProfile,
	folderPath: string,
	desiredName: string
): Promise<string> {
	const dotIndex = desiredName.lastIndexOf(".");
	const hasExt = dotIndex > 0 && dotIndex < desiredName.length - 1;
	const base = hasExt ? desiredName.slice(0, dotIndex) : desiredName;
	const ext = hasExt ? desiredName.slice(dotIndex) : "";

	let candidate = desiredName;
	let counter = 1;
	while (await pathExists(profile, joinPath(folderPath, candidate))) {
		candidate = `${base} (${counter})${ext}`;
		counter++;
	}
	return candidate;
}

/** Uploads binary data to folderPath/filename and returns its resulting metadata. */
export async function uploadFile(
	profile: NextcloudProfile,
	folderPath: string,
	filename: string,
	data: ArrayBuffer,
	contentType?: string
): Promise<NextcloudFileMeta> {
	const path = joinPath(folderPath, filename);
	const res = await requestUrl({
		url: davUrl(profile, path),
		method: "PUT",
		headers: {
			Authorization: authHeader(profile),
			"Content-Type": contentType || "application/octet-stream",
		},
		body: data,
		throw: false,
	});

	if (res.status === 401 || res.status === 403) {
		throw new NextcloudAuthError(t("error.authFailed"));
	}
	if (res.status !== 201 && res.status !== 204) {
		throw new Error(t("error.uploadFailed", { filename, status: res.status }));
	}

	return fetchFileMetaByPath(profile, path);
}

function joinPath(folderPath: string, name: string): string {
	const cleanFolder = folderPath.replace(/\/+$/, "");
	return `${cleanFolder}/${name}`;
}

/**
 * Deletes the file/folder at the given path. On a standard Nextcloud instance this moves
 * it to the trashbin (recoverable for the server's retention period) rather than purging
 * it immediately. A missing file is treated as already deleted.
 */
export async function deleteFile(profile: NextcloudProfile, path: string): Promise<void> {
	const res = await requestUrl({
		url: davUrl(profile, path),
		method: "DELETE",
		headers: { Authorization: authHeader(profile) },
		throw: false,
	});

	if (res.status === 401 || res.status === 403) {
		throw new NextcloudAuthError(t("error.authFailed"));
	}
	if (res.status !== 204 && res.status !== 200 && res.status !== 404) {
		throw new Error(t("error.deleteFailed", { status: res.status }));
	}
}
