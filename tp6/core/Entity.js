/**
 * @template Props
 */
export class Entity {
  /** @type {Props} */
  props;

  /**
   * @param {Props} props
   */
  constructor(props) {
    this.props = Object.freeze({ ...props });
  }

  /** @returns {Props["id"]} */
  getIdentifier() {
    return this.props.id;
  }

  /**
   * @param {Entity<Props>} entity
   * @returns {boolean}
   */
  equals(entity) {
    if (this === entity) {
      return true;
    }
    if (!entity) {
      return false;
    }
    return this.getIdentifier() === entity.getIdentifier();
  }
}
