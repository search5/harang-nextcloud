Usage
=====

Connecting a Nextcloud server profile
------------------------------------------

1. Open **Settings → Harang Nextcloud**.
2. Under **Add new profile**, fill in:

.. list-table::
   :header-rows: 1

   * - Field
     - Description
   * - Profile name
     - A label for this account, e.g. ``Work`` or ``Personal``. Used to
       tell multiple Nextcloud accounts apart, and as the folder-picking
       prefix described below.
   * - Server URL
     - The base URL of your Nextcloud instance, e.g.
       ``https://cloud.example.com``.

3. Click **Log in to connect**. Your browser opens the Nextcloud login
   page; sign in and approve the connection there.
4. Back in Obsidian, once the login flow completes you'll see a
   **Nextcloud connection complete** notice, and the profile appears in
   the list with its server URL and account name.

You can add as many profiles as you have Nextcloud accounts. Each profile
row also has **Reconnect** (re-runs the login flow if the app password
stops working) and a delete button.

.. note::

   The plugin never asks for or stores your Nextcloud account password
   directly — it obtains an app password through Nextcloud's own Login
   Flow v2 handshake, the same mechanism used by the official desktop and
   mobile Nextcloud clients.

Pasting a Nextcloud link
------------------------------

Copy an internal link from Nextcloud's web UI (**Details → Copy internal
link**, or the "Copy internal link" action on a file) — it looks like:

.. code-block:: text

   https://cloud.example.com/f/12345

Paste it into a note. The plugin recognizes the link, replaces it with:

.. code-block:: text

   ```nextcloud-file
   https://cloud.example.com/f/12345
   ```

and renders that code block as a card showing:

* A 📁/📄 icon for folders vs. files.
* The file's name and full path.
* Its size and date (labeled **Created** or **Modified**, whichever the
  server actually reports — see :doc:`architecture`), plus the profile
  name it resolved against.
* An **Open in browser** button that opens the original internal link.

If no connected profile's server matches the link, the block shows an
error instead ("No Nextcloud profile matches this link. Add one in
settings.") — add or reconnect the matching profile and re-render the
note to fix it.

You can also select existing text and run **Convert selected Nextcloud
internal link to a file block** from the command palette to turn it into
the same block, instead of pasting.

Uploading attachments straight into a note
------------------------------------------------

Add an ``nc-folder`` frontmatter property to a note to make it an upload
target:

.. code-block:: yaml

   ---
   nc-folder: Work/Projects/Notes
   ---

The value is ``<profileName>/<path>`` — the path is relative to that
profile's Nextcloud files root, and is created automatically if it doesn't
exist yet. If you only have one profile registered, you can omit the
profile name and just give the path.

With that property set, pasting one or more non-image files (images still
paste as normal Obsidian attachments) uploads each file to that folder and
inserts a ``nextcloud-file`` block for it — the same block you'd get from
pasting an internal link. If a file with the same name already exists in
the target folder, an available name is chosen automatically (``report
(1).pdf``, ``report (2).pdf``, ...).

Removing an attachment link
---------------------------------

If you delete a ``nextcloud-file`` block from a note (or delete the note
itself) while Obsidian is open, the plugin asks whether the underlying
file should also be moved to the Nextcloud trash, or kept as-is. This only
applies to notes Obsidian has actually seen open or modified during the
current session — see :doc:`architecture` for the exact tracking behavior.
