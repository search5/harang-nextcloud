import { requestUrl } from "obsidian";
import { normalizeServerUrl } from "./link";
import { t } from "../i18n";

export interface LoginFlowInit {
	pollToken: string;
	pollEndpoint: string;
	loginUrl: string;
}

export interface LoginFlowResult {
	server: string;
	loginName: string;
	appPassword: string;
}

export class LoginFlowCancelledError extends Error {}
export class LoginFlowTimeoutError extends Error {}

/** Starts a Nextcloud Login Flow v2 handshake. Throws on network/HTTP error. */
export async function initiateLoginFlow(serverUrl: string): Promise<LoginFlowInit> {
	const base = normalizeServerUrl(serverUrl);
	const res = await requestUrl({
		url: `${base}/index.php/login/v2`,
		method: "POST",
		throw: false,
	});
	if (res.status !== 200) {
		throw new Error(t("login.startFailed", { status: res.status }));
	}
	const body = res.json as {
		poll?: { token?: string; endpoint?: string };
		login?: string;
	};
	if (!body.poll?.token || !body.poll?.endpoint || !body.login) {
		throw new Error(t("login.unexpectedInitResponse"));
	}
	return {
		pollToken: body.poll.token,
		pollEndpoint: body.poll.endpoint,
		loginUrl: body.login,
	};
}

/**
 * Polls the Login Flow v2 endpoint until the user finishes authenticating
 * in their browser, the token expires (~20 min), or `shouldCancel` returns true.
 */
export async function pollLoginFlow(
	init: LoginFlowInit,
	shouldCancel: () => boolean,
	intervalMs = 2000,
	timeoutMs = 20 * 60 * 1000
): Promise<LoginFlowResult> {
	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		if (shouldCancel()) {
			throw new LoginFlowCancelledError(t("login.cancelled"));
		}

		const res = await requestUrl({
			url: init.pollEndpoint,
			method: "POST",
			contentType: "application/x-www-form-urlencoded",
			body: `token=${encodeURIComponent(init.pollToken)}`,
			throw: false,
		});

		if (res.status === 200) {
			const body = res.json as { server?: string; loginName?: string; appPassword?: string };
			if (!body.server || !body.loginName || !body.appPassword) {
				throw new Error(t("login.unexpectedPollResponse"));
			}
			return {
				server: normalizeServerUrl(body.server),
				loginName: body.loginName,
				appPassword: body.appPassword,
			};
		}

		if (res.status !== 404) {
			throw new Error(t("login.pollError", { status: res.status }));
		}

		await sleep(intervalMs);
	}

	throw new LoginFlowTimeoutError(t("login.timeout"));
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}
