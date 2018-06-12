import $ from 'jquery'
import Popper from 'popper.js'
import Bs4AdapterCss from './Bs4AdapterCss.es8'
import Bs4Adapter from './Bs4Adapter.es8'

// TODO: try to find convinient way to declare private members. Is it convinient enough to move them into IIFE?
const BsMultiSelect = ((window, $, Popper) => {
    const JQUERY_NO_CONFLICT = $.fn[pluginName];
    const pluginName = 'dashboardCodeBsMultiSelect';
    const dataKey = `${pluginName}`;

    const defSelectedPanelStyleSys = {'display':'flex', 'flex-wrap':'wrap', 'list-style-type':'none'};  // remove bullets since this is ul
    const defFilterInputStyleSys   = {'width':'2ch', 'border':'0', 'padding':'0', 'outline':'none', 'background-color':'transparent' };
    const defDropDownMenuStyleSys  = {'list-style-type':'none'}; // remove bullets since this is ul

    const defaults = {
        doManageFocus:true,
        useCss:false,
        adapter:null
    }

    class Plugin {
        constructor(selectElement, options, adapter) {
            if (typeof Popper === 'undefined') {
                throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
            }

            // readonly
            this.selectElement = selectElement;
            this.options = $.extend({}, defaults, options);

            if (adapter)
                this.adapter = adapter;
            else
                this.adapter = this.options.useCss?new Bs4AdapterCss($, this.selectElement, this.options):new Bs4Adapter($, this.selectElement, this.options);
            
            this.container = null;
            this.selectedPanel = null;
            this.filterInputItem = null;
            this.filterInput = null;
            this.dropDownMenu = null;
            this.popper = null;

            // removable handlers
            this.selectedPanelClick  = null;
            this.documentMouseup   = null;
            this.containerMousedown   = null;
            this.documentMouseup2   = null;

            // state
            this.disabled=null;
            this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
            this.skipFocusout = false;
            this.hoveredDropDownItem = null;
            this.hoveredDropDownIndex = null;
            this.hasDropDownVisible = false;
            this.init();
        }

        updateDropDownPosition(force) {
            let offsetLeft = this.filterInputItem.offsetLeft;
            if (force || this.filterInputItemOffsetLeft!=offsetLeft){
                this.popper.update();
                this.filterInputItemOffsetLeft=offsetLeft;
            }
        }

        hideDropDown() {
            this.dropDownMenu.style.display = 'none';
        }

        showDropDown() {
            this.dropDownMenu.style.display = 'block';
        }

        // Public methods
        resetDropDownMenuHover() {
            if (this.hoveredDropDownItem !== null) {
                this.adapter.Hover($(this.hoveredDropDownItem), false);
                this.hoveredDropDownItem = null;
            }
            this.hoveredDropDownIndex = null;
        }

        filterDropDownMenu() {
            let text = this.filterInput.value.trim().toLowerCase();
            let visible = 0;
            $(this.dropDownMenu).find('LI').each((i, dropDownMenuItem) => {
                let $dropDownMenuItem = $(dropDownMenuItem);
                if (text == '') {
                    $dropDownMenuItem.show();
                    visible++;
                }
                else {
                    let itemText = $dropDownMenuItem.data("option-text");
                    let isSelected = $dropDownMenuItem.data("option-selected");
                    if (!isSelected && itemText.indexOf(text)>=0) {
                        $dropDownMenuItem.show();
                        visible++;
                    } else {
                        $dropDownMenuItem.hide();
                    }
                }
            });
            this.hasDropDownVisible = visible > 0;
            this.resetDropDownMenuHover();
        }

        clearFilterInput(updatePosition) {
            if (this.filterInput.value) {
                this.filterInput.value = '';
                this.input(updatePosition);
            }
        }

        closeDropDown() {
            this.resetDropDownMenuHover();
            this.clearFilterInput(true);
            this.hideDropDown();
        }

        appendDropDownItem(optionElement) {
            let optionId = optionElement.value;
            let itemText = optionElement.text;
            let isSelected = optionElement.selected;
            let $dropDownItem = $("<LI/>");
            $dropDownItem.data("option-id", optionId);
            $dropDownItem.data("option-text", itemText.toLowerCase());

            let adoptDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected)
            $dropDownItem.appendTo(this.dropDownMenu);

            let appendItem = (doTrigger) => {
                $dropDownItem.data("option-selected", true);
                let $selectedItem = $("<LI/>");
                $selectedItem.data("option-id", optionId);
                optionElement.selected = true;
                adoptDropDownItem(true);

                let removeItem = () => {
                    $dropDownItem.data("option-selected", false);
                    $dropDownItem.data("option-toggle", appendItem);
                    $selectedItem.data("option-remove", null);
                    $selectedItem.remove();
                    optionElement.selected = false;
                    adoptDropDownItem(false);
                    $(this.selectElement).trigger('change');
                };
                let removeItemAndCloseDropDown = () => {
                    removeItem();
                    this.closeDropDown();
                };
                this.adapter.CreateSelectedItemContent(
                    $selectedItem,
                    itemText,
                    removeItemAndCloseDropDown,
                    this.disabled
                );
                $selectedItem.insertBefore(this.filterInputItem);
                $dropDownItem.data("option-toggle", removeItem);
                $selectedItem.data("option-remove", removeItemAndCloseDropDown);
                if (typeof doTrigger === "undefined" || doTrigger===true)
                     $(this.selectElement).trigger('change');
                return $selectedItem;
            }
            $dropDownItem.data("option-toggle", appendItem );
            
            if (isSelected) {
                appendItem(false);
            }
            let manageHover = (event, isOn) => {
                this.adapter.Hover($(event.target).closest("LI"), isOn)
            }
            $dropDownItem.click(event => {
                event.preventDefault();
                event.stopPropagation();
                let toggleItem = $(event.currentTarget).closest("LI").data("option-toggle");
                toggleItem();
                this.filterInput.focus();
            }).mouseover(e => manageHover(e, true)).mouseout(e => manageHover(e, false));
        }

        keydownArrow(down) {
            let visibleNodeListArray = $(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();
            if (visibleNodeListArray.length > 0) {
                if (this.hasDropDownVisible) {
                    this.updateDropDownPosition(true);
                    this.showDropDown();
                }
                if (this.hoveredDropDownItem === null) {
                    this.hoveredDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
                }
                else {
                    this.adapter.Hover($(this.hoveredDropDownItem), false);
                    if (down) {
                        let newIndex = this.hoveredDropDownIndex + 1;
                        this.hoveredDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
                    } else {
                        let newIndex = this.hoveredDropDownIndex - 1;
                        this.hoveredDropDownIndex = newIndex >= 0 ? newIndex : visibleNodeListArray.length - 1;
                    }
                }
                this.hoveredDropDownItem = visibleNodeListArray[this.hoveredDropDownIndex];
                this.adapter.Hover($(this.hoveredDropDownItem), true);
            }
        }

        input(forceUpdatePosition) {
            this.filterInput.style.width = this.filterInput.value.length*1.3 + 2 + "ch";
            this.filterDropDownMenu();
            if (this.hasDropDownVisible) {
                if (forceUpdatePosition) // ignore it if it is called from
                    this.updateDropDownPosition(forceUpdatePosition); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
                this.showDropDown();
            } else {
                this.hideDropDown();
            }
        }

        Update(){
            let $selectedPanel = (this.selectedPanel);
            this.adapter.UpdateIsValid($selectedPanel);
            this.UpdateSizeImpl($selectedPanel);
            this.UpdateDisabledImpl($(this.container), $selectedPanel);
        }

        Dispose(){
            $.removeData(this.selectElement, dataKey);
            $(this.selectElement).off(dataKey)

            // removable handlers
            //$(window.selectedPanelClick).unbind("click", this.selectedPanelClick);
            $(window.document).unbind("mouseup", this.documentMouseup);
            //$(this.container).unbind("mousedown", this.containerMousedown);
            $(window.document).unbind("mouseup", this.documentMouseup2);
            
            if (this.adapter !== null) {
                this.adapter.Dispose()
            }

            if (this.popper !== null) {
                this.popper.destroy()
            }
            
            if (this.container !== null) {
                $(this.container).remove();
            }

            // this.selectedPanel = null;
            // this.filterInputItem = null;
            // this.filterInput = null;
            // this.dropDownMenu = null;
            // this.selectElement = null;
            // this.options = null;
        }

        UpdateSize(){
            this.UpdateSizeImpl($(this.selectedPanel));
        }

        UpdateDisabled(){
            this.UpdateDisabledImpl($(this.container), $(this.selectedPanel));
        }

        UpdateSizeImpl($selectedPanel){
            if (this.adapter.UpdateSize)
                this.adapter.UpdateSize($selectedPanel);
        }

        UpdateDisabledImpl($container, $selectedPanel){
            let disabled = this.selectElement.disabled;
            if (this.disabled!==disabled){
                if (disabled) {
                    this.filterInput.style.display = "none";
                    this.adapter.Enable($selectedPanel, false);

                    if (this.options.doManageFocus){
                        $container.unbind("mousedown", this.containerMousedown);
                        $(window.document).unbind("mouseup", this.documentMouseup);
                    }
                    $selectedPanel.unbind("click", this.selectedPanelClick);
                    $(window.document).unbind("mouseup", this.documentMouseup2);
                    
                } else {
                    this.filterInput.style.display = "inline-block";
                    this.adapter.Enable($selectedPanel, true);

                    if (this.options.doManageFocus) {
                        $container.mousedown(this.containerMousedown);    // removable
                        $(window.document).mouseup(this.documentMouseup); // removable
                    }
                    $selectedPanel.click(this.selectedPanelClick);     // removable
                    $(window.document).mouseup(this.documentMouseup2); // removable
                }
                this.disabled=disabled;
            }
        }

        init() {
            let $selectElement = $(this.selectElement);
            $selectElement.hide();

            let $container = $("<DIV/>");
            this.container = $container.get(0);

            let $selectedPanel = $("<UL/>");
            $selectedPanel.css(defSelectedPanelStyleSys);
            
            this.selectedPanel = $selectedPanel.get(0);
            
            $selectedPanel.appendTo(this.container);

            let $filterInputItem = $('<LI/>');
            this.filterInputItem = $filterInputItem.get(0)

            $filterInputItem.appendTo(this.selectedPanel);

            let $filterInput = $('<INPUT type="search" autocomplete="off">');
            $filterInput.css(defFilterInputStyleSys);
            $filterInput.appendTo(this.filterInputItem);
            this.filterInput = $filterInput.get(0);

            let $dropDownMenu = $("<UL/>")
                .css({"display":"none"})
                .appendTo($container);
            this.dropDownMenu = $dropDownMenu.get(0);
            
            // prevent heavy understandable styling error
            $dropDownMenu.css(defDropDownMenuStyleSys);

            // create handlers
            this.documentMouseup = () => {
                this.skipFocusout = false;
            }
    
            this.containerMousedown = () => {
                this.skipFocusout = true;
            };

            this.documentMouseup2 = event => {
                if (!(this.container === event.target || $.contains(this.container, event.target))) {
                    this.closeDropDown();
                }
            }

            this.selectedPanelClick = event => {
                if (event.target.nodeName != "INPUT")
                    $(this.filterInput).val('').focus();
                if (this.hasDropDownVisible && this.adapter.FilterClick(event)){
                    this.updateDropDownPosition(true);
                    this.showDropDown();
                }
            };

            this.adapter.Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu);
            $container.insertAfter($selectElement);
            
            this.popper = new Popper(this.filterInput, this.dropDownMenu, {
                placement: 'bottom-start',
                modifiers: {
                    preventOverflow: {enabled:false},
                    hide: {enabled:false},
                    flip: { enabled:false }
                    }
            });
            this.adapter.UpdateIsValid($selectedPanel);
            this.UpdateSizeImpl($selectedPanel);
            this.UpdateDisabledImpl($container, $selectedPanel);

            // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
            $(document).ready(() => {
                let selectOptions = $selectElement.find('OPTION');
                selectOptions.each(
                    (index, optionElement) => {
                        this.appendDropDownItem(optionElement);
                    }
                );
                this.hasDropDownVisible = selectOptions.length > 0;
                this.updateDropDownPosition(false);
            });

            $dropDownMenu.click( event => event.stopPropagation());

            $dropDownMenu.mouseover(() => this.resetDropDownMenuHover());

            if (this.options.doManageFocus)
            {
                $filterInput.focusin(() => this.adapter.Focus($selectedPanel, true))
                            .focusout(() => {
                                if (!this.skipFocusout)
                                    this.adapter.Focus($selectedPanel, false)
                                });
            }

            $filterInput.on("keydown", (event) => {
                if (event.which == 38) {
                    event.preventDefault();
                    this.keydownArrow(false);
                }
                else if (event.which == 40) {
                    event.preventDefault()
                    this.keydownArrow(true);
                }
                else if (event.which == 13) {
                    event.preventDefault();
                }
                else if (event.which == 9) {
                    if (this.filterInput.value) {
                        event.preventDefault();
                    }
                    else {
                        this.closeDropDown();
                    }
                }
                else {
                    if (event.which == 8) {
                        // NOTE: this will process backspace only if there are no text in the input field
                        // If user will find this inconvinient, we will need to calculate something like this
                        // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                        if (!this.filterInput.value)
                        {
                            let $penult = $(this.selectedPanel).find("LI:last").prev();
                            if ($penult.length){
                                let removeItem = $penult.data("option-remove");
                                removeItem();
                            }
                            this.updateDropDownPosition(false);
                        }
                    }
                    this.resetDropDownMenuHover();
                }
            });

            $filterInput.on("keyup", (event) => {
                if (event.which == 13 || event.which == 9 ) {
                    if (this.hoveredDropDownItem) {
                        let $hoveredDropDownItem = $(this.hoveredDropDownItem);
                        let toggleItem =  $hoveredDropDownItem.data("option-toggle");
                        toggleItem();
                        this.closeDropDown();
                    } else {
                        let text = this.filterInput.value.trim().toLowerCase();
                        let dropDownItems = this.dropDownMenu.querySelectorAll("LI");
                        let dropDownItem = null;
                        for (let i = 0; i < dropDownItems.length; ++i) {
                            let it = dropDownItems[i];
                            if (it.textContent.trim().toLowerCase() == text)
                            {
                                dropDownItem=it;
                                break;
                            }
                        }
                        if (dropDownItem) {
                            let $dropDownItem = $(dropDownItem);
                            let isSelected = $dropDownItem.data("option-selected");
                            if (!isSelected){
                                let toggle = $dropDownItem.data("option-toggle");
                                toggle();
                            }
                            this.clearFilterInput(true);
                        }
                    }
                }
                else if (event.which == 27) { // escape
                    this.closeDropDown();
                }
            });

            $filterInput.on('input', () => {
                this.input(true);
            });
        }
    }

    function jQueryInterface(options) {
        return this.each(function () {
            let data = $(this).data(dataKey)

            if (!data) {
                if (/Dispose/.test(options)) {
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

    // pluginName with first capitalized letter - return plugin instance for 1st $selected item
    $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function () {
        return $(this).data(dataKey);
    };

    $.fn[pluginName].Constructor = Plugin;

    $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = JQUERY_NO_CONFLICT
        return jQueryInterface;
    }
    return Plugin;
})(window, $, Popper);

export default BsMultiSelect;
