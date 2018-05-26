import $ from 'jquery'
import Popper from 'popper.js'
import Bootstrap4Adapter from './Bootstrap4Adapter.es8'

// TODO: try to find convinient way to declare private members. Is it convinient enough to move them into IIFE?
const BsMultiSelect = ((window, $, Popper) => {
    const JQUERY_NO_CONFLICT = $.fn[pluginName];
    const pluginName = 'dashboardCodeBsMultiSelect';
    const dataKey = `plugin_${pluginName}`;

    const defSelectedPanelClass = 'form-control';
    const defSelectedPanelStyle = {'margin-bottom': '0'}; // 16 is for bootstrap reboot for UL
    const defSelectedPanelStyleSys = {'display': 'flex', "flex-wrap": "wrap"};

    const defFilterInputItemStyleSys = {'list-style-type':'none'}; 
    const defFilterInputStyleSys = {'width': '2ch', 'border': '0', 'padding': '0', 'outline': 'none'};
    
    const defDropDownMenuStyleSys =  {'list-style-type':'none'}; // ul usualy has bullets
    const defaults = {
        doManageFocus:true,
        //usePopper: true,
        selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
        selectedPanelReadonlyBackgroundColor: '#e9ecef',
        selectedPanelBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
        selectedPanelBorderColor: '#80bdff',
        selectedPanelValidBoxShadow: ' 0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
        selectedPanelInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
        filterInputColor: '#495057',
        containerClass: 'dashboardcode-bsmultiselect',
        dropDownMenuClass: 'dropdown-menu',
        dropDownItemClass: 'px-2',
        selectedPanelClass: '',
        selectedPanelFocusClass : '',
        selectedPanelReadonlyClass: '',
        selectedItemClass: '', 
        removeSelectedItemButtonClass: '',
        filterInputItemClass: '', 
        filterInputClass: ''
    };

    class Plugin {
        constructor(element, options) {
            if (typeof Popper === 'undefined') {
                throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
            }

            // readonly
            this.hiddenSelect = element;
            this.options = $.extend({}, defaults, options);
            this.jQuery = $;
            this.adapter = new Bootstrap4Adapter($, this.options, this.hiddenSelect);
            
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
            let offsetLeft = this.filterInputItem.offsetLeft;
            if (force || this.filterInputItemOffsetLeft!=offsetLeft){
                this.popper.update();
                this.filterInputItemOffsetLeft=offsetLeft;
            }
        }

        hideDropDown() {
            $(this.dropDownMenu).hide()
        }

        showDropDown() {
            this.updateDropDownPosition(true);
            $(this.dropDownMenu).show()
        }

        // Public methods
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
            this.hasItems = visible > 0;
            this.resetSelectDropDownMenu();
        }

        appendDropDownItem(optionElement) {
            let optionId = optionElement.value;
            let itemText = optionElement.text;
            let isSelected = optionElement.selected;
            let $dropDownItem = $("<li/>");
            $dropDownItem.data("option-id", optionId);
            $dropDownItem.data("option-text", itemText.toLowerCase());

            let adoptDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected)
            $dropDownItem.appendTo($(this.dropDownMenu));

            let appendItem = () => {
                $dropDownItem.data("option-selected", true);
                let $selectedItem = $("<li/>");
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
                };

                this.adapter.CreateSelectedItemContent(
                    $selectedItem, 
                    itemText, () => {
                        removeItem();
                        this.clearFilterInput(true);
                        this.updateDropDownPosition(false);
                        $(this.filterInput).focus();
                });
                $selectedItem.insertBefore(this.jQuery(this.filterInputItem));
                $dropDownItem.data("option-toggle", removeItem);
                $selectedItem.data("option-remove", removeItem);
                return $selectedItem;
            }
            $dropDownItem.data("option-toggle", () => appendItem());
            
            if (isSelected) {
                appendItem();
            }
        }

        adoptFilterInputLength() {
            this.filterInput.style.width = this.filterInput.value.length*1.3 + 2 + "ch";
        }

        resetSelectDropDownMenu() {
            if (this.selectedDropDownItem !== null) {
                this.adapter.Hover($(this.selectedDropDownItem), false);
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
                    this.adapter.Hover($(this.selectedDropDownItem), false);
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
                this.adapter.Hover($(this.selectedDropDownItem), true);
            }
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
            $selectedPanel.css(defSelectedPanelStyleSys);
            if (!this.options.selectedPanelClass){
                $selectedPanel.addClass(defSelectedPanelClass);
                $selectedPanel.css(defSelectedPanelStyle);
                $selectedPanel.css({"min-height":this.options.selectedPanelMinHeight});
            }
            else
                $selectedPanel.addClass(this.options.selectedPanelClass);
            $selectedPanel.appendTo(this.container);
            this.selectedPanel = $selectedPanel.get(0);
            this.adapter.Init($selectedPanel);
            

            let $filterInputItem = $('<li/>');
            this.filterInputItem = $filterInputItem.get(0)
            $filterInputItem.css(defFilterInputItemStyleSys)

            if (!this.options.filterInputItemClass)
                $filterInputItem.addClass(this.options.filterInputItemClass)
            
            $filterInputItem.appendTo(this.selectedPanel);
            

            let $filterInput = $('<input type="search" autocomplete="off">');
            if (!this.options.filterInputClass){
                $filterInput.css(defFilterInputStyleSys);
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
            $dropDownMenu.css(defDropDownMenuStyleSys);

            this.popper = new Popper(this.filterInput, this.dropDownMenu, {
                placement: 'bottom-start',
                modifiers: {
                    preventOverflow: {enabled:false},
                    hide: {enabled:false},
                    flip: { enabled:false }
                    }
            });
            
            // some browsers (IE11) can change select value ("autocomplete") after page is loaded but before "ready" event
            $(document).ready(() => {
                let selectOptions = $hiddenSelect.find('option');
                selectOptions.each(
                    (index, optionElement) => {
                        this.appendDropDownItem(optionElement);
                    }
                );
                this.hasItems = selectOptions.length > 0;
                this.updateDropDownPosition(false);

                $dropDownMenu.find('li').click(event => {
                    event.preventDefault();
                    event.stopPropagation();
                    let toggleItem = $(event.currentTarget).closest("LI").data("option-toggle");
                    toggleItem();
                    this.clearFilterInput(false); 
                    this.filterInput.focus(); 
                });

                $dropDownMenu.find("li").on("mouseover", event => {
                    this.adapter.Hover($(event.target).closest("li"), true);
                });

                $dropDownMenu.find("li").on("mouseout", event => {
                    this.adapter.Hover($(event.target).closest("li"), false);
                });

                if (disabled) {
                    this.filterInput.style.display = "none";
                    this.adapter.Enable($(this.selectedPanel), false);
                } else {
                    this.filterInput.style.display = "inline-block";
                    this.adapter.Enable($(this.selectedPanel), true);
                    
                    $selectedPanel.click((event) => {
                        if (event.target.nodeName != "INPUT")
                            $(this.filterInput).val('').focus();
                        if (this.hasItems)
                            if (this.adapter.FilterClick(event))
                                this.showDropDown();
                    });
    
                    $dropDownMenu.click((event) => {
                        event.stopPropagation();
                    });
    
                    $dropDownMenu.on("mouseover", () => {
                        this.resetSelectDropDownMenu();
                    });
    
                    if (this.options.doManageFocus)
                    {
                        $filterInput.focusin(() => {
                            this.adapter.Focus($selectedPanel, true);
                        });
    
                        $filterInput.focusout(() => {
                            if (!this.skipFocusout) {
                                this.adapter.Focus($selectedPanel, false);
                            }
                        });
    
                        $container.mousedown(() => {
                            this.skipFocusout = true;
                        });
    
                        $(window.document).mouseup(() => {
                            this.skipFocusout = false;
                        });
                    }
    
                    $(window.document).mouseup((event) => {
                        if (!(this.container === event.target || $.contains(this.container, event.target))) {
                            this.closeDropDown();
                        }
                    });
                }
            });

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
                        // detect that backspace is at start of input field (this will be used at keydown)
                        this.backspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                    }
                    this.resetSelectDropDownMenu();
                }
            });

            $filterInput.on("keyup", (event) => {
                if (event.which == 13 || event.which == 9 ) {
                    if (this.selectedDropDownItem) {
                        let $selectedDropDownItem = $(this.selectedDropDownItem);
                        let toggleItem =  $selectedDropDownItem.data("option-toggle");
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
                } else if (event.which == 8) {
                    if (this.filterInput.selectionEnd == 0 && this.filterInput.selectionStart == 0 && this.backspaceAtStartPoint) {
                        let $penult = $(this.selectedPanel).find("LI:last").prev();
                        if ($penult.length){
                            let removeItem = $penult.data("option-remove");
                            removeItem();
                        }
                    }
                    this.backspaceAtStartPoint = null;
                    //if ($dropDownMenu.is(':hidden'))
                    this.updateDropDownPosition(false);
                } else if (event.which == 27) { // escape
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
