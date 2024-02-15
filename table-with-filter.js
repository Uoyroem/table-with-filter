function getRows() {
    console.log("getRows")
}
function getUniqueValues() {
    console.log("getUniqueValues")
}

class TableWithFilter {
    /**
     * 
     * @param {HTMLTableElement} tableElement 
     */
    constructor(tableElement) {
        this.tableElement = tableElement;
        /**
         * @type {HTMLButtonElement | null}
         */
        this.activefilterMenuOpenButton = null;
        this.addedEventListenersFilterMenus = new Set();
        /**
         * @type {HTMLInputElement}
         */
        this.fieldUniqueValues = {};
        for (const filterMenuOpenButton of tableElement.querySelectorAll("button[data-smt-filter-menu-open-button]")) {
            filterMenuOpenButton.addEventListener("click", event => {
                if (this.activefilterMenuOpenButton) {
                    if (this.activefilterMenuOpenButton === filterMenuOpenButton) {
                        this.cancel();
                    } else {
                        this.activefilterMenuOpenButton = filterMenuOpenButton;
                        this.setFilterMenuPosition();
                        this.onFilterMenuOpen();
                    }
                } else {
                    this.activefilterMenuOpenButton = filterMenuOpenButton;
                    this.showFilterMenu();
                    this.setFilterMenuPosition();
                    this.onFilterMenuOpen();
                }
                event.stopPropagation();
            });
        }
        document.addEventListener("click", () => {
            this.cancel();
        });
        for (const filterMenuCancelButton of document.querySelectorAll(`button[data-smt-filter-menu-cancel-button]`)) {
            filterMenuCancelButton.addEventListener("click", () => {
                this.cancel();
            });
        }
        for (const filterMenuSubmitButton of document.querySelectorAll(`button[data-smt-filter-menu-submit-button]`)) {
            filterMenuSubmitButton.addEventListener("click", event => {
                this.submit();
            });
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {boolean} required 
     * @returns {string}
     */
    _getData(name, required, ...elements) {
        let value = null;
        if (elements.length === 0) {
            elements = [this.activefilterMenuOpenButton, this.tableElement];
        }
        for (const element of elements) {
            if (element) {
                value = element.getAttribute(`data-smt-${name}`)
                if (value) {
                    break;
                }
            }
        }
        if (required && !value) {
            throw Error(`Attribute "data-smt-${name}" required for table or filter menu open button.`);
        }
        return value || "";
    }

    /**
     * 
     * @param {string} selector 
     * @param {boolean} required
     * @param {HTMLElement} relative
     * @param {"querySelector" | "querySelectorAll"} querySelectorType 
     */
    _getElement(selector, required, relative = document, querySelectorType = "querySelector") {
        const element = relative[querySelectorType](selector);
        if (required && querySelectorType === "querySelector" && !element) {
            throw Error(`Element with selector ${filterMenuSelector} does not exists`);
        }
        return element;
    }

    /**
     * 
     * @param {string} name 
     * @param {boolean} required 
     * @param {HTMLElement} relative 
     * @param {"querySelector" | "querySelectorAll"} querySelectorType
     * @returns {HTMLElement | NodeListOf<HTMLElement>}
     */
    _getDataElement(name, required, relative = document, querySelectorType = "querySelector", ...elements) {
        const data = this._getData(name, required, ...elements);
        if (!data) {
            return null;
        }
        return this._getElement(data, required, relative, querySelectorType);
    }

    /**
     * @returns {HTMLElement}
     */
    get filterMenuElement() {
        return this._getDataElement("filter-menu-target", true);
    }

    /**
     * @returns {string}
     */
    get field() {
        return this._getData("field", true);
    }

    get uniqueValueSearchInput() {
        return this._getDataElement("unique-value-search-input-target", true, this.filterMenuElement);
    }

    get uniqueValueSelectAllButton() {
        return this._getDataElement("unique-value-select-all-button-target", true, this.filterMenuElement);
    }

    get uniqueValueResetButton() {
        return this._getDataElement("unique-value-reset-button-target", true, this.filterMenuElement);
    }

    get uniqueValueCheckboxes() {
        return this._getDataElement("unique-value-checkbox-target", true, this.filterMenuElement, "querySelectorAll");
    }

    get uniqueSearchValueElements() {
        return this._getElement("[data-smt-unique-search-value]", false, this.filterMenuElement, "querySelectorAll");
    }

    get uniqueValueEmptyElement() {
        return this._getElement("[data-smt-unique-value-empty]", true, this.filterMenuElement);
    }

    get uniqueValueEmptyCheckbox() {
        return this._getDataElement("unique-value-empty-checkbox-target", true, this.filterMenuElement);
    }

    /**
     * @returns {HTMLElement}
     */
    get uniqueValuesNotFoundElement() {
        return this._getElement("[data-smt-unique-values-not-found]", false, this.filterMenuElement);
    }

    get uniqueValuesWithType() {
        const uncheckedUniqueValues = [];
        const checkedUniqueValues = [];
        for (const uniqueValueCheckbox of this.uniqueValueCheckboxes) {
            if (uniqueValueCheckbox.checked) {
                checkedUniqueValues.push(uniqueValueCheckbox.value);
            } else {
                uncheckedUniqueValues.push(uniqueValueCheckbox.value);
            }
        }
        const uniqueValuesWithType = uncheckedUniqueValues.length < checkedUniqueValues.length ? { "exclude": uncheckedUniqueValues } : { "include": checkedUniqueValues };
        uniqueValuesWithType.empty = this.uniqueValueEmptyCheckbox.checked;
        return uniqueValuesWithType;
    }

    submit() {
        this.fieldUniqueValues[this.field] = this.uniqueValuesWithType;
        this.activefilterMenuOpenButton.dataset.uniqueValuesSearchQuery = this.uniqueValueSearchInput.value;
        this.cancel();
    }

    cancel() {
        this.hideFilterMenu();
        this.activefilterMenuOpenButton = null;
    }

    setFilterMenuPosition() {
        const filterMenuElement = this.filterMenuElement;
        filterMenuElement.style.position = "absolute";
        const domRect = this.activefilterMenuOpenButton.getBoundingClientRect();
        filterMenuElement.style.top = `${domRect.top + domRect.width}px`;
        filterMenuElement.style.left = `${domRect.left}px`;
    }

    setDisplay(element, value) {
        if (!element.dataset.smtDefaultDisplay) {
            const display = getComputedStyle(element).display;
            element.dataset.smtDefaultDisplay = display;
        }
        if (value) {
            element.style.display = element.dataset.smtDefaultDisplay;
        } else {
            element.style.display = "none";
        }
    }

    filterUniqueValuesWithSearchQuery() {
        const searchQuery = this.uniqueValueSearchInput.value;
        this.setDisplay(this.uniqueValueEmptyElement, !searchQuery);
        this.uniqueValuesSearchQuery = searchQuery;
        let hasMatched = false;
        this.uniqueSearchValueElements.forEach(uniqueSearchValueElement => {
            const uniqueSearchValue = this._getData("unique-search-value", true, uniqueSearchValueElement);
            if (!uniqueSearchValueElement.dataset.smtDefaultDisplay) {
                uniqueSearchValueElement.dataset.smtDefaultDisplay = getComputedStyle(uniqueSearchValueElement).display;
            }
            const matched = !searchQuery || uniqueSearchValue.toLowerCase().includes(searchQuery.toLowerCase());
            this.setDisplay(uniqueSearchValueElement, matched);
            if (matched) {
                hasMatched = true;
            } 
        });
        const uniqueValuesNotFoundElement = this.uniqueValuesNotFoundElement;
        if (uniqueValuesNotFoundElement) {
            this.setDisplay(uniqueValuesNotFoundElement, !hasMatched);
        }
    }

    checkMatchedUniqueValues(value) {
        const searchQuery = this.uniqueValueSearchInput.value;
        if (!searchQuery) {
            this.uniqueValueEmptyCheckbox.checked = value;
        }
        this.uniqueValueCheckboxes.forEach(uniqueValueCheckbox => {
            const uniqueSearchValue = this._getData("unique-search-value", true, uniqueValueCheckbox);
            if (!searchQuery || uniqueSearchValue.toLowerCase().includes(searchQuery.toLowerCase())) {
                uniqueValueCheckbox.checked = value;
            }
        });
    }

    uniqueValuesSelectAll() {
        this.checkMatchedUniqueValues(true);
    }

    uniqueValuesReset() {
        this.checkMatchedUniqueValues(false);
    }

    onFilterMenuOpen() {
        const filterMenuElement = this.filterMenuElement;
        const uniqueValueSearchInput = this.uniqueValueSearchInput;
        
        uniqueValueSearchInput.value = this.activefilterMenuOpenButton.dataset.uniqueValuesSearchQuery || "";
        this.filterUniqueValuesWithSearchQuery();
        if (this.field in this.fieldUniqueValues) {
            const uniqueValues = this.fieldUniqueValues[this.field];
            for (const uniqueValueCheckbox of this.uniqueValueCheckboxes) {
                uniqueValueCheckbox.checked = (uniqueValues["include"] || uniqueValues["exclude"]).includes(uniqueValueCheckbox.value) ?  "include" in uniqueValues : "exclude" in uniqueValues;
            }
            this.uniqueValueEmptyCheckbox.checked = uniqueValues["empty"];
        } else {
            for (const uniqueValueCheckbox of this.uniqueValueCheckboxes) {
                uniqueValueCheckbox.checked = true;
            }
            this.uniqueValueEmptyCheckbox.checked = true;
        }
        if (this.addedEventListenersFilterMenus.has(filterMenuElement)) {
            return;
        }
        filterMenuElement.addEventListener("click", event => {
            event.stopPropagation();
        });
        uniqueValueSearchInput.addEventListener("input", () => this.filterUniqueValuesWithSearchQuery());
        this.uniqueValueSelectAllButton.addEventListener("click", () => this.uniqueValuesSelectAll());
        this.uniqueValueResetButton.addEventListener("click", () => this.uniqueValuesReset());
        this.addedEventListenersFilterMenus.add(filterMenuElement);
    }

    onFilterMenuClose() {
    }

    showFilterMenu() {
        const filterMenuElement = this.filterMenuElement;
        filterMenuElement.style.display = "block";
    }

    hideFilterMenu() {
        const filterMenuElement = this.filterMenuElement;
        filterMenuElement.style.display = "none";
    }

    /**
     * 
     * @param {string} field 
     * @param {"asc" | "desc"} order 
     */
    sortRows(field, order) {

    }

    /**
     * 
     * @param {{[x: string]: string[]}} fieldValues 
     * @returns 
     */
    async getRows(fieldValues) {
        let getRowFunction = this._getData("get-rows-function", true);
        getRowFunction = window[getRowFunction];
        if (typeof getRowFunction === "function") {
            throw TypeError(`${getRowFunction} not a function.`)
        }
        return await getRowFunction();
    }

    /**
     * 
     * @param {string} field 
     * @returns 
     */
    async getUniqueValues(field) {
        let getUniqueValuesFunction = this._getData("get-unique-values-function", true);
        getUniqueValuesFunction = window[getUniqueValuesFunction];
        if (typeof getUniqueValuesFunction === "function") {
            throw TypeError(`${getUniqueValuesFunction} not a function.`)
        }
        return await getUniqueValuesFunction(field);
    }
}

let tableWithFilter = null;

document.addEventListener("DOMContentLoaded", function () {
    const myTable = document.getElementById("my-table");
    tableWithFilter = new TableWithFilter(myTable);
});