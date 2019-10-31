import Popper from 'popper.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul


// jQuery used for:
// $.contains, $("<div>"), $(function(){}) aka ready
// $e.unbind, $e.on; but namespaces are not used;
// events: "focusin", "focusout", "mouseover", "mouseout", "keydown", "keyup", "click"
// $e.show, $e.hide, $e.focus, $e.css
// $e.appendTo, $e.remove, $e.find, $e.closest, $e.prev, $e.data, $e.val

class MultiSelect {
    constructor(optionsAdapter, styling, selectedItemContentFactory, dropDownItemContentFactory, labelAdapter, 
        createStylingComposite,
        configuration, onDispose, window, $) {
        if (typeof Popper === 'undefined') {
            throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
        }
        // readonly
        this.optionsAdapter = optionsAdapter;
        this.container = optionsAdapter.container; // part of published api
        this.styling = styling;
        this.labelAdapter=labelAdapter;
        this.window = window;
        this.document = window.document;
        this.onDispose=onDispose;
        this.createStylingComposite=createStylingComposite;
        
        this.configuration = configuration;
        
        this.selectedPanel = null;
        this.filterInputItem = null;
        this.filterInput = null;
        this.dropDownMenu = null;
        this.popper = null;
        this.getDisabled=null;
        this.stylingComposite = null;

        // removable handlers
        this.selectedPanelClick  = null;
        this.documentMouseup = null;
        this.containerMousedown = null;
        this.documentMouseup2 = null;
        
        // state
        this.disabled = null;
        this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
        this.skipFocusout = false;
        this.hoveredDropDownItem = null;
        this.hoveredDropDownIndex = null;
        this.hasDropDownVisible = false;
        this.selectedItemContentFactory=selectedItemContentFactory;
        this.dropDownItemContentFactory=dropDownItemContentFactory;

        // jquery adapters
        this.$ = $;
        
        //optionsAdapter(this.fillContainer, this.init);
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
            this.styling.HoverOut(this.hoveredDropDownItem);
            this.hoveredDropDownItem = null;
            this.hoveredDropDownIndex = null;
        }
    }

    filterDropDownMenu() {
        let text = this.filterInput.value.trim().toLowerCase();
        let visible = 0;
        var dropDownMenuItems = this.dropDownMenu.getElementsByTagName('LI');
        for(let i=0;i<dropDownMenuItems.length; i++)
        {
            let dropDownMenuItem = dropDownMenuItems[i];
            
            if (text == '') {
                dropDownMenuItem.style.display='block';
                visible++;
            }
            else {
                let itemText = dropDownMenuItem.MultiSelectData.optionText; 
                let option = dropDownMenuItem.MultiSelectData.option; 
                if (!option.selected && !option.hidden && !option.disabled && itemText.indexOf(text)>=0) {
                    dropDownMenuItem.style.display='block';
                    visible++;
                } else {
                    dropDownMenuItem.style.display='none';
                }
            }
        }
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

        var dropDownItem=this.document.createElement('LI');
        dropDownItem.hidden=isHidden;
        
        var MultiSelectData={
            optionText: itemText.toLowerCase(), 
            option:optionElement, 
            optionToggle:null,
            optionRemove:null,
            optionDisable:null,
        };
        dropDownItem.MultiSelectData=MultiSelectData;
        this.dropDownMenu.appendChild(dropDownItem); 
        
        
        let adjustDropDownItem = this.dropDownItemContentFactory(dropDownItem, optionElement); 
        let isDisabled = optionElement.disabled;
        let isSelected = optionElement.selected;

        if (isSelected && isDisabled)
            adjustDropDownItem.disabledStyle(true);
        else if (isDisabled)
            adjustDropDownItem.disable(isDisabled);
       
        adjustDropDownItem.onSelected(() => {
            let toggleItem = dropDownItem.MultiSelectData.optionToggle;
            toggleItem();
            this.filterInput.focus();
        });
        
        let selectItem = (doPublishEvents) => {
            if (optionElement.hidden)
                return;
            var selectedItem = this.document.createElement('LI');
            selectedItem.MultiSelectData=MultiSelectData;
            let adjustPair =(isSelected, toggle, remove, disable) => {
                optionElement.selected = isSelected;
                adjustDropDownItem.select(isSelected);
                MultiSelectData.optionToggle=toggle;
                MultiSelectData.optionRemove=remove;
                MultiSelectData.optionDisable=disable;
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
                    null,
                    null
                    );
                selectedItem.parentNode.removeChild(selectedItem);
                this.optionsAdapter.triggerChange();
            };
            
            // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
            // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
            // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
            // because of the event's bubling process removeSelectedItem runs first. 
            // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
            // before we could analize is it belong to our dropdown or not.
            // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
            // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
            // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
            // the situation described above: click outside dropdown on the same component.
            // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target that belomgs to DOM (e.g. panel)

            let removeItemAndCloseDropDown = () => {
                removeItem();
                this.closeDropDown();
            };

            let onRemoveItemEvent = (jqEvent) => {
                setTimeout( ()=> {  
                    removeItem();
                    this.closeDropDown();
                }, 0);
                this.ProcessedBySelectedItemContentEvent=jqEvent;
            };

            let bsSelectedItemContent = this.selectedItemContentFactory(
                selectedItem,
                optionElement,
                onRemoveItemEvent
            );
            //bsSelectedItemContentList.push(bsSelectedItemContent);
            bsSelectedItemContent.disable(this.disabled);
            adjustPair(true, ()=>removeItem(), removeItemAndCloseDropDown, bsSelectedItemContent.disable);
            //$selectedItem.insertBefore(this.filterInputItem);
            this.selectedPanel.insertBefore(selectedItem, this.filterInputItem);
            if (doPublishEvents){
                this.optionsAdapter.triggerChange();
            }
        }

        this.$(dropDownItem)
            .mouseover(() => this.styling.HoverIn(dropDownItem))
            .mouseout(() => this.styling.HoverOut(dropDownItem));
        
        if (optionElement.selected)
            selectItem(false);
        else
            MultiSelectData.optionToggle= () => { 
                if (optionElement.disabled)
                    return;
                selectItem(true);
            }
    }
    getVisibleNodeListArray(){
        return this.$(this.dropDownMenu).find('LI:not([style*="display: none"]):not(:hidden)').toArray();
    }
    hoverInInternal(visibleNodeListArray, index){
        this.hoveredDropDownIndex = index;
        this.hoveredDropDownItem = visibleNodeListArray[index];
        this.styling.HoverIn(this.hoveredDropDownItem);
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
                this.styling.HoverOut(this.hoveredDropDownItem);
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
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        this.UpdateSize();
        this.UpdateDisabled();
    }
    Dispose(){
        if (this.onDispose)
            this.onDispose(); // primary used to remove from jQuery tables
        
        // removable handlers
        this.$(this.document).unbind("mouseup", this.documentMouseup)
                      .unbind("mouseup", this.documentMouseup2);
        
        this.labelAdapter.dispose();
        
        if (this.popper !== null) {
            this.popper.destroy()
        }
        
        if (this.optionsAdapter.dispose) {
            this.optionsAdapter.dispose();
        }
    }
    UpdateSize(){
        if (this.styling.UpdateSize)
            this.styling.UpdateSize(this.stylingComposite);
    }

    UpdateDisabled(){
        let disabled = this.optionsAdapter.getDisabled();
        let itarate = (isDisabled)=>{
            let selectedPanelItems = this.selectedPanel.getElementsByTagName('LI'); // TODO : improove
            for(let i =0; i<selectedPanelItems.length; i++)
            {
                let selectedPanelItem = selectedPanelItems[i];
                if (selectedPanelItem.MultiSelectData)
                    selectedPanelItem.MultiSelectData.optionDisable(isDisabled); 
            }
        }
        if (this.disabled!==disabled){
            if (disabled) {
                this.filterInput.style.display = "none";
                this.styling.Disable(this.stylingComposite);
                itarate(true);
                    
                this.$(this.container).unbind("mousedown", this.containerMousedown);
                this.$(this.document).unbind("mouseup", this.documentMouseup);

                this.$(this.selectedPanel).unbind("click", this.selectedPanelClick);
                this.$(this.document).unbind("mouseup", this.documentMouseup2);
            } else {
                this.filterInput.style.display = "inline-block";
                this.styling.Enable(this.stylingComposite);
                itarate(false);

                this.$(this.container).mousedown(this.containerMousedown); // removable
                this.$(this.document).mouseup(this.documentMouseup);  // removable

                this.$(this.selectedPanel).click(this.selectedPanelClick); // removable
                this.$(this.document).mouseup(this.documentMouseup2); // removable
            }
            this.disabled=disabled;
        }
    }

    init() {
        let container = this.optionsAdapter.container;
        this.selectedPanel = this.document.createElement('UL');
        defSelectedPanelStyleSys(this.selectedPanel.style); 
        container.appendChild(this.selectedPanel);
        
        this.filterInputItem = this.document.createElement('LI');
        this.selectedPanel.appendChild(this.filterInputItem);
        
        this.filterInput = document.createElement('INPUT'); //$filterInput.get(0);
        this.filterInput.setAttribute("type","search");
        this.filterInput.setAttribute("autocomplete","off");
        
        defFilterInputStyleSys(this.filterInput.style);
        this.filterInputItem.appendChild(this.filterInput);

        this.dropDownMenu = document.createElement('UL');
        this.dropDownMenu.style.display="none";
        this.container.appendChild(this.dropDownMenu);
        
        // prevent heavy understandable styling error
        defDropDownMenuStyleSys(this.dropDownMenu.style);
       
        this.documentMouseup = () => {
            this.skipFocusout = false;
        }

        this.containerMousedown = () => {
            this.skipFocusout = true;
        };
        this.documentMouseup2 = event => {
            if (!(container === event.target || container.contains(event.target))) { // IE8+
                this.closeDropDown();
            }
        }
        this.selectedPanelClick = jqEvent => {
            if (jqEvent.target.nodeName != "INPUT") // TODO: should be improoved
            {   this.filterInput.value='';
                this.filterInput.focus();
                // event.preventDefault()  // TODO: should I use preventDefault this ?  click can move focus...
            }
            if (this.hasDropDownVisible &&  (this.ProcessedBySelectedItemContentEvent==null || this.ProcessedBySelectedItemContentEvent.originalEvent!=jqEvent.originalEvent)){
                this.updateDropDownPosition(true);
                this.showDropDown();
            }
            this.ProcessedBySelectedItemContentEvent=null;
        };
        this.stylingComposite = this.createStylingComposite(container, this.selectedPanel,
            this.filterInputItem, this.filterInput, this.dropDownMenu);
        
        
        this.styling.Init(this.stylingComposite);
        
        this.labelAdapter.init(this.filterInput); 

        if (this.optionsAdapter.afterContainerFilled)
            this.optionsAdapter.afterContainerFilled();
        this.popper = new Popper(this.filterInput, this.dropDownMenu, {
            placement: 'bottom-start',
            modifiers: {
                preventOverflow: {enabled:false},
                hide: {enabled:false},
                flip: {enabled:false}
                }
        });
        
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        
        this.UpdateSize();
        this.UpdateDisabled();
        
        let createDropDownItems = ()=>{
            let options = this.optionsAdapter.options;
            for(let i =0; i<options.length; i++) {
                this.appendDropDownItem(options[i]);
            }
            this.hasDropDownVisible = options.length > 0;
            this.updateDropDownPosition(false);
        }
        // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
        if (this.document.readyState != 'loading'){
            createDropDownItems();
        } else {
            this.document.addEventListener('DOMContentLoaded', createDropDownItems); // IE9+
        }
        // there was unmotivated stopPropagation call. commented out.
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });
        this.$(this.dropDownMenu).mouseover(() => this.resetDropDownMenuHover());

        this.$(this.filterInput).focusin(() => this.styling.FocusIn(this.stylingComposite))
                    .focusout(() => {
                            if (!this.skipFocusout)
                                this.styling.FocusOut(this.stylingComposite)
                            });
        this.$(this.filterInput).on("keydown", (event) => {
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
                    let penultSelectedItem = this.filterInputItem.previousElementSibling; // IE9+
                    if (penultSelectedItem && penultSelectedItem.MultiSelectData){
                        penultSelectedItem.MultiSelectData.optionRemove();
                    }
                    this.updateDropDownPosition(false);
                }
            }

            if ([38, 40, 13, 9].indexOf(event.which)==-1)
                this.resetDropDownMenuHover();
        });
        this.$(this.filterInput).on("keyup", (event) => {
            if (event.which == 13 || event.which == 9 ) {
                if (this.hoveredDropDownItem) {
                    this.hoveredDropDownItem.MultiSelectData.optionToggle();
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
                        let option = dropDownItem.MultiSelectData.option;
                        if (!option.selected){
                            dropDownItem.MultiSelectData.optionToggle();
                        }
                        this.clearFilterInput(true);
                    }
                }
            }
            else if (event.which == 27) { // escape
                this.closeDropDown();
            }
        });
        this.$(this.filterInput).on('input', () => {
            this.input(true);
        });
    }
}

export default MultiSelect;
