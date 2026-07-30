harang-nextcloud documentation
================================

An `Obsidian <https://obsidian.md>`_ plugin that turns pasted Nextcloud
internal links into rich file blocks — showing file size, upload date, and
a one-click shortcut to open the file in your browser — right inside your
notes.

Paste a Nextcloud internal link (e.g. ``https://cloud.example.com/f/12345``)
into a note and it is replaced with a ``nextcloud-file`` code block that
renders as a small card with the file's name, path, size, date, and an
**Open in browser** button. You can also drop non-image files straight into
a note with a ``nc-folder`` frontmatter property set, and they are uploaded
to that Nextcloud folder automatically.

.. toctree::
   :maxdepth: 2
   :caption: Contents

   prerequisites
   installation
   usage
   architecture
   troubleshooting

Indices and tables
===================

* :ref:`genindex`
* :ref:`search`
