Troubleshooting & FAQ
======================

Connecting a profile fails or times out
-------------------------------------------------------------

**Symptom:** clicking **Log in to connect** shows a "Couldn't start login"
notice, or a "Login timed out" notice after opening the browser.

**Cause:** most commonly one of:

* The Server URL is wrong, unreachable, or missing the ``https://`` scheme.
* The server doesn't support Nextcloud's Login Flow v2 endpoint
  (``POST /index.php/login/v2``) — this should be present on any
  reasonably current Nextcloud instance.
* The login was never completed (or completed too late) in the browser
  tab that opened — the poll gives up after about 20 minutes.

**Fix:** double-check the Server URL, then retry **Log in to connect** (or
**Reconnect** for an existing profile) and complete the login in the
browser tab promptly.

A block shows "No Nextcloud profile matches this link"
-------------------------------------------------------------

**Symptom:** a pasted link renders as an error card with this message
instead of the file info card.

**Cause:** none of your connected profiles' server URLs match the link's
host. This happens most often right after pasting a link from a Nextcloud
account you haven't connected a profile for yet.

**Fix:** add a profile for that server (see :doc:`usage`), or reconnect
the existing profile if its server URL has changed, then reopen the note
so the block re-renders.

A block shows "Authentication failed"
-------------------------------------------------------------

**Symptom:** a block that used to render fine now shows "Authentication
failed. Reconnect this profile in settings."

**Cause:** the profile's stored app password was revoked or expired —
most often because it was removed from **Settings → Security → Devices &
sessions** on the Nextcloud server itself.

**Fix:** click **Reconnect** on that profile in **Settings → Harang
Nextcloud** and complete the login flow again.

Attachments don't upload when pasting files
-------------------------------------------------------------

**Symptom:** pasting a non-image file into a note does nothing, or shows
"There's no nc-folder property in the frontmatter."

**Cause:** the active note is missing the ``nc-folder`` frontmatter
property described in :doc:`usage`, or its value doesn't match any
registered profile name.

**Fix:** add ``nc-folder: <ProfileName>/<path>`` to the note's
frontmatter (or just ``nc-folder: <path>`` if you only have one profile),
then paste the file again.

.. note::

   Pasted **images** are intentionally left untouched — they still go
   through Obsidian's normal image-paste handling, not this upload path.

The plugin doesn't appear after installing
------------------------------------------------

**Fix:** confirm ``main.js``, ``manifest.json``, and ``styles.css`` are
directly inside ``<vault>/.obsidian/plugins/harang-nextcloud/`` (not a
subfolder), that the plugin is enabled under
**Settings → Community plugins**, and that Obsidian is on version 1.13.4
or later (see :doc:`prerequisites`). Fully restart Obsidian after
installing or updating the files.

The plugin doesn't update after ``git pull``
--------------------------------------------------

**Symptom:** you pulled the latest source changes, but Obsidian still
behaves like the old version.

**Cause:** installing from source requires an explicit rebuild and a
manual copy step — pulling new source alone does not update the files
Obsidian actually loads.

**Fix:** run the full update sequence from :doc:`installation`, Method 3:

.. code-block:: bash

   git pull
   npm install
   npm run build

Then copy the freshly built ``main.js`` (and ``manifest.json``/
``styles.css`` if they changed) into
``<vault>/.obsidian/plugins/harang-nextcloud/`` again, and restart
Obsidian.
