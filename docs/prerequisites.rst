Prerequisites
=============

Before using **harang-nextcloud**, make sure the following are in place.

1. A reachable Nextcloud server
---------------------------------

You need a Nextcloud instance reachable over HTTP(S) that supports the
standard `Login Flow v2 <https://docs.nextcloud.com/server/latest/developer_manual/client_apis/LoginFlow/index.html>`_
handshake (``POST /index.php/login/v2``) — this is built into Nextcloud
itself, so any reasonably current server works out of the box. The plugin
authenticates via an app password obtained through this flow; it never
asks for or stores your actual account password.

You will need:

.. list-table::
   :header-rows: 1

   * - Item
     - Notes
   * - Server URL
     - The base URL of your Nextcloud instance, e.g.
       ``https://cloud.example.com``.
   * - A way to finish login in a browser
     - The login flow opens your Nextcloud login page in your default
       browser; you approve the app connection there, and the credentials
       are sent back to Obsidian automatically.

2. Obsidian 1.12.7 or later
------------------------------

This is the plugin's declared minimum supported Obsidian version.

Once both are in place, continue to :doc:`installation`.
