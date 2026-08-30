export class SearchBar {
  build() {
    return document.createRange().createContextualFragment(`
      <div class="search-bar-wrapper">
        <div class="search-input-container">
          <div class="search-input-inner">
            <svg class="icon icon-search" aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20">
              <path d="M8.875 2.625a6.25 6.25 0 1 0 3.955 11.09l3.983 3.982a.625.625 0 1 0 .884-.884l-3.983-3.982a6.25 6.25 0 0 0-4.84-10.205m-5 6.25a5 5 0 1 1 10 0 5 5 0 0 1-10 0"></path>
            </svg>
            <div class="input-field-wrapper">
              <input
                type="text"
                placeholder="Recherchez une ville…"
                on:input="#suggestion-component/suggest"
                role="combobox"
                aria-autocomplete="list"
                aria-controls=":rbr:"
                aria-expanded="false"
                aria-haspopup="listbox"
                aria-activedescendant=":rbs:"
                class="search-input"
              >
            </div>
          </div>
        </div>
      </div>
    `);
  }
}
