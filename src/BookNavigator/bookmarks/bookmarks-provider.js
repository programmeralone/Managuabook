import { html } from 'lit-element';
import '../delete-modal-actions.js';
import './bookmark-button.js';
import './ia-bookmarks.js';

import './bookmark-edit.js';
import './bookmarks-list.js';
import { IAIconBookmark } from '@internetarchive/icon-bookmark';

customElements.define('icon-bookmark', IAIconBookmark);

export default class BookmarksProvider {
  constructor(options) {
    const { bookreader, modal } = options;
    this.modal = options.modal;
    const boundOptions = Object.assign(this, options, {loginClicked: this.bookmarksLoginClicked});
    this.component = document.createElement('ia-bookmarks');
    this.component.bookreader = bookreader;
    this.component.options = boundOptions;
    this.component.displayMode = this.component.options.displayMode;
    this.component.modal = modal;

    this.bindEvents();

    this.icon = html`<icon-bookmark state="hollow" style="--iconWidth: 16px; --iconHeight: 24px;"></icon-bookmark>`;
    this.label = 'Bookmarks';
    this.id = 'bookmarks';
    this.component.setup();
    this.updateMenu(this.component.bookmarks.length);
  }

  updateMenu(count) {
    this.menuDetails = `(${count})`;
  }

  bindEvents() {
    this.component.addEventListener('bookmarksChanged', this.bookmarksChanged.bind(this));
  }

  bookmarksChanged({ detail }) {
    const bookmarksLength = Object.keys(detail.bookmarks).length;
    this.updateMenu(bookmarksLength);
    this.onBookmarksChanged(detail.bookmarks, detail.showSidePanel);
  }

  bookmarksLoginClicked() {
    if (window.archive_analytics) {
      window.archive_analytics?.send_event_no_sampling(
        'BookReader',
        `BookmarksLogin`,
        window.location.path,
      );
    }
  }
}
