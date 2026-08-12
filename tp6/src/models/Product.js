/**
 * @typedef {Object} ImageProduct
 * @property {string} id
 * @property {number} index
 * @property {string} title
 * @property {string} image_url
 * @property {string} thumbnail_url
 */

import { Entity } from "../core/Entity.js";

/**
 * @typedef {Object} CategoryProduct
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 */

/**
 * @typedef {Object} ProductDataProduct
 * @property {string} product_title
 * @property {number} price
 * @property {string} short_description
 * @property {string} long_description
 * @property {string[]} bullet_points
 * @property {string[]} tags
 * @property {string[]} categories
 * @property {string[]} collections
 * @property {Record<string, string[]>} options
 * @property {Record<string, any>} attributes
 * @property {string} language
 * @property {string} status
 */

/**
 * @typedef {Object} DTOProduct
 * @property {string} id
 * @property {string} state
 * @property {string} visibility
 * @property {string|null} custom_category
 * @property {string|null} error_message
 * @property {ImageProduct[]} images
 * @property {CategoryProduct[]} categories
 * @property {ProductDataProduct} product_data
 */

/**
 * @typedef {Object} ResponseApiProduct
 * @property {DTOProduct[]} data
 * @property {Record<string, any>} meta
 */

/**
 * @typedef {Object} ProductProps
 * @property {string} id
 * @property {string} title
 * @property {number} price
 * @property {string} description
 * @property {string} shortDescription
 * @property {string} category
 * @property {string[]} categories
 * @property {ImageProduct[]} imageObjects
 * @property {string[]} bulletPoints
 * @property {string[]} tags
 * @property {string[]} collections
 * @property {Record<string, string[]>} options
 * @property {Record<string, any>} attributes
 * @property {string} state
 * @property {string} visibility
 * @property {string} status
 * @property {string} language
 * @property {string|null} customCategory
 * @property {string|null} errorMessage
 */

/**
 * @extends {Entity<ProductProps>}
 */
export class Product extends Entity {
  get image() {
    return this.props.imageObjects[0]?.image_url ?? "";
  }

  get images() {
    return this.props.imageObjects.map((img) => img.image_url);
  }

  /**
   * @param {string} categoryName
   * @returns {boolean}
   */
  hasCategory(categoryName) {
    return this.props.categories.includes(categoryName);
  }

  /**
   * @param {ProductProps} props
   * @returns {Product}
   */
  static create(props) {
    return new Product(props);
  }
}
