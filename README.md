# harang-nextcloud

🌐 **English** | [한국어](README.ko.md)

📖 **[Documentation](https://search5.github.io/harang-nextcloud/)** (English / 한국어)

An [Obsidian](https://obsidian.md) plugin that turns pasted Nextcloud internal links into rich file blocks — showing file size, upload date, and a one-click shortcut to open the file in your browser — right inside your notes.

Paste a Nextcloud internal link (e.g. `https://cloud.example.com/f/12345`) into a note and it's replaced with a `nextcloud-file` code block rendered as a small card with the file's name, path, size, date, and an **Open in browser** button. You can also drop non-image files straight into a note with an `nc-folder` frontmatter property set, and they're uploaded to that Nextcloud folder automatically.

## Features

- **Paste-to-block** — paste a Nextcloud internal link and it's automatically replaced with a `nextcloud-file` code block, rendered as a card with the file's name, path, size, date, and an **Open in browser** button.
- **Login Flow v2 authentication** — connect a Nextcloud account by logging in through your browser; the plugin obtains an app password the same way the official Nextcloud clients do, and never asks for or stores your actual account password.
- **Multiple Nextcloud profiles** — connect any number of Nextcloud accounts, each identified by a profile name; a pasted link is matched to the right profile automatically.
- **Attachment upload via `nc-folder`** — set an `nc-folder: <ProfileName>/<path>` frontmatter property on a note, then paste non-image files directly into it to upload them to that Nextcloud folder and insert a file block for each.
- **Deletion tracking** — removing a `nextcloud-file` block from a note (by editing it out or deleting the note) prompts whether the underlying file should also be moved to the Nextcloud trash.
- **One-click open** — every rendered block has an **Open in browser** button that jumps straight to the file on your Nextcloud server.

## Prerequisites

- A Nextcloud instance reachable over HTTP(S) that supports the standard Login Flow v2 handshake (built into any reasonably current Nextcloud server).
- Obsidian 1.13.4 or later.

See the [Prerequisites](https://search5.github.io/harang-nextcloud/en/prerequisites.html) page for details.

## Installation

Open **Settings → Community plugins → Browse** in Obsidian, search for **"Harang Nextcloud"**, then click **Install** and **Enable**.

A manual install from pre-built files, or building from source, is also possible if you'd rather not use the Community Plugins browser — see the [Installation](https://search5.github.io/harang-nextcloud/en/installation.html) page for details.

## Usage

1. In **Settings → Harang Nextcloud**, add a profile (name, server URL) and click **Log in to connect** to complete the Login Flow v2 handshake in your browser.
2. Paste a Nextcloud internal link into a note — it's rendered as a file info block automatically.
3. Optionally, add `nc-folder: ProfileName/path` to a note's frontmatter to enable pasting attachments directly into that note.

See the [Usage](https://search5.github.io/harang-nextcloud/en/usage.html) guide for the full walkthrough, including deletion tracking and the manual convert-selection command.

## Known limitations

- Only the parts of the Nextcloud/WebDAV API needed for this workflow are implemented — the plugin is not a general-purpose Nextcloud file browser or sync client.
- Deletion tracking only applies to notes Obsidian has actually seen open or modified during the current session; edits made while Obsidian wasn't watching a note aren't detected.

## License

MIT — see [LICENSE](LICENSE).
