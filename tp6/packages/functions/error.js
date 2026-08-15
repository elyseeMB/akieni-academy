/**
 * Api Error
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{cause: Record<string, any>}} options
   */
  constructor(message, { cause } = {}) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = cause?.status;
    this.statusText = cause?.statusText;
  }
}
