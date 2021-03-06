import 'babel-polyfill';
import defaultOptions from './defaultOptions.json';
import {
  fetchErrorsRequest,
  fetchErrorRequest,
  closeErrorRequest,
  falseErrorRequest,
  fetchSupportedCountriesRequest,
  fetchItemCategoriesRequest,
  fetchItemsRequest
} from './requests';

/**
 * Osmose API request handler
 * @type {Object}
 */
export default class OsmoseRequest {
  /**
   * @param {Object} [options] Custom options to apply
   */
  constructor(options) {
    this._options = {
      ...defaultOptions,
      ...options
    };
  }

  /**
   * Return the language to use for the Accept-language header of the requests
   * @return {string} Language code (eg: fr, en, ru)
   */
  get language() {
    return this._options.language;
  }

  /**
   * Return the API endpoint to use for the requests
   * @return {string} URL of the API endpoint
   */
  get endpoint() {
    return this._options.endpoint;
  }

  /**
   * Return an errors list
   * @param {Object} params
   * @return {Array}
   */
  async fetchErrors(params) {
    const response = await fetchErrorsRequest(
      this._options.endpoint,
      this._options.language,
      params
    );

    /*
      Transform the raw list:
      {
        "description": ["lat", "lon", "error_id", "item"],
        "errors": [
          ["47.2069075", "-1.5145110", "14412894302", "8120"],
          ["47.1867600", "-1.5580475", "14412894299", "8120"]
        ]
      }

      Into an array of objects:
      [
        {
          "lat": "47.2069075",
          "lon": "-1.5145110",
          "error_id": "14412894302",
          "item": "8120"
        },
        {
          "lat": "47.1867600",
          "lon": "-1.5580475",
          "error_id": "14412894299",
          "item": "8120"
        }
      ]
     */
    return response.errors.map(error =>
      response.description.reduce((result, key, index) => {
        result[key] = error[index];
        return result;
      }, {})
    );
  }

  /**
   * Return all the informations about a specific error
   * @param {string} errorId The error ID
   * @return {Object}
   */
  async fetchError(errorId) {
    return await fetchErrorRequest(
      this._options.endpoint,
      this._options.language,
      errorId
    );
  }

  /**
   * Mark the specific error as solved
   * @param {string} errorId The error ID
   * @return {Object}
   */
  async closeError(errorId) {
    return await closeErrorRequest(
      this._options.endpoint,
      this._options.language,
      errorId
    );
  }

  /**
   * Mark the specific error as false positive
   * @param {string} errorId The error ID
   * @return {Object}
   */
  async falseError(errorId) {
    return await falseErrorRequest(
      this._options.endpoint,
      this._options.language,
      errorId
    );
  }

  /**
   * Return the list of the countries supported in the Osmose instance
   * @return {Array}
   */
  async fetchSupportedCountries() {
    const response = await fetchSupportedCountriesRequest(
      this._options.endpoint,
      this._options.language
    );
    return response.countries;
  }

  /**
   * Return the list of the item categories with some details
   * @return {Array}
   */
  async fetchItemCategories() {
    const response = await fetchItemCategoriesRequest(
      this._options.endpoint,
      this._options.language
    );

    return response.categories.map(category => ({
      id: category.categ,
      name: category.menu,
      items: category.item.map(item => ({
        id: item.item,
        name: item.menu,
        tags: item.tags,
        count: item.number,
        levels: item.levels
      }))
    }));
  }

  /**
   * Return the list of the items configured in the Osmose instance and their translated name.
   * It's possible to filter the returned translations to one language.
   * @param {string} [isoCountryCode] Eg: fr, en, ru
   * @return {Array}
   */
  async fetchItems(isoCountryCode) {
    const response = await fetchItemsRequest(
      this._options.endpoint,
      this._options.language
    );

    if (isoCountryCode) {
      return response.items.map(item => ({
        id: item[0],
        name: item[1][isoCountryCode]
      }));
    } else {
      return response.items.map(item => ({
        id: item[0],
        name: item[1]
      }));
    }
  }
}
