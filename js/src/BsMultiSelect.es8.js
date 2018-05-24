import $ from 'jquery'
import Popper from 'popper.js'

// TODO: try to find convinient way to declare private members. Is it convinient enough to move them into IIFE?
const BsMultiSelect = ((window, $, Popper) => {
    const JQUERY_NO_CONFLICT = $.fn[pluginName];
    const pluginName = 'dashboardCodeBsMultiSelect';
    const dataKey = `plugin_${pluginName}`;

    const defFilterInputItemStyleSys = {'display': 'block'};
    const defSelectedPanelClass = 'form-control btn border';
    const defFilterInputStyle = {'width': '2ch', 'border': '0', 'padding': '0', 'outline': 'none'};
    const defSelectedPanelStyle = {'cursor': 'text', 'display': 'flex', "flex-wrap": "wrap", "align-items": "center", "margin-bottom": "0px"};
    const defSelectedItemClass = 'badge';
    const defSelectedItemStyle = {'padding-left': '0px', 'display': 'flex', 'align-items': 'center'};
    const defRemoveSelectedItemButtonClass = 'close';
    const defRemoveSelectedItemButtonStyle = {'line-height': '1rem', 'font-size':'1.3rem'};
    const defaults = {
        items: [],
        defaults: [],
        //usePopper: true,
        selectedPanelMinHeight: 'calc(2.25rem + 2px)',
        selectedPanelReadonlyBackgroundColor: '#e9ecef',
        selectedPanelValidBoxShadow: ' 0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
        selectedPanelInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
        filterInputColor: '#495057',
        containerClass: 'dashboardcode-bsmultiselect',
        dropDownMenuClass: 'dropdown-menu',
        dropDownItemClass: 'px-2',
        selectedPanelClass: '',
        selectedPanelReadonlyClass: '',
        selectedItemClass: '', 
        removeSelectedItemButtonClass: '',
        filterInputItemClass: '', 
        filterInputClass: ''
    };

    class Plugin {
        constructor(element, options) {
            if (typeof Popper === 'undefined') {
                throw new TypeError('DashboardCode bsMultiSelect require Popper.js (https://popper.js.org)')
            }

            // readonly
            this.element = element;
            this.options = $.extend({}, defaults, options);
            this.hiddenSelect = element;
            this.container = null;
            this.dropDownMenu = null;
            this.selectedPanel = null;
            this.filterInput = null;
            this.filterInputItem = null;
            this.popper = null;

            // state
            this.filterInputItemOffsetLeft = null;
            this.skipFocusout = false;
            this.backspaceAtStartPoint = null;
            this.selectedDropDownItem = null;
            this.selectedDropDownIndex = null;
            this.hasItems = false;

            this.init();
        }

        updateDropDownPosition(force) {
            //if (this.options.usePopper) {
            let offsetLeft = this.filterInputItem.offsetLeft;
            if (force || this.filterInputItemOffsetLeft!=offsetLeft){
                this.popper.update();
                this.filterInputItemOffsetLeft=offsetLeft;
            }
            // } else {
            //     $(this.dropDownMenu).dropdown('update');
            // }
        }

        hideDropDown() {
            //if (this.options.usePopper) {
                $(this.dropDownMenu).hide()
            // } else {
            //     if ($(this.dropDownMenu).hasClass('show'))
            //         $(this.dropDownMenu).dropdown('toggle');
            // }
        }

        showDropDown() {
                //if (this.options.usePopper) {
                    this.updateDropDownPosition(true);
                    $(this.dropDownMenu).show()
                // } else {
                //     if (!$(this.dropDownMenu).hasClass('show'))
                //         $(this.dropDownMenu).dropdown('toggle');
                // }
        }

        setCheck(optionId, isChecked) {
            for (let i = 0; i < this.hiddenSelect.options.length; i += 1) {
                let option = this.hiddenSelect.options[i];
                if (option.value == optionId) {
                    this.hiddenSelect.options[i].selected = isChecked;
                    break;
                }
            }
        }

        // Public methods
        getInputValue() {
            return $(this.hiddenSelect).val();
        }

        closeDropDown() {
            this.resetSelectDropDownMenu();
            this.clearFilterInput();
            this.hideDropDown();
            this.updateDropDownPosition();
        }

        clearFilterInput(updatePosition) {
            if (this.filterInput.value != '') {
                this.filterInput.value = '';
                this.adoptFilterInputLength();
                this.filterDropDownMenu();
                if (updatePosition && this.hasItems) {
                    this.updateDropDownPosition(false); 
                } 
            }
        }

        filterDropDownMenu() {
            let text = this.filterInput.value.trim();
            let visible = 0;
            $(this.dropDownMenu).find('li').each((i, item) => {
                let $item = $(item);
                if (text == '') {
                    $item.show();
                    visible++;
                }
                else {
                    let itemText = $item.text();
                    let $checkbox = $item.find('input[type="checkbox"]');
                    
                    if (!$checkbox.prop('checked') && itemText.toLowerCase().indexOf(text.toLowerCase())>=0) {
                        $item.show();
                        visible++;
                    } else {
                        $item.hide();
                    }
                }
            });
            this.hasItems = visible > 0;
            this.resetSelectDropDownMenu();
        }

        clickDropDownItem(event) {
            event.preventDefault();
            event.stopPropagation();

            let $menuItem = $(event.currentTarget).closest("LI");
            let optionId  = $menuItem.data("option-id");
            let $checkBox = $menuItem.find('input[type="checkbox"]');
            if ($checkBox.prop('checked')) {
                let $selectedItem = $(this.selectedPanel).find(`li[data-option-id="${optionId}"]`);
                this.removeSelectedItem($selectedItem, optionId, $checkBox);
            } else {
                let itemText = $menuItem.find('label').text();
                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                $checkBox.prop('checked', true);
            }
            this.clearFilterInput(false);
            this.filterInput.focus();
        }
        
        appendDropDownItem(itemValue, itemText, isChecked) {
            let optionId = itemValue;
            let checkBoxId = `dashboardcode-bsmultiselect-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
            let checked = isChecked ? "checked" : "";
            let $dropDownItem = $(
                `<li data-option-id="${optionId}">
                    <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" id="${checkBoxId}" ${checked}>
                        <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
                    </div>
                 </li>`).addClass(this.options.dropDownItemClass).appendTo($(this.dropDownMenu));
            
            let $checkBox = $dropDownItem.find(`input[type="checkbox"]`);
            if (isChecked) {
                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
            }
        }
        
        createAndAppendSelectedItem($checkBox, optionId, itemText) {
            let $selectedItem = $(`<li data-option-id="${optionId}"><span>${itemText}</span></li>`);
            if (!this.options.selectedItemClass){
                $selectedItem.addClass(defSelectedItemClass);
                $selectedItem.css(defSelectedItemStyle)
            }else{
                $selectedItem.addClass(this.options.selectedItemClass);
            }
                
            $selectedItem.insertBefore($(this.filterInputItem));
            let $buttom = $("<button aria-label='Close' tabIndex='-1' type='button'><span aria-hidden='true'>&times;</span></button>");
            if (!this.options.removeSelectedItemButtonClass){
                $buttom.addClass(defRemoveSelectedItemButtonClass);
                $buttom.css(defRemoveSelectedItemButtonStyle);
            }
            else{
                $buttom.addClass(this.options.removeSelectedItemButtonClass)
            }
            
            $buttom.appendTo($selectedItem); 
            this.setCheck(optionId, true);

            $buttom.click(() => {
                this.removeSelectedItem($selectedItem, optionId, $checkBox);
                this.clearFilterInput(true);
                this.updateDropDownPosition(false);
                $(this.filterInput).focus();
            });
        }

        adoptFilterInputLength() {
            this.filterInput.style.width = this.filterInput.value.length*1.3 + 2 + "ch";
        }

        analyzeInputText() {
            let text = this.filterInput.value.trim().toLowerCase();
            let nodeList = this.dropDownMenu.querySelectorAll("LI");
            let item = null;
            for (let i = 0; i < nodeList.length; ++i) {
                let it = nodeList[i];
                if (it.textContent.trim().toLowerCase() == text)
                {
                    item=it;
                    break;
                }
            }
            if (item) {
                let $item = $(item);
                let $checkBox = $item.find('input[type="checkbox"]');
                if (!$checkBox.prop('checked')) {
                    let optionId = $item.data('option-id');
                    let itemText = $item.find('label').text();
                    this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                    $checkBox.prop('checked', true);
                }
                this.clearFilterInput(true);
            }
        }

        resetSelectDropDownMenu() {
            if (this.selectedDropDownItem !== null) {
                this.selectedDropDownItem.classList.remove('bg-light');
                this.selectedDropDownItem.classList.remove('text-primary');
                this.selectedDropDownItem = null;
            }
            this.selectedDropDownIndex = null;
        }
        
        keydownArrow(down) {
            let visibleNodeListArray = $(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();
            if (visibleNodeListArray.length > 0) {
                if (this.hasItems) {
                    this.showDropDown();
                }
                if (this.selectedDropDownItem === null) {
                    this.selectedDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
                }
                else {
                    // IE10-11 doesn't support multiple arguments in classList remove 
                    this.selectedDropDownItem.classList.remove('bg-light');
                    this.selectedDropDownItem.classList.remove('text-primary');
                    if (down) {
                        let newIndex = this.selectedDropDownIndex + 1;
                        this.selectedDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
                    } else {
                        let newIndex = this.selectedDropDownIndex - 1;
                        this.selectedDropDownIndex = newIndex >= 0 ? newIndex : visibleNodeListArray.length - 1;
                    }
                }
                this.selectedDropDownItem = visibleNodeListArray[this.selectedDropDownIndex];
                // IE10-11 doesn't support multiple arguments in classList add 
                this.selectedDropDownItem.classList.add('text-primary');
                this.selectedDropDownItem.classList.add('bg-light');
            }
        }

        removeSelectedItem($selectedItem, optionId, $checkBox) {
            $selectedItem.remove();
            this.setCheck(optionId, false);
            $checkBox.prop('checked', false);
        }

        init() {
            let $hiddenSelect = $(this.hiddenSelect);
            $hiddenSelect.hide();
            let disabled = this.hiddenSelect.disabled;

            let $container = $("<div/>");
            $container.addClass(this.options.containerClass);
            $container.insertAfter($hiddenSelect);
                
            this.container = $container.get(0);

            let $selectedPanel = $("<ul/>");

            if (!this.options.selectedPanelClass){
                $selectedPanel.addClass(defSelectedPanelClass);
                $selectedPanel.css(defSelectedPanelStyle);
                $selectedPanel.css("min-height", this.options.selectedPanelMinHeight);
            }
            else
                $selectedPanel.addClass(this.options.selectedPanelClass);
            $selectedPanel.appendTo(this.container);
            this.selectedPanel = $selectedPanel.get(0);

            if ($hiddenSelect.hasClass("is-valid")){
                $selectedPanel.removeClass("border");
                $selectedPanel.addClass("is-valid");
                //$selectedPanel.removeClass("btn-outline-danger");
                //$selectedPanel.addClass("btn-outline-success");
            }
            
            if ($hiddenSelect.hasClass("is-invalid")){
                $selectedPanel.removeClass("border");
                $selectedPanel.addClass("is-invalid");
                //$selectedPanel.removeClass("btn-outline-success");
                //$selectedPanel.addClass("btn-outline-danger");
            }

            let $filterInputItem = $('<li/>');
            this.filterInputItem = $filterInputItem.get(0)
            if (!this.options.filterInputItemClass)
                $filterInputItem.css(defFilterInputItemStyleSys)
            else
                $filterInputItem.addClass(this.options.filterInputItemClass)
            
            $filterInputItem.appendTo(this.selectedPanel);
            

            let $filterInput = $('<input type="search" autocomplete="off">');
            if (!this.options.filterInputClass){
                $filterInput.css(defFilterInputStyle);
                $filterInput.css("color", this.options.filterInputColor);
            } else {
                $filterInput.addClass(this.options.filterInputClass);
            }
            $filterInput.appendTo(this.filterInputItem);
            this.filterInput = $filterInput.get(0);

            let $dropDownMenu = $("<ul/>")
                .css({"display":"none"})
                .appendTo($container);
            this.dropDownMenu = $dropDownMenu.get(0);

            $dropDownMenu.addClass(this.options.dropDownMenuClass);
            // prevent heavy understandable styling error
            $dropDownMenu.css({"list-style-type":"none"});
            //if (this.options.usePopper) {
                this.popper = new Popper(this.filterInput, this.dropDownMenu, {
                    placement: 'bottom-start',
                    modifiers: {
                        preventOverflow: {enabled:false},
                        hide: {enabled:false},
                        flip: { enabled:false }
                     }
                });
            // } else {
            //     $(this.dropDownMenu).addClass("dropdown dropdown-menu")
            //     $(this.dropDownMenu).data("", "");
            //     $(this.dropDownMenu).dropdown({
            //         placement: 'bottom-start',
            //         flip: false,
            //         reference: this.filterInput
            //     });
            // }
            
            // some browsers (IE11) can change select value ("autocomplet") after page is loaded but before "ready" event
            $(document).ready(() => {
                if (!this.options.items) {
                    this.options.items.forEach((item) => {
                        let itemValue = item.value;
                        let itemText = item.text;
                        let isChecked = item.isChecked;
                        this.appendDropDownItem(itemValue, itemText, isChecked);
                    });
                    this.hasItems = this.options.items.length > 0;
                } else {
                    let selectOptions = $hiddenSelect.find('option');
                    selectOptions.each(
                        (index, option) => {
                            let itemValue = option.value;
                            let itemText = option.text;
                            let isChecked = option.selected;
                            this.appendDropDownItem(itemValue, itemText, isChecked);
                        }
                    );
                    this.hasItems = selectOptions.length > 0;
                }
                this.updateDropDownPosition(false);

                $dropDownMenu.find('li').click(event => {
                    this.clickDropDownItem(event);
                });

                $dropDownMenu.find("li").on("mouseover", event => {
                    $(event.target).closest("li").addClass('text-primary').addClass('bg-light')
                });

                $dropDownMenu.find("li").on("mouseout", event => {
                    $(event.target).closest("li").removeClass('text-primary').removeClass('bg-light')
                });
            });

            if (disabled) {
                this.filterInput.style.display = "none";
                if(!this.options.selectedPanelReadonlyClass){
                    $selectedPanel.css({"background-color": this.options.selectedPanelReadonlyBackgroundColor});
                }else{
                    $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
                }
                $selectedPanel.find('button').prop("disabled", true);
                $selectedPanel.addClass();
            } else {
                let inputId = this.hiddenSelect.id;
                let $formGroup = $hiddenSelect.closest(".form-group");
                if ($formGroup.length == 1) {
                    let $label = $formGroup.find(`label[for="${inputId}"]`);
                    let f = $label.attr("for");
                    if (f == this.hiddenSelect.id) {
                        this.filterInput.id = "dashboardcode-bsmultiselect-generated-filter-id-" + this.hiddenSelect.id;
                        $label.attr("for", this.filterInput.id);
                    }
                }

                $dropDownMenu.click((event) => {
                    event.stopPropagation();
                });

                $dropDownMenu.on("mouseover", () => {
                    this.resetSelectDropDownMenu();
                });

                $selectedPanel.click((event) => {
                    if (event.target.nodeName != "INPUT")
                        $(this.filterInput).val('').focus();
                    if (!(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON")) && this.hasItems)
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
                    else if (event.which == 13 || event.keyCode == 13) {
                        event.preventDefault();
                    }
                    else if (event.which == 9 || event.keyCode == 9) {
                        if (this.filterInput.value) {
                            event.preventDefault();
                        }
                        else {
                            this.closeDropDown();
                        }
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
                        if (this.selectedDropDownItem) {
                            let $item = $(this.selectedDropDownItem);
                            let $checkBox = $item.find('input[type="checkbox"]');
                            let optionId = $item.data('option-id');
                            if (!$checkBox.prop('checked')) {
                                let itemText = $item.find('label').text();
                                this.createAndAppendSelectedItem($checkBox, optionId, itemText);
                                $checkBox.prop('checked', true);
                                this.resetSelectDropDownMenu();
                            } else {
                                let $selectedItem = $(this.selectedPanel).find(`LI[data-option-id="${optionId}"]:first`);
                                this.removeSelectedItem($selectedItem, optionId, $checkBox);
                            }
                            if (event.which == 13 || event.keyCode == 13) {
                                this.closeDropDown();
                            }
                            //this.resetSelectDropDownMenu();
                        } else {
                            this.analyzeInputText();
                        }
                        if (event.which == 9 || event.keyCode == 9) {
                            this.closeDropDown();
                        }
                    } else if (event.which == 8 || event.keyCode == 8) {
                        let startPosition = this.filterInput.selectionStart;
                        let endPosition = this.filterInput.selectionEnd;
                        if (endPosition == 0 && startPosition == 0 && this.backspaceAtStartPoint) {
                            let $selectedPanel = $(this.selectedPanel);
                            let array = $selectedPanel.find("LI").toArray();
                            if (array.length >= 2) {
                                let itemToDelete = array[array.length - 2];
                                let $itemToDelete = $(itemToDelete);
                                let optionId = $itemToDelete.data("option-id");
                                let $item = $dropDownMenu.find(`LI[data-option-id="${optionId}"]:first`);
                                let $checkBox = $item.find('input[type="checkbox"]:first');
                                let $selectedItem = $selectedPanel.find(`LI[data-option-id="${optionId}"]:first`);
                                this.removeSelectedItem($selectedItem, optionId, $checkBox);
                            }
                        }
                        this.backspaceAtStartPoint = null;
                        //if ($dropDownMenu.is(':hidden'))
                        this.updateDropDownPosition(false);
                    } else if (event.which == 27 || event.keyCode == 27) { // escape
                        this.closeDropDown();
                    }
                });

                // Set on change for filter input
                $filterInput.on('input', () => { 
                    this.adoptFilterInputLength();
                    this.filterDropDownMenu();
                    if (this.hasItems) {
                        this.updateDropDownPosition(false); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
                        this.showDropDown();
                    } else {
                        this.hideDropDown();
                    }
                });

                $filterInput.focusin(() => {
                    if ($selectedPanel.hasClass("is-valid") &&  this.options.selectedPanelValidBoxShadow){
                        $selectedPanel.css("box-shadow", this.options.selectedPanelValidBoxShadow);              
                    } else if ($selectedPanel.hasClass("is-invalid") && this.options.selectedPanelInvalidBoxShadow){
                        $selectedPanel.css("box-shadow", this.options.selectedPanelInvalidBoxShadow);
                    }
                    $(this.selectedPanel).addClass("focus");
                });

                $filterInput.focusout(() => {
                    if (!this.skipFocusout) {
                        $selectedPanel.css("box-shadow", "" );                
                        $(this.selectedPanel).removeClass("focus");
                    }
                });

                $container.mousedown(() => {
                    this.skipFocusout = true;
                });

                $(window.document).mouseup((event) => {
                    this.skipFocusout = false;
                    if (!(this.container === event.target || $.contains(this.container, event.target))) {
                        this.closeDropDown();
                    }
                });
            }
        }
    }

    function jQueryInterface(options) {
        return this.each(function () {
            let data = $(this).data(dataKey)

            if (!data) {
                if (/dispose|hide/.test(options)) {
                    return;
                }
                const optionsObject = (typeof options === 'object')?options:null;
                data = new Plugin(this, optionsObject);
                $(this).data(dataKey, data);
            }

            if (typeof options === 'string') {
                let methodName = options;
                if (typeof data[methodName] === 'undefined') {
                    throw new TypeError(`No method named "${methodName}"`)
                }
                data[methodName]()
            }
        })
    }

    $.fn[pluginName] = jQueryInterface;

    // in case of mulitple $(this) it will return 1st element plugin instance
    $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function () {
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
