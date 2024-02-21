async function wait(ms) {
    await new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

class TableWithFilter {
    constructor(target) {
        this.target = $(target)[0];
        this.activeFilterMenuOpenButton = null;
        this._fieldUniqueValues = {};
        this._uniqueValues = {};
        this._field = null;
        this._data = {};
        this._fieldSearchQuery = {};
        this._searchQuery = null;
        $("button[data-twf-filter-menu-target]", this.target).on("click", async (event) => {
            event.stopPropagation();
            if (this.activeFilterMenuOpenButton) {
                if (this.activeFilterMenuOpenButton != event.target) {
                    this._closeFilterMenu();
                    await this._openFilterMenu(event.target);
                } else {
                    this._closeFilterMenu();
                }
            } else {
                await this._openFilterMenu(event.target);
            }

        });

        $(document).on("click", () => {
            this._closeFilterMenu();
        });
    }

    async submit() {
        this._fieldSearchQuery[this._field] = this._searchQuery;
        this._fieldUniqueValues[this._field] = this._getUniqueValues();
        await this._showRows();
        $(this.target).trigger("filter-menu-submit");
    }

    _getData(name) {
        name = name;
        let element = $(this.activeFilterMenuOpenButton);
        let value = null;
        while (!value && element.length !== 0) {
            value = element.data(name);
            element = element.parent();
        }
        return value;
    }

    _getField() {
        return this._getData("twfField");
    }

    _getFilterMenuElement() {
        return $(this._getData("twfFilterMenuTarget"));
    }

    _getFilterMenuCancelButtonElement() {
        return $(this._getData("twfFilterMenuCancelButtonTarget"));
    }

    _getFilterMenuSubmitButtonElement() {
        return $(this._getData("twfFilterMenuSubmitButtonTarget"));
    }

    _getUniqueValueSearchInputElement() {
        return $(this._getData("twfUniqueValueSearchInputTarget"));
    }

    _getUniqueValueElements() {
        return $(this._getData("twfUniqueValueTarget"));
    }

    _getUniqueValueCheckboxElements() {
        return $(`${this._getData("twfUniqueValueTarget")} input[type="checkbox"]`)
    }

    _getUniqueValueSelectAllButtonElement() {
        return $(this._getData("twfUniqueValueSelectAllButtonTarget"));
    }

    _getUniqueValueResetButtonElement() {
        return $(this._getData("twfUniqueValueResetButtonTarget"));
    }

    _setFilterMenuPosititon() {
        const filterMenu = this._getFilterMenuElement();
        const offset = $(this.activeFilterMenuOpenButton).offset();
        if (offset.left + filterMenu.outerWidth() > window.innerWidth) {
            offset.left -= filterMenu.outerWidth() - $(this.activeFilterMenuOpenButton).outerWidth();
        } 
        if (offset.top + filterMenu.outerHeight() > window.innerHeight) {
            offset.top -= filterMenu.outerHeight();
        } else {
            offset.top += $(this.activeFilterMenuOpenButton).outerHeight();
        }
        filterMenu.css({ position: "absolute", ...offset });
    }

    _showFilterMenu() {
        const filterMenu = this._getFilterMenuElement();
        filterMenu.css("display", "");
    }

    _hideFilterMenu() {
        const filterMenu = this._getFilterMenuElement();
        filterMenu.css({ display: "none" });
    }

    _getUniqueValues() {
        const unchecked = [];
        const checked = [];
        this._getUniqueValueElements().each(function () {
            const uniqueValue = $(this).data(`twfUniqueValue`);
            if ($(`input[type="checkbox"]`, this).prop("checked")) {
                checked.push(uniqueValue);
            } else {
                unchecked.push(uniqueValue);
            }
        });
        const uniqueValues = checked.length < unchecked.length ? { "include": checked } : { "exclude": unchecked };
        return uniqueValues;
    }

    _filterUniqueValues(searchQuery) {
        this._getUniqueValueElements().each(function () {
            const uniqueValue = $(this).data(`twfUniqueValue`);
            if (!searchQuery || uniqueValue.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
                $(this).css("display", "");
            } else {
                $(this).css("display", "none");
            }
        });
    }

    _checkUniqueValues(searchQuery, value) {
        this._getUniqueValueElements().each(function () {
            const uniqueValue = $(this).data(`twfUniqueValue`);
            const checkbox = $(`input[type="checkbox"]`, this);
            if (!searchQuery || uniqueValue.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
                checkbox.prop("checked", value);
            }
        });
    }

    _selectAllUniqueValues(searchQuery) {
        this._checkUniqueValues(searchQuery, true);
    }

    _resetUniqueValues(searchQuery) {
        this._checkUniqueValues(searchQuery, false);
    }

    async _openFilterMenu(activeFilterMenuOpenButton) {
        this.activeFilterMenuOpenButton = activeFilterMenuOpenButton;
        this._field = this._getField();
        this._setFilterMenuPosititon();
        this._showFilterMenu();
        await this._showUniqueValues();
        const filterMenu = this._getFilterMenuElement();
        const uniqueValueSearchInput = this._getUniqueValueSearchInputElement();
        this._searchQuery = this._fieldSearchQuery[this._field];
        uniqueValueSearchInput.val(this._searchQuery);
        this._filterUniqueValues(this._searchQuery);
        if (this._field in this._fieldUniqueValues) {
            const uniqueValues = this._fieldUniqueValues[this._field];
            this._getUniqueValueElements().each(function () {
                const uniqueValue = $(this).data(`twfUniqueValue`);
                $(`input[type="checkbox"]`, this).prop("checked", (uniqueValues["include"] || uniqueValues["exclude"]).includes(uniqueValue) ? "include" in uniqueValues : "exclude" in uniqueValues);
            });
        } else {
            this._getUniqueValueCheckboxElements().prop("checked", true);
        }

        if (filterMenu.data("hasEventListeners")) {
            return;
        }
        this._getFilterMenuCancelButtonElement().on("click", async () => {
            await this._closeFilterMenu();
        });
        this._getFilterMenuSubmitButtonElement().on("click", async () => {
            await this.submit();
            await this._closeFilterMenu();
        });
        uniqueValueSearchInput.on("input", async (event) => {
            this._searchQuery = $(event.target).val();
            this._filterUniqueValues(this._searchQuery);
        });
        filterMenu.data("hasEventListeners", true);
        filterMenu.on("click", event => {
            event.stopPropagation();
        });
        this._getUniqueValueSelectAllButtonElement().on("click", () => {
            this._selectAllUniqueValues(this._searchQuery);
        });

        this._getUniqueValueResetButtonElement().on("click", () => {
            this._resetUniqueValues(this._searchQuery);
        });
    }

    async _closeFilterMenu() {
        this._hideFilterMenu();
        this.activeFilterMenuOpenButton = null;
        this._field = null;
    }

    async saveData() { }
    async loadData() { }

    _getShowRowsFunction() {
        return window[this._getData("twfShowRowsFunction")];
    }
    async _showRows() {
        const showRows = this._getShowRowsFunction();
        if (showRows && typeof showRows === "function") {
            await showRows(this._fieldUniqueValues);
        } else {
            console.error(`"${showRows}" should be a get rows function`);
        }
    }

    _getShowUniqueValuesFunction() {
        return window[this._getData("twfShowUniqueValuesFunction")]
    }
    async _showUniqueValues() {
        const showUniqueValues = this._getShowUniqueValuesFunction();
        if (showUniqueValues && typeof showUniqueValues === "function") {
            await showUniqueValues(this._field, this._fieldUniqueValues);
        } else {
            console.error(`"${showUniqueValues}" should be a get unique values function`);
        }
    }
}
