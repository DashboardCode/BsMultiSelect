import Popper from 'popper.js'

const defSelectedPanelStyleSys = {'display':'flex', 'flex-wrap':'wrap', 'list-style-type':'none'};  // remove bullets since this is ul
const defFilterInputStyleSys   = {'width':'2ch', 'border':'0', 'padding':'0', 'outline':'none', 'background-color':'transparent' };
const defDropDownMenuStyleSys  = {'list-style-type':'none'}; // remove bullets since this is ul

// jQuery used for:
// $.extend, $.contains, $("<div>"), $(function(){}) aka ready
// $e.trigger, $e.unbind, $e.on; but namespaces are not used;
// events: "focusin", "focusout", "mouseover", "mouseout", "keydown", "keyup", "click"
// $e.show, $e.hide, $e.focus, $e.css
// $e.appendTo, $e.remove, $e.find, $e.closest, $e.prev, $e.data, $e.val

class MultiSelect {
    constructor(selectElement, options, onDispose, adapter, window, $) {
        if (typeof Popper === 'undefined') {
            throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
        }
        // readonly
        this.selectElement = selectElement;
        this.adapter = adapter;
        this.window = window;
        this.onDispose=onDispose;
        this.$ = $;
        
        this.options = $.extend({}, options);
        
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

        // jquery adapters
        this.$document= $(window.document);
        this.$selectElement = $(selectElement);
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
            this.adapter.HoverOut(this.$(this.hoveredDropDownItem));
            this.hoveredDropDownItem = null;
            this.hoveredDropDownIndex = null;
        }
    }

    filterDropDownMenu() {
        let text = this.filterInput.value.trim().toLowerCase();
        let visible = 0;
        this.$(this.dropDownMenu).find('LI').each((i, dropDownMenuItem) => {
            let $dropDownMenuItem = this.$(dropDownMenuItem);
            if (text == '') {
                $dropDownMenuItem.show();
                visible++;
            }
            else {
                let itemText = $dropDownMenuItem.data("option-text");
                let option = $dropDownMenuItem.data("option");
                if (!option.selected && !option.hidden && !option.disabled && itemText.indexOf(text)>=0) {
                    $dropDownMenuItem.show();
                    visible++;
                } else {
                    $dropDownMenuItem.hide();
                }
            }
        });
        this.hasDropDownVisible = visible > 0;
        this.resetDropDownMenuHover();
        if (visible == 1) {
            let visibleNodeListArray = this.getVisibleNodeListArray();
            this.hoverInInternal(visibleNodeListArray, 0)
        }
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
        let isHidden = optionElement.hidden;
        let itemText = optionElement.text;
        let $dropDownItem = this.$("<LI/>").prop("hidden", isHidden)
        $dropDownItem.data("option-text", itemText.toLowerCase()).appendTo(this.dropDownMenu);
        $dropDownItem.data("option", optionElement);

        let adjustDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionElement.value, itemText);
        let isDisabled = optionElement.disabled;
        let isSelected = optionElement.selected;

        if (isSelected && isDisabled)
            adjustDropDownItem.disabledStyle(true);
        else if (isDisabled)
            adjustDropDownItem.disable(isDisabled);
       
        adjustDropDownItem.onSelected(() => {
            let toggleItem = $dropDownItem.data("option-toggle");
            toggleItem();
            this.filterInput.focus();
        });
        
        let selectItem = (doPublishEvents) => {
            if (optionElement.hidden)
                return;
            let $selectedItem = this.$("<LI/>")
            
            let adjustPair =(isSelected, toggle, remove) => {
                optionElement.selected = isSelected;
                adjustDropDownItem.select(isSelected);
                $dropDownItem.data("option-toggle", toggle);                    
                $selectedItem.data("option-remove", remove)
            }

            let removeItem = () => {
                adjustDropDownItem.disabledStyle(false);
                adjustDropDownItem.disable(optionElement.disabled);
                adjustPair(
                    false, 
                    () => {
                        if (optionElement.disabled)
                            return;
                        selectItem(true);
                    }, 
                    null
                    )
                $selectedItem.remove();
                this.$selectElement.trigger('change');
            };
            
            let removeItemAndCloseDropDown = () => {
                removeItem();
                this.closeDropDown();
            };

            this.adapter.CreateSelectedItemContent(
                $selectedItem,
                itemText,
                removeItemAndCloseDropDown,
                this.disabled,
                optionElement.disabled
            );
            adjustPair(true, removeItem, removeItemAndCloseDropDown);
            $selectedItem.insertBefore(this.filterInputItem);
            if (doPublishEvents){
                this.$selectElement.trigger('change');
            }
        }

        $dropDownItem
            .mouseover(() => this.adapter.HoverIn($dropDownItem))
            .mouseout(() => this.adapter.HoverOut($dropDownItem));
        
        if (optionElement.selected)
            selectItem(false);
        else
            $dropDownItem.data("option-toggle",  () => { 
                if (optionElement.disabled)
                    return;
                selectItem(true);
            })
    }
    getVisibleNodeListArray(){
        return this.$(this.dropDownMenu).find('LI:not([style*="display: none"]):not(:hidden)').toArray();
    }
    hoverInInternal(visibleNodeListArray, index){
        this.hoveredDropDownIndex = index;
        this.hoveredDropDownItem = visibleNodeListArray[index];
        this.adapter.HoverIn(this.$(this.hoveredDropDownItem));
    }
    keydownArrow(down) {
        let visibleNodeListArray = this.getVisibleNodeListArray();
        if (visibleNodeListArray.length > 0) {
            if (this.hasDropDownVisible) {
                this.updateDropDownPosition(true);
                this.showDropDown();
            }
            let index;
            if (this.hoveredDropDownItem === null) {
                index = down ? 0 : visibleNodeListArray.length - 1;
            }
            else {
                this.adapter.HoverOut(this.$(this.hoveredDropDownItem));
                if (down) {
                    let newIndex = this.hoveredDropDownIndex + 1;
                    index = newIndex < visibleNodeListArray.length ? newIndex : 0;
                } else {
                    let newIndex = this.hoveredDropDownIndex - 1;
                    index = newIndex >= 0 ? newIndex : visibleNodeListArray.length - 1;
                }
            }
            this.hoverInInternal(visibleNodeListArray, index);
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
        let $selectedPanel = this.$(this.selectedPanel);
        this.adapter.UpdateIsValid($selectedPanel);
        this.UpdateSizeImpl($selectedPanel);
        this.UpdateDisabledImpl(this.$(this.container), $selectedPanel);
    }
    Dispose(){
        if (this.onDispose)
            this.onDispose();
        
        // removable handlers
        this.$document.unbind("mouseup", this.documentMouseup)
                      .unbind("mouseup", this.documentMouseup2);
        
        if (this.adapter !== null) {
            this.adapter.Dispose()
        }
        if (this.popper !== null) {
            this.popper.destroy()
        }
        
        if (this.container !== null) {
            this.$(this.container).remove();
        }
        // this.selectedPanel = null;
        // this.filterInputItem = null;
        // this.filterInput = null;
        // this.dropDownMenu = null;
        // this.selectElement = null;
        // this.options = null;
    }
    UpdateSize(){
        this.UpdateSizeImpl(this.$(this.selectedPanel));
    }
    UpdateDisabled(){
        this.UpdateDisabledImpl(this.$(this.container), this.$(this.selectedPanel));
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
                this.adapter.Disable($selectedPanel);

                $container.unbind("mousedown", this.containerMousedown);
                this.$document.unbind("mouseup", this.documentMouseup);

                $selectedPanel.unbind("click", this.selectedPanelClick);
                this.$document.unbind("mouseup", this.documentMouseup2);
                
            } else {
                this.filterInput.style.display = "inline-block";
                this.adapter.Enable($selectedPanel);

                $container.mousedown(this.containerMousedown);    // removable
                this.$document.mouseup(this.documentMouseup); // removable

                $selectedPanel.click(this.selectedPanelClick);     // removable
                this.$document.mouseup(this.documentMouseup2); // removable
            }
            this.disabled=disabled;
        }
    }
    init() {
        let $selectElement = this.$(this.selectElement);
        $selectElement.hide();
        let $container = this.$("<DIV/>");
        this.container = $container.get(0);
        let $selectedPanel = this.$("<UL/>");
        $selectedPanel.css(defSelectedPanelStyleSys);
        
        this.selectedPanel = $selectedPanel.get(0);
        
        $selectedPanel.appendTo(this.container);
        let $filterInputItem = this.$('<LI/>');
        this.filterInputItem = $filterInputItem.get(0)
        $filterInputItem.appendTo(this.selectedPanel);
        let $filterInput = this.$('<INPUT type="search" autocomplete="off">');
        $filterInput.css(defFilterInputStyleSys);
        $filterInput.appendTo(this.filterInputItem);
        this.filterInput = $filterInput.get(0);
        let $dropDownMenu = this.$("<UL/>")
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
            if (!(this.container === event.target || this.$.contains(this.container, event.target))) {
                this.closeDropDown();
            }
        }
        this.selectedPanelClick = event => {
            if (event.target.nodeName != "INPUT")
                this.$(this.filterInput).val('').focus();
            if (this.hasDropDownVisible && this.adapter.IsClickToOpenDropdown(event)){
                this.updateDropDownPosition(true);
                this.showDropDown();
            }
        };
        this.adapter.Init({
            container:$container, selectedPanel:$selectedPanel,
            filterInputItem:$filterInputItem, filterInput:$filterInput,
            dropDownMenu:$dropDownMenu });
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
        // FYI: $(() => { ...}) is jquery ready event shortcut
        this.$(() => {
            let selectOptions = $selectElement.find('OPTION');
            selectOptions.each(
                (index, el) => {
                    this.appendDropDownItem(el);
                }
            );
            this.hasDropDownVisible = selectOptions.length > 0;
            this.updateDropDownPosition(false);
        });
        // there was unmotivated stopPropagation call. 
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });
        $dropDownMenu.mouseover(() => this.resetDropDownMenuHover());

        $filterInput.focusin(() => this.adapter.FocusIn($selectedPanel))
                    .focusout(() => {
                            if (!this.skipFocusout)
                                this.adapter.FocusOut($selectedPanel)
                            });
        $filterInput.on("keydown", (event) => {
            if ([38, 40, 13].indexOf(event.which)>=0 || (event.which == 9 && this.filterInput.value) ) {
                event.preventDefault();
            }

            if (event.which == 38) {
                this.keydownArrow(false);
            }
            else if (event.which == 40) {
                if (this.hoveredDropDownItem === null && this.hasDropDownVisible) {
                    this.showDropDown();
                }
                this.keydownArrow(true);
            }
            else if (event.which == 9) {
                if (!this.filterInput.value) {
                    this.closeDropDown();
                }
            }
            else if (event.which == 8) {
                // NOTE: this will process backspace only if there are no text in the input field
                // If user will find this inconvinient, we will need to calculate something like this
                // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                if (!this.filterInput.value)
                {
                    let $penult = this.$(this.selectedPanel).find("LI:last").prev();
                    if ($penult.length){
                        let removeItem = $penult.data("option-remove");
                        removeItem();
                    }
                    this.updateDropDownPosition(false);
                }
            }

            if ([38, 40, 13, 9].indexOf(event.which)==-1)
                this.resetDropDownMenuHover();
        });
        $filterInput.on("keyup", (event) => {
            if (event.which == 13 || event.which == 9 ) {
                if (this.hoveredDropDownItem) {
                    let $hoveredDropDownItem = this.$(this.hoveredDropDownItem);
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
                        let $dropDownItem = this.$(dropDownItem);
                        let option = $dropDownItem.data("option");
                        if (!option.selected){
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

export default MultiSelect;
