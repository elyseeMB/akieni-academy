export class LazyComponent {
  onMount() {
    throw new Error("Method 'onMount()' must be implemented.");
  }
  onUnmount() {}
}

/**
 * Register custom element lazily
 */
export function lazywc(tagName, cb) {
  customElements.define(
    tagName,
    class A extends HTMLElement {
      /**@type{LazyComponent} */
      innerElement = null;

      connectedCallback() {
        cb().then((module) => {
          this.innerElement = new module.default(this);
          this.innerElement.onMount();
        });
      }

      disconnectedCallback() {
        this.innerElement?.onUnmount();
      }
    },
  );
}
