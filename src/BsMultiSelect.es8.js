import $ from 'jquery'
import Popper from 'popper.js'

// TODO: 
// 2) require polyfill Element.closest polyfill IE 11
// 3) require multiple classList.add polyfill IE 11

// IIFE to declare private members
const BsMultiSelect = ((window, $, Popper) => {
    const JQUERY_NO_CONFLICT = $.fn[pluginName];
    const pluginName = "dashboardCodeBsMultiSelect";
    const dataKey = "plugin_" + pluginName;
    const defaults = {
        items: [],
        defaults: [],
        usePopper: true,

        containerClass: "dashboardcode-bs-multiselect",
        dropDownMenuClass: "dropdown-menu",
        dropDownItemClass: "px-2",
        selectedPanelClass: "form-control btn border",
        selectedPanelStyle: { "min-height": "calc(2.25rem + 2px)" },
        selectedPanelReadonlyStyle: { "background-color":"#e9ecef"},
        selectedPanelStyleSys: { "cursor": "text", "display": "flex", "flex-wrap": "wrap", "align-items": "center", "margin-bottom": "0px" }, 
        selectedItemClass: "badge", 
        selectedItemStyle: { "padding-left": "0px"},
        selectedItemStyleSys: { "display": "flex", "align-items": "center" },
        removeSelectedItemButtonClass: "close",
        removeSelectedItemButtonStyle: { "font-size": "100%" }, 
        filterInputItemClass: "", 
        filterInputItemStyle: {},
        filterInputItemStyleSys: {"display": "block"},
        filterInputClass: "",
        filterInputStyle: { "color": "#495057" },
        filterInputStyleSys: { "width": "2ch", "border": "0", "padding": "0", "outline": "none", }
    };

    class Plugin {
        constructor(element, options) {
            if (typeof Popper === 'undefined') {
                throw new TypeError('DashboardCode bsMultiSelect require Popper.js (https://popper.js.org)')
            }

            // readonly
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this.input = element;
            this.container = null;
            this.dropDownMenu = null;
            this.selectedPanel = null;
            this.filterInput = null;
            this.filterInputItem = null;
            this.popper = null;

            // statefull
            this.skipFocusout = false;
            this.backspaceAtStartPoint = null;
            this.selectedDropDownItem = null;
            this.selectedDropDownIndex = null;
            this.hasItems = false;

            this.init();
        }

        updateDropDownPosition() {
            //console.log("updateDropDownPosition");
            if (this.options.usePopper) {
                this.popper.update();
            } else {
                $(this.dropDownMenu).dropdown('update');
            }
        }

        hideDropDown() {
            if (this.options.usePopper) {
                //console.log("popper remove show");
                $(this.dropDownMenu).removeClass('show')
            } else {
                if ($(this.dropDownMenu).hasClass('show'))
                    $(this.dropDownMenu).dropdown('toggle');
            }
        }

        showDropDown() {
            if (this.hasItems) {
                if (this.options.usePopper) {
                    //console.log("popper add show");
                    $(this.dropDownMenu).addClass('show')
                } else {
                    if (!$(this.dropDownMenu).hasClass('show'))
                        $(this.dropDownMenu).dropdown('toggle');
                }
            }
        }

        setCheck(optionId, isChecked) {
            for (var i = 0; i < this.input.options.length; i += 1) {
                var option = this.input.options[i];
                if (option.value == optionId) {
                    this.input.options[i].selected = isChecked;
                    break;
                }
            }
        }

        // Public methods
        getInputValue() {
            return $(this.input).val();
        }

        closeDropDown() {
            this.clearFilterInput();
            this.hideDropDown();
            this.updateDropDownPosition();
        }


        clearFilterInput() {
            if (this.filterInput.value != '') {
                this.filterInput.value = '';
                this.filterDropDownMenu();
                if (this.hasItems) {
                    this.updateDropDownPosition(); 
                } 
            }
        }

        filterDropDownMenu() {
            var text = this.filterInput.value.trim();
            var visible = 0;
            $(this.dropDownMenu).find('li').each(function () {
                var $item = $(this);
                if (text == "") {
                    $item.show();
                    visible++;
                }
                else {
                    var itemText = $item.text();
                    var $checkbox = $item.find('input[type="checkbox"]');
                    
                    if (!$checkbox.prop('checked') && itemText.toLowerCase().includes(text.toLowerCase())) {
                        $item.show();
                        visible++;
                    } else {
                        $item.hide();
                    }
                }
            });
            this.hasItems = (visible > 0);
            this.resetSelectDropDownMenu();
        }

        clickDropDownItem(event) {
            //console.log("filter & stopPropagation");
            event.preventDefault();
            event.stopPropagation();

            var menuItem = event.currentTarget.closest("LI");
            var $menuItem = $(menuItem);
            var optionId = $menuItem.data("option-id");
            var $checkBox = $menuItem.find('input[type="checkbox"]');
            if ($checkBox.prop('checked')) {
                var $selectedItem = $(this.selectedPanel).find(`li[data-option-id="${optionId}"]`);
                this.removeSelectedItem($selectedItem, optionId, $checkBox);
            } else {
                var itemText = $menuItem.find('label').text();
                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                $checkBox.prop('checked', true);
            }
            this.clearFilterInput();
            $(this.filterInput).focus();
        }

        
        appendDropDownItem(itemValue, itemText, isChecked) {
            var optionId = itemValue;
            var checkBoxId = `dashboardcode-bs-multiselect-${this.input.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
            var checked = isChecked ? "checked" : "";
            var $dropDownItem = $(
                `<li data-option-id="${optionId}">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="${checkBoxId}" ${checked}>
                        <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
                    </div>
                 </li>`).addClass(this.options.dropDownItemClass).appendTo($(this.dropDownMenu));

            var $checkBox = $dropDownItem.find(`input[type="checkbox"]`);
            if (isChecked) {
                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
            }
        }
        
        createAndAppendSelectedItem($checkBox, optionId, itemText) {
            var $selectedItem = $(`<li data-option-id="${optionId}"><span>${itemText}</span></li>`)
                .css(this.options.selectedItemStyleSys)
                .css(this.options.selectedItemStyle)
                .addClass(this.options.selectedItemClass) 
                .insertBefore($(this.filterInputItem));
            var $buttom = $("<button aria-label='Close' tabIndex='-1' type='button'><span aria-hidden='true'>&times;</span></button>")
                .css(this.options.removeSelectedItemButtonStyle)
                .addClass(this.options.removeSelectedItemButtonClass)
                .appendTo($selectedItem); 
            this.setCheck(optionId, true);

            $buttom.click((event) => {
                this.removeSelectedItem($selectedItem, optionId, $checkBox)
                this.updateDropDownPosition();
                $(this.filterInput).focus();
            });
        }

        adoptFilterInputLength() {
            this.filterInput.style.width = this.filterInput.value.length*1.3 + 2 + "ch";
        }

        analyzeInputText() {
            var text = this.filterInput.value.trim().toLowerCase();
            var item = [...this.dropDownMenu.querySelectorAll("LI")]
                .find(i => i.textContent.trim().toLowerCase() == text);
            if (item != undefined) {
                var $item = $(item);
                var $checkBox = $item.find('input[type="checkbox"]');
                if (!$checkBox.prop('checked')) {
                    var optionId = $item.data('option-id');
                    var itemText = $item.find('label').text();
                    this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                    $checkBox.prop('checked', true);

                }
                this.clearFilterInput();
            }
        }

        resetSelectDropDownMenu() {
            if (this.selectedDropDownItem != null) {
                // IE11 doesn't support remove('text-primary', bg-light' )
                this.selectedDropDownItem.classList.remove('bg-light');
                this.selectedDropDownItem.classList.remove('text-primary');
                this.selectedDropDownItem = null;
            }
            this.selectedDropDownIndex = null;
        }
        
        keydownArrow(down) {
            var items = [...this.dropDownMenu.querySelectorAll('LI:not([style*="display: none"]')];
            if (items.length > 0) {
                this.showDropDown();
                if (this.selectedDropDownItem == null) {
                    
                    this.selectedDropDownIndex = (down) ? 0 : items.length - 1;
                }
                else {
                    // IE11 doesn't support remove('text-primary', bg-light' )
                    this.selectedDropDownItem.classList.remove('bg-light');
                    this.selectedDropDownItem.classList.remove('text-primary');
                    if (down) {
                        var newIndex = this.selectedDropDownIndex + 1;
                        this.selectedDropDownIndex = (newIndex < items.length) ? newIndex : 0;
                    } else {
                        var newIndex = this.selectedDropDownIndex - 1;
                        this.selectedDropDownIndex = (newIndex >= 0) ? newIndex : items.length - 1;
                    }
                }
                this.selectedDropDownItem = items[this.selectedDropDownIndex];
                // IE11 doesn't support add('text-primary', bg-light' )
                this.selectedDropDownItem.classList.add('text-primary');
                this.selectedDropDownItem.classList.add('bg-light' );
                
            }
        }

        removeSelectedItem($selectedItem, optionId, $checkBox) {
            $selectedItem.remove();
            this.setCheck(optionId, false);
            $checkBox.prop('checked', false);
        }

        init() {
            var $input = $(this.input);
            $input.hide();
            var disabled = this.input.disabled;

            var $container = $("<div/>")
                .addClass(this.options.containerClass)
                .insertAfter($input);
                
            this.container = $container.get(0);

            var $selectedPanel = $("<ul/>")
                .addClass(this.options.selectedPanelClass)
                .css(this.options.selectedPanelStyleSys)
                .css(this.options.selectedPanelStyle)
                .appendTo($container);
            this.selectedPanel = $selectedPanel.get(0);

            var $filterInputItem = $('<li/>')
                .css(this.options.filterInputItemStyleSys)
                .css(this.options.filterInputItemStyle)
                .addClass(this.options.filterInputItemClass)
                .appendTo($selectedPanel);
            this.filterInputItem = $filterInputItem.get(0)

            var $filterInput = $('<input type="search" autocomplete="off">')
                .css(this.options.filterInputStyleSys)
                .css(this.options.filterInputStyle)
                .addClass(this.options.filterInputClass)
                .appendTo($filterInputItem);
            this.filterInput = $filterInput.get(0)

            var $dropDownMenu = $("<ul/>").appendTo($container);
            this.dropDownMenu = $dropDownMenu.get(0);

            $dropDownMenu.addClass(this.options.dropDownMenuClass);
            if (this.options.usePopper) {
                this.popper = new Popper(this.filterInput, this.dropDownMenu, {
                    placement: 'bottom-start',
                    modifiers: {
                        flip: {
                            behavior: ['left', 'right']
                        },
                    },
                });
            } else {
                $(this.dropDownMenu).addClass("dropdown dropdown-menu")
                $(this.dropDownMenu).data("", "");
                $(this.dropDownMenu).dropdown({
                    placement: 'bottom-start',
                    flip: false,
                    reference: this.filterInput
                });
            }

            if (this.options.items == null) {
                this.options.items.forEach(item => {
                    var itemValue = item['value'];
                    var itemText = item['text'];
                    var isChecked = item['isChecked'];
                    this.appendDropDownItem(itemValue, itemText, isChecked);
                });
                this.hasItems = options.items.length > 0;
            } else {
                var selectOptions = $input.find('option');
                selectOptions.each(
                    (index, option) => {
                        var itemValue = option.value;
                        var itemText = option.text;
                        var isChecked = option.selected;
                        this.appendDropDownItem(itemValue, itemText, isChecked);
                    }
                );
                this.hasItems = selectOptions.length > 0;
            }
            if (disabled) {
                this.filterInput.style.display = "none";
                $selectedPanel.css(this.options.selectedPanelReadonlyStyle);
                $selectedPanel.find('button').prop("disabled", true);
                $selectedPanel.addClass();
            } else {
                var inputId = this.input.id;
                var formGroup = this.input.closest(".form-group");
                if (formGroup != null) {
                    var label = formGroup.querySelector(`label[for="${inputId}"]`);
                    var f = $(label).attr("for");
                    if ( f == this.input.id) {
                        this.filterInput.id = "dashboardcode-bs-multiselect-generated-filter-id-" + this.input.id;
                        label.setAttribute("for", this.filterInput.id);
                    }
                }

                this.updateDropDownPosition();

                $dropDownMenu.click(event => {
                    //console.log('dropDownMenu click - stopPropagation')
                    event.stopPropagation();
                });

                $dropDownMenu.find('li').click((event) => {
                    this.clickDropDownItem(event);
                });

                $dropDownMenu.on("mouseover", (event) => {
                    this.resetSelectDropDownMenu();
                });

                $dropDownMenu.find("li").on("mouseover", (event) => {
                    event.target.closest("li").classList.add('text-primary');
                    event.target.closest("li").classList.add('bg-light');
                });

                $dropDownMenu.find("li").on("mouseout", (event) => {
                    event.target.closest("li").classList.remove('text-primary');
                    event.target.closest("li").classList.remove('bg-light');
                });

                $selectedPanel.click((event) => {
                    //console.log('selectedPanel click ' + event.target.nodeName);
                    if (event.target.nodeName != "INPUT")
                        $(this.filterInput).val('').focus();
                    if (!(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON")))
                        this.showDropDown();
                });


                $filterInput.on("keydown", (event) => {
                    if (event.which == 38 || event.keyCode == 38) {
                        event.preventDefault();
                        this.keydownArrow(false);
                    }
                    else if (event.which == 40 || event.keyCode == 40) {
                        event.preventDefault()
                        this.keydownArrow(true);
                    }
                    else if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                        event.preventDefault();
                    }
                    else {
                        if (event.which == 8 || event.keyCode == 8) {
                            // detect that backspace is at start of input field (this will be used at keydown)
                            this.backspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                        }
                        this.resetSelectDropDownMenu();
                    }
                });

                $filterInput.on("keyup", (event) => {
                    if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                        if (this.selectedDropDownItem != null) {
                            var $item = $(this.selectedDropDownItem);
                            var $checkBox = $item.find('input[type="checkbox"]');
                            var optionId = $item.data('option-id');
                            if (!$checkBox.prop('checked')) {
                                var itemText = $item.find('label').text();
                                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                                $checkBox.prop('checked', true);
                                this.filterInput.value = "";
                            } else {
                                var $selectedItem = $(this.selectedPanel).find(`li[data-option-id="${optionId}"]`);
                                this.removeSelectedItem($selectedItem, optionId, $checkBox);
                            }
                            //this.resetSelectDropDownMenu();
                        } else {
                            this.analyzeInputText();
                        }
                    } else if (event.which == 8 || event.keyCode == 8) {
                        var startPosition = this.filterInput.selectionStart;
                        var endPosition = this.filterInput.selectionEnd;
                        if (endPosition == 0 && startPosition == 0 && this.backspaceAtStartPoint) {
                            var array = [...this.selectedPanel.querySelectorAll("LI")];
                            if (array.length >= 2) {
                                var itemToDelete = array[array.length - 2];
                                var $itemToDelete = $(itemToDelete);
                                var optionId = $itemToDelete.data("option-id");
                                var item = [...this.dropDownMenu.querySelectorAll("LI")]
                                    .find(i => i.dataset.optionId == optionId);
                                var $item = $(item);
                                var $checkBox = $item.find('input[type="checkbox"]');
                                var $selectedItem = $(this.selectedPanel).find(`li[data-option-id="${optionId}"]`);
                                this.removeSelectedItem($selectedItem, optionId, $checkBox);
                            }
                        }
                        this.backspaceAtStartPoint = null;
                    } else if (event.which == 27 || event.keyCode == 27) { // escape
                        this.closeDropDown();
                    }

                });

                // Set on change for filter input
                $filterInput.on('input', (event) => { // keyup focus
                    //console.log('filterInput input');
                    this.adoptFilterInputLength();
                    this.filterDropDownMenu();
                    if (this.hasItems) {
                        this.updateDropDownPosition(); // support case when textbox can change its place because of line break (texbox grow with each key press)
                        this.showDropDown();
                    } else {
                        this.hideDropDown();
                    }
                });

                $filterInput.focusin((event) => {
                    $(this.selectedPanel).addClass("focus");
                });

                $filterInput.focusout((event) => {
                    if (!this.skipFocusout)
                        $(this.selectedPanel).removeClass("focus");
                });

                $container.mousedown((event) => {
                    this.skipFocusout = true;

                });

                $(window.document).mouseup((event) => {
                    this.skipFocusout = false;
                    if (!(this.container === event.target || this.container.contains(event.target))) {
                        //console.log("document mouseup outside container");
                        this.closeDropDown();
                    }
                });
            }
        }
    }

    var jQueryInterface = function (options) {
        return this.each(function () {
            let data = $(this).data(dataKey)

            if (!data) {
                if (/dispose|hide/.test(options)) {
                    return;
                }
                else {
                    const optionsObject = (typeof options === 'object')? options:null;
                    data = new Plugin(this, optionsObject);
                    $(this).data(dataKey, data);
                }
            }

            if (typeof options === 'string') {
                var methodName = options;
                if (typeof data[methodName] === 'undefined') {
                    throw new TypeError(`No method named "${methodName}"`)
                }
                data[methodName]()
            }
        })
    }

    $.fn[pluginName] = jQueryInterface;

    // in case of mulitple $(this) it will return 1st element plugin instance
    $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function (options) {
        return $(this).data("plugin_" + pluginName);
    };

    $.fn[pluginName].Constructor = Plugin;

    $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = JQUERY_NO_CONFLICT
        return jQueryInterface;
    }
    return Plugin;
})(window, $, Popper);

export default BsMultiSelect;
