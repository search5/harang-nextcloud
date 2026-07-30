Architecture
============

Source layout
--------------

All of the plugin's logic lives under ``src/``:

.. list-table::
   :header-rows: 1
   :widths: 35 65

   * - File
     - Responsibility
   * - ``main.ts``
     - Plugin entry point: loads settings, wires up the settings tab, the
       code block processor, paste handler, attachment upload handler, and
       link tracker; adds the **Convert selected Nextcloud internal link
       to a file block** command.
   * - ``types.ts``
     - Shared types: ``NextcloudProfile``, ``HarangNextcloudSettings``,
       ``NextcloudFileMeta``.
   * - ``settings.ts``
     - The settings tab: profile list, the "Add new profile" form, and
       the Login Flow v2 handshake (start / poll / cancel) for both new
       and reconnected profiles.
   * - ``i18n/``
     - Looks up the current Obsidian UI language via the official
       ``getLanguage()`` API and returns matching strings from ``en.ts``/
       ``ko.ts`` (falling back to English). ``t(key, params)`` does
       ``{placeholder}`` substitution for messages that embed values like
       an HTTP status or filename.
   * - ``nextcloud/loginFlow.ts``
     - Implements Nextcloud's `Login Flow v2
       <https://docs.nextcloud.com/server/latest/developer_manual/client_apis/LoginFlow/index.html>`_:
       ``initiateLoginFlow`` starts the handshake and returns a browser
       login URL, ``pollLoginFlow`` polls until the user finishes
       authenticating (or the ~20 minute token expires, or the user
       cancels) and returns the resulting server URL, login name, and app
       password.
   * - ``nextcloud/link.ts``
     - ``parseInternalLink`` recognizes Nextcloud internal link URLs
       (``.../f/<fileid>``, with or without ``index.php``) and extracts
       the base URL and file id. ``findProfileForLink`` matches a parsed
       link back to a configured profile (exact server URL match, falling
       back to a host-only comparison). ``resolveUploadTarget`` parses an
       ``nc-folder`` frontmatter value (``ProfileName/path``, or just
       ``path`` when exactly one profile is registered) into a profile
       and destination folder.
   * - ``nextcloud/client.ts``
     - A WebDAV client for the parts of the Nextcloud API the plugin
       needs, all over Obsidian's ``requestUrl``: ``fetchFileMeta``
       (WebDAV ``SEARCH`` by ``oc:fileid``, since an internal link only
       carries the numeric file id, not a path), ``fetchFileMetaByPath``
       (``PROPFIND``), ``ensureFolder`` (``MKCOL``, idempotent, creates
       missing parent folders), ``findAvailableUploadName`` (checks for
       name collisions before an upload), ``uploadFile`` (``PUT``), and
       ``deleteFile`` (``DELETE``, which Nextcloud treats as "move to
       trash" rather than a permanent delete).
   * - ``block-view.ts``
     - Registers the ``nextcloud-file`` code block processor. Parses the
       block's link, resolves its profile, fetches (and caches for 60s)
       the file's metadata, and renders the info card described in
       :doc:`usage` — or an error card with a **Retry** button on
       failure.
   * - ``paste-handler.ts``
     - Listens for the editor's paste event; when the pasted plain text
       is a recognized Nextcloud internal link, replaces it with a
       ``nextcloud-file`` code block instead of the raw URL.
   * - ``attachment-upload.ts``
     - Listens for the same paste event for pasted **files**. Skips
       images (so Obsidian's normal image-paste behavior is untouched),
       requires the active note to have an ``nc-folder`` frontmatter
       property, then uploads each non-image file to that folder and
       inserts a ``nextcloud-file`` block per uploaded file.
   * - ``link-tracker.ts``
     - Tracks each open markdown note's set of ``nextcloud-file`` blocks
       as a baseline. When a note is edited or deleted and a block that
       was previously there is now gone, prompts (via
       ``confirm-delete-modal.ts``) whether the underlying Nextcloud file
       should be moved to the trash too.
   * - ``confirm-delete-modal.ts``
     - The confirmation modal shown by the link tracker: **Keep on
       Nextcloud** or **Move to trash**. Closing it without an explicit
       choice (Esc / outside click) defaults to the non-destructive
       "keep" option.
   * - ``util.ts``
     - ``errorMessage``: normalizes a caught value (``Error`` or not) to a
       display string.

Data flow
----------

.. code-block:: text

   settings.ts               -->  NextcloudProfile[] (server URL, login name, app password)
        |                         via nextcloud/loginFlow.ts (Login Flow v2)
        v
   nextcloud/link.ts          -->  parses a pasted URL / nc-folder value
        |
        v
   nextcloud/client.ts          -->  SEARCH/PROPFIND/MKCOL/PUT/DELETE over requestUrl
        |
        +--> paste-handler.ts        -->  URL paste  --> ```nextcloud-file``` block
        |
        +--> attachment-upload.ts    -->  file paste  --> upload, then ```nextcloud-file``` block
        |
        +--> block-view.ts           -->  renders the block: icon, name, path, size, date, Open-in-browser
        |
        +--> link-tracker.ts         -->  block removed from a note --> confirm-delete-modal.ts
                                          --> optional deleteFile (moves to Nextcloud trash)

Reference syntax
------------------

A resolved reference is stored as a fenced code block:

.. code-block:: text

   ```nextcloud-file
   https://cloud.example.com/f/12345
   ```

The block's content is the original Nextcloud internal link, unmodified —
there is no separate ID scheme to keep in sync. Re-resolving a block only
needs ``findProfileForLink`` (matching the link's host against a
profile's server URL) and the file id already embedded in the link, so a
block keeps rendering correctly even if the file is renamed or moved on
the server, and continues to work if a profile is deleted and re-added
under the same server URL.

Only the numeric Nextcloud file id is stored, not a path — this is why
metadata lookup uses WebDAV ``SEARCH`` (``fetchFileMeta``) rather than a
plain ``PROPFIND`` on a path: the plugin has to ask the server "what file
has this id" rather than "what's at this path," since the path isn't
known until the server answers.

Date field: "Created" vs. "Modified"
------------------------------------------

The rendered card labels its date either **Created** or **Modified**.
``fetchFileMeta``/``fetchFileMetaByPath`` prefer WebDAV's
``creationdate`` property, but some Nextcloud/storage backends return a
placeholder value there (e.g. the Unix epoch) instead of leaving it
absent. Any ``creationdate`` at or before the year 2000 — well before
Nextcloud existed — is treated as "not actually known," and the card
falls back to ``getlastmodified`` labeled **Modified** instead.

No runtime dependencies
---------------------------

Beyond what Obsidian itself provides (the ``obsidian`` package), the
plugin has no runtime dependencies — the WebDAV client, login flow, and
internal-link parsing are all hand-written rather than pulled in from
npm, keeping the bundle small and avoiding exposure to a third-party HTTP
library's own vulnerabilities.
