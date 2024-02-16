class TableWithFilter {
    onGetRowsLoading() {

    }

    async getRows(fieldUniqueValues) {
        return [];
    }

    onGetRowsLoaded() {

    }

    async _getRowsWithLoading() {
        this.onGetRowsLoading();
        this._rows = await this.getRows(this.fieldUniqueValues);
        this.onGetRowsLoaded();
    }

    onGetUniqueValuesLoading() {

    }

    async getUniqueValues(field, fieldUniqueValues) {
        return [];
    }

    onGetUniqueValuesLoaded() {

    }

    async _getUniqueValuesWithLoading() {
        this.onGetUniqueValuesLoading();
        this._uniqueValues = await this.getUniqueValues(this.field, this.fieldUniqueValues);
        this.onGetUniqueValuesLoaded();
    }

    setUniqueSearchValueAttribute(element) {
        element.setAttribute("");
    }

    clearUniqueValues() {

    }

    showUniqueValues(uniqueValues) {

    }

    clearRows() {

    }

    showRows(rows) {

    }

    /**
     * 
     * @param {string | HTMLElement} target
     */
    constructor(target) {
        if (typeof target === "string") {
            this.target = document.querySelector(target);
        } else {
            this.target = target;
        }
        /**
         * @type {HTMLButtonElement | null}
         */
        this.activefilterMenuOpenButton = null;
        this.addedEventListenersFilterMenus = new Set();
        /**
         * @type {HTMLInputElement}
         */
        this.fieldUniqueValues = {};
        this._rows = null;
        this._uniqueValues = null;
        this._getRowsWithLoading().then(() => this.showRows(this._rows));
        for (const filterMenuOpenButton of this.target.querySelectorAll("button[data-smt-filter-menu-open-button]")) {
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
            elements = [this.activefilterMenuOpenButton, this.target];
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
            throw Error(`Element with selector ${selector} does not exists`);
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
        return this._getElement("[data-smt-unique-value-empty]", false, this.filterMenuElement);
    }

    get uniqueValueEmptyCheckbox() {
        return this._getDataElement("unique-value-empty-checkbox-target", false, this.filterMenuElement);
    }

    /**
     * @returns {HTMLElement}
     */
    get uniqueValuesNotFoundElement() {
        return this._getElement("[data-smt-unique-values-not-found]", false, this.filterMenuElement);
    }

    get uniqueValueTemplate() {
        return this._getData("unique-value-template", true);
    }

    get uniqueValuesNotFoundTemplate() {
        return this._getData("unique-values-not-found-template", true);
    }

    get uniqueValueEmptyTemplate() {
        return this._getData("unique-value-empty-template", true);
    }

    get uniqueValuesLoadingTemplate() {
        return this._getData("unique-values-loading-template", true);
    }

    nodeFromString(string) {
        const div = document.createElement("div");
        div.innerHTML = string;
        return div.firstChild;
    }

    get uniqueValueListElement() {
        return this._getDataElement("unique-value-list-target", true, this.filterMenuElement);
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
        const uniqueValueEmptyCheckbox = this.uniqueValueEmptyCheckbox;
        uniqueValuesWithType.empty = uniqueValueEmptyCheckbox ? uniqueValueEmptyCheckbox.checked : false;
        return uniqueValuesWithType;
    }

    async submit() {
        this.fieldUniqueValues[this.field] = this.uniqueValuesWithType;
        this.activefilterMenuOpenButton.dataset.uniqueValuesSearchQuery = this.uniqueValueSearchInput.value;
        this.clearRows();
        await this._getRowsWithLoading();
        this.showRows(this._rows);
        this.cancel();
    }

    cancel() {
        this.hideFilterMenu();
        this.onFilterMenuClose();
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
        const uniqueValueEmptyElement = this.uniqueValueEmptyElement;
        if (uniqueValueEmptyElement) {
            this.setDisplay(uniqueValueEmptyElement, !searchQuery);
        }
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
        const uniqueValueEmptyCheckbox = this.uniqueValueEmptyCheckbox;
        if (!searchQuery && uniqueValueEmptyCheckbox) {
            uniqueValueEmptyCheckbox.checked = value;
        }
        this.uniqueValueCheckboxes.forEach(uniqueValueCheckbox => {
            const uniqueSearchValue = uniqueValueCheckbox.value;
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

    async onFilterMenuOpen() {
        await this._getUniqueValuesWithLoading();
        this.showUniqueValues(this._uniqueValues);

        const filterMenuElement = this.filterMenuElement;
        const uniqueValueSearchInput = this.uniqueValueSearchInput;
        uniqueValueSearchInput.value = this.activefilterMenuOpenButton.dataset.uniqueValuesSearchQuery || "";
        this.filterUniqueValuesWithSearchQuery();
        const uniqueValueEmptyCheckbox = this.uniqueValueEmptyCheckbox;
        if (this.field in this.fieldUniqueValues) {
            const uniqueValues = this.fieldUniqueValues[this.field];
            for (const uniqueValueCheckbox of this.uniqueValueCheckboxes) {
                uniqueValueCheckbox.checked = (uniqueValues["include"] || uniqueValues["exclude"]).includes(uniqueValueCheckbox.value) ? "include" in uniqueValues : "exclude" in uniqueValues;
            }
            if (uniqueValueEmptyCheckbox) {
                uniqueValueEmptyCheckbox.checked = uniqueValues["empty"];
            }
        } else {
            for (const uniqueValueCheckbox of this.uniqueValueCheckboxes) {
                uniqueValueCheckbox.checked = true;
            }
            if (uniqueValueEmptyCheckbox) {
                uniqueValueEmptyCheckbox.checked = true;
            }
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
        const uniqueValueListElement = this.uniqueValueListElement;
        uniqueValueListElement.innerHTML = "";
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
}