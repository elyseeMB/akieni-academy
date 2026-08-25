import { DialogComponent } from "./dialog-component.js";

export class SearchComponent extends DialogComponent {
  connectedCallback() {
    super.connectedCallback();
    this.#build();
  }

  disconnectedCallback() {}

  #build() {
    /** @type {{ dialog: HTMLDialogElement }} */
    const { dialog } = this.refs;
    if (dialog.open) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "dialog-search__wrapper");

    const container = document.createElement("div");
    container.setAttribute("class", "dialog-search__container");

    wrapper.appendChild(container);
    const gridWrapper = document.createElement("div");
    gridWrapper.setAttribute("class", "dialog-search__grid");
    container.appendChild(gridWrapper);

    /** search block */
    gridWrapper.appendChild(this.#buildSearchSection());
    /** suggestion block  */
    gridWrapper.appendChild(this.#suggestionBar());
    /** List block  */
    gridWrapper.appendChild(this.#listGroup());

    dialog.appendChild(wrapper);
  }

  #buildSearchSection() {
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
          placeholder="Recherchez ou posez une question dans Notion de lytoø…" 
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

  #suggestionBar() {
    document.addEventListener("dialog:open", async (e) => {
      const data = await fetch(
        "https://movies-api.mboussaemmanuelito.workers.dev/api/genres",
      );

      console.log(await data.json());
    });
    return document.createRange().createContextualFragment(`
      <div class="filter-bar-wrapper">
        <div class="filter-bar-container">
          <div class="filter-scroller horizontal">
            <div class="filter-group">
          
              <!-- Filtre 1 : Titres uniquement -->

              <div class="filter-item-wrapper">
                <div class="filter-pill-container">
                  <div role="button" tabindex="0" class="filter-pill">
                    <svg class="icon icon-text" aria-hidden="true" role="graphics-symbol" viewBox="1.72 0 16.56 20">
                      <path fill-rule="evenodd" d="m8.793 12.35 1.124 3.042a.625.625 0 1 0 1.172-.434L7.352 4.846a.988.988 0 0 0-1.854 0L1.76 14.958a.625.625 0 0 0 1.172.434l1.124-3.042zM8.33 11.1 6.425 5.943 4.519 11.1zm9.323-2.381c.345 0 .625.28.625.625v5.83a.625.625 0 1 1-1.25 0v-.204a3.26 3.26 0 0 1-2.21.83c-.903 0-1.742-.342-2.353-.98s-.961-1.537-.961-2.592.35-1.943.968-2.567c.615-.623 1.453-.942 2.346-.942.824 0 1.606.272 2.21.802v-.177c0-.345.28-.625.625-.625m-4.9 3.51c0-.774.252-1.33.608-1.69.358-.362.864-.57 1.457-.57s1.107.209 1.472.573c.361.361.616.917.616 1.686 0 1.503-.966 2.322-2.088 2.322-.582 0-1.088-.217-1.45-.595-.362-.377-.614-.952-.614-1.727" clip-rule="evenodd"></path>
                    </svg>
                    <span class="filter-label">Titres uniquement</span>
                  </div>
                </div>
              </div>

              <!-- Filtre 2 : Créée par -->
              <div class="filter-item-wrapper">
                <div class="filter-pill-container">
                  <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="listbox" class="filter-pill">
                    <svg class="icon icon-person" aria-hidden="true" role="graphics-symbol" viewBox="3.68 0 12.64 20">
                      <path d="M10 2.375c-1.137 0-2.054.47-2.674 1.242-.608.757-.9 1.765-.9 2.824s.292 2.066.9 2.824c.62.772 1.537 1.241 2.674 1.241s2.055-.469 2.675-1.241c.608-.758.9-1.766.9-2.824 0-1.059-.292-2.067-.9-2.824-.62-.773-1.538-1.242-2.675-1.242M7.676 6.441c0-.842.233-1.554.624-2.042.38-.473.937-.774 1.7-.774s1.32.301 1.7.774c.391.488.624 1.2.624 2.042s-.233 1.554-.624 2.041c-.38.473-.937.774-1.7.774s-1.32-.3-1.7-.774c-.391-.487-.624-1.2-.624-2.041M10 11.63c-2.7 0-5.101 1.315-6.12 3.305-.361.706-.199 1.421.23 1.923.412.48 1.06.767 1.74.767h8.3c.68 0 1.328-.287 1.74-.767.429-.502.591-1.217.23-1.923-1.02-1.99-3.42-3.305-6.12-3.305m-5.007 3.875c.761-1.488 2.672-2.626 5.007-2.626s4.246 1.138 5.007 2.626c.105.204.07.378-.067.54-.156.182-.448.33-.79.33h-8.3c-.342 0-.634-.148-.79-.33-.138-.162-.172-.336-.067-.54"></path>
                    </svg>
                    <span class="filter-label">Créée par</span>
                    <svg class="icon icon-chevron" aria-hidden="true" role="graphics-symbol" viewBox="3.06 0 9.88 16">
                      <path d="m12.76 6.52-4.32 4.32a.62.62 0 0 1-.44.18.62.62 0 0 1-.44-.18L3.24 6.52a.63.63 0 0 1 0-.88c.24-.24.64-.24.88 0L8 9.52l3.88-3.88c.24-.24.64-.24.88 0s.24.64 0 .88"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Filtre 3 : Dans -->
              <div class="filter-item-wrapper">
                <div class="filter-pill-container">
                  <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="listbox" class="filter-pill">
                    <svg class="icon icon-page" aria-hidden="true" role="graphics-symbol" viewBox="4.12 0 11.75 20">
                      <path d="M6.25 2.375A2.125 2.125 0 0 0 4.125 4.5v11c0 1.174.951 2.125 2.125 2.125h7.5a2.125 2.125 0 0 0 2.125-2.125V8.121c0-.563-.224-1.104-.622-1.502L11.63 2.997a2.13 2.13 0 0 0-1.502-.622zM5.375 4.5c0-.483.392-.875.875-.875h3.7V6.25A2.05 2.05 0 0 0 12 8.3h2.625v7.2a.875.875 0 0 1-.875.875h-7.5a.875.875 0 0 1-.875-.875zm8.691 2.7H12a.95.95 0 0 1-.95-.95V4.184z"></path>
                    </svg>
                    <span class="filter-label">Dans</span>
                    <svg class="icon icon-chevron" aria-hidden="true" role="graphics-symbol" viewBox="3.06 0 9.88 16">
                      <path d="m12.76 6.52-4.32 4.32a.62.62 0 0 1-.44.18.62.62 0 0 1-.44-.18L3.24 6.52a.63.63 0 0 1 0-.88c.24-.24.64-.24.88 0L8 9.52l3.88-3.88c.24-.24.64-.24.88 0s.24.64 0 .88"></path>
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            <!-- Bouton Ajouter un filtre -->
            <div class="filter-add-action" data-popup-origin="true">
              <button type="button" aria-expanded="false" aria-haspopup="dialog" class="btn-add-filter">
                <svg class="icon icon-plus" aria-hidden="true" role="graphics-symbol" viewBox="2.74 0 10.52 16">
                  <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74"></path>
                </svg>
                Filtrer
              </button>
            </div>

          </div>
        </div>
      </div>
    `);
  }

  #listGroup() {
    return document.createRange().createContextualFragment(`
      <div class="notion-list-wrapper">
        <div class="notion-list-container">

          <!-- Section -->
          <div class="notion-section">
            <div class="notion-section-title">Plus anciennes</div>
            <a href="https://app.notion.com/p/3a95715baaf480cbb067f0334763bdd5?pvs=26&qid=1:e9f9e6b3-2a2e-416a-9461-8e02230f9d63:0" class="notion-item-link">
              <div class="notion-item notion-item-active">
                <svg class="notion-icon" viewBox="4.12 2.37 11.75 15.25" aria-hidden="true">
                  <path d="M6.25 2.375A2.125 2.125 0 0 0 4.125 4.5v11c0 1.174.951 2.125 2.125 2.125h7.5a2.125 2.125 0 0 0 2.125-2.125V8.121c0-.563-.224-1.104-.622-1.502L11.63 2.997a2.13 2.13 0 0 0-1.502-.622zM5.375 4.5c0-.483.392-.875.875-.875h3.7V6.25A2.05 2.05 0 0 0 12 8.3h2.625v7.2a.875.875 0 0 1-.875.875h-7.5a.875.875 0 0 1-.875-.875zm8.691 2.7H12a.95.95 0 0 1-.95-.95V4.184z"></path>
                </svg>
                <span class="notion-item-title">Nouvelle page</span>
              </div>
            </a>

            <a href="https://app.notion.com/p/Remove-duplicates-from-sorted-array-e4f5715baaf483dd9444813bcbceb048?pvs=26&qid=1:e9f9e6b3-2a2e-416a-9461-8e02230f9d63:0" class="notion-item-link">
              <div class="notion-item">
                <svg class="notion-icon" viewBox="4.12 2.37 11.75 15.25" aria-hidden="true">
                  <path d="M13.3 14.25a.55.55 0 0 1-.55.55h-5.5a.55.55 0 1 1 0-1.1h5.5a.55.55 0 0 1 .55.55m-.55-1.95a.55.55 0 1 0 0-1.1h-5.5a.55.55 0 0 0 0 1.1z"></path>
                  <path d="M6.25 2.375A2.125 2.125 0 0 0 4.125 4.5v11c0 1.174.951 2.125 2.125 2.125h7.5a2.125 2.125 0 0 0 2.125-2.125V8.121c0-.563-.224-1.104-.622-1.502L11.63 2.997a2.13 2.13 0 0 0-1.502-.622zM5.375 4.5c0-.483.392-.875.875-.875h3.7V6.25A2.05 2.05 0 0 0 12 8.3h2.625v7.2a.875.875 0 0 1-.875.875h-7.5a.875.875 0 0 1-.875-.875zm8.691 2.7H12a.95.95 0 0 1-.95-.95V4.184z"></path>
                </svg>
                <span class="notion-item-title">Remove duplicates from sorted array</span>
                <span class="notion-item-separator">—</span>
                <span class="notion-item-subtitle">Leetcode Notion</span>
              </div>
            </a>
          </div>

        </div>
      </div>
    `);
  }

  open() {
    this.showDialog();
  }

  close() {
    this.closeDialog();
  }
}
