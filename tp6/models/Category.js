import { Entity } from "../core/Entity.js";

/**
 * @typedef {Object} CategoryDoc
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} sort_order
 * @property {string} slug
 */

/**
 * @typedef {Object} ResponseApiCategory
 * @property {CategoryDoc[]} data
 * @property {Record<string, any>} meta
 */

/**
 * @typedef {Object} CategoryProps
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} sortOrder
 * @property {string} slug
 */

/**
 * @extends {Entity<CategoryProps>}
 */
export class Category extends Entity {
  get name() {
    return this.props.name;
  }

  get slug() {
    return this.props.slug;
  }

  get description() {
    return this.props.description;
  }

  get sortOrder() {
    return this.props.sortOrder;
  }

  /**
   * @param {CategoryProps} props
   * @returns {Category}
   */
  static create(props) {
    return new Category(props);
  }
}
