import Popper from 'popper.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul

class MultiSelect {
    constructor(optionsAdapter, styling, 
        selectedItemContent, dropDownItemContent, 
        labelAdapter, createStylingComposite,
        configuration, onDispose, window) {
        if (typeof Popper === 'undefined') {
            throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
        }

        // readonly
        this.optionsAdapter = optionsAdapter;
        this.container = optionsAdapter.container; // part of published api
        this.styling = styling;
        this.selectedItemContent = selectedItemContent;
        this.dropDownItemContent = dropDownItemContent;
        this.labelAdapter = labelAdapter;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
        this.onDispose = onDispose;
        this.window = window;
        this.document = window.document;

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
        this.hoveredMultiSelectData = null;
        this.hoveredMultiSelectDataIndex = null;
        //this.hasDropDownVisible = false;

        this.MultiSelectDataList = [];
        this.MultiSelectDataSelectedTail = null;

        this.visibleMultiSelectDataList = null;
        this.visibleCount=10;
    }

    getVisibleMultiSelectDataList(){
        if (this.visibleMultiSelectDataList)
            return this.visibleMultiSelectDataList;
        else
            return this.MultiSelectDataList;
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

    resetDropDownMenuHover() {
        if (this.hoveredMultiSelectData !== null) {
            this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
            this.hoveredMultiSelectData = null;
            this.hoveredMultiSelectDataIndex = null;
        }
    }

    filterMultiSelectData(MultiSelectData, isFiltered){
        MultiSelectData.visible = isFiltered;
        MultiSelectData.dropDownMenuItemElement.style.display=isFiltered?'block':'none';
    } 

    filterDropDownMenu() {
        let text = this.filterInput.value.trim().toLowerCase();
        if (text=='')
        {
            for(let i=0; i<this.MultiSelectDataList.length; i++)
                this.filterMultiSelectData(this.MultiSelectDataList[i], true);
            this.visibleMultiSelectDataList = null;
        }
        else
        {
            this.visibleMultiSelectDataList = [];
            for(let i=0; i<this.MultiSelectDataList.length; i++)
            {
                let multiSelectData = this.MultiSelectDataList[i];
                let option = multiSelectData.option; 
                if (option.selected || option.disabled || multiSelectData.searchText.indexOf(text)<0) 
                    this.filterMultiSelectData(multiSelectData, false);
                else {
                    this.filterMultiSelectData(multiSelectData, true);
                    this.visibleMultiSelectDataList.push( multiSelectData );
                }
            }
        }
        this.resetDropDownMenuHover();
        if (this.getVisibleMultiSelectDataList().length == 1) {
            this.hoverInInternal(0)
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
    
    removeSelectedFromList(MultiSelectData){
        if (MultiSelectData.selectedPrev){
            (MultiSelectData.selectedPrev).selectedNext = MultiSelectData.selectedNext;
        }
        if (MultiSelectData.selectedNext){
           (MultiSelectData.selectedNext).selectedPrev = MultiSelectData.selectedPrev;
        }
        if (this.MultiSelectDataSelectedTail == MultiSelectData)
        {
            this.MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
        }
        MultiSelectData.selectedNext=null;
        MultiSelectData.selectedPrev=null;
    }

    appendDropDownItem(option) {
        var dropDownMenuItemElement=this.document.createElement('LI');
        
        this.dropDownMenu.appendChild(dropDownMenuItemElement); 
        let dropDownItemContent = this.dropDownItemContent(dropDownMenuItemElement, option); 

        let isDisabled = option.disabled;
        let isSelected = option.selected;

        if (isSelected && isDisabled)
            dropDownItemContent.disabledStyle(true);
        else if (isDisabled)
            dropDownItemContent.disable(isDisabled);

        var MultiSelectData={
            searchText: option.text.toLowerCase().trim(), 
            option:option, 
            dropDownMenuItemElement:dropDownMenuItemElement,
            dropDownItemContent:dropDownItemContent,
            selectedPrev: null,
            selectedNext: null,
            visible: true,
            toggle:null,
            selectedItemElement: null,
            remove:null,
            disable:null,
        };

        this.MultiSelectDataList.push(MultiSelectData);

        dropDownItemContent.onSelected(() => {
            MultiSelectData.toggle();
            this.filterInput.focus();
        });
        
        let selectItem = (doPublishEvents) => {
            //if (option.hidden)
            //    return;
            var selectedItemElement = this.document.createElement('LI');
            MultiSelectData.selectedItemElement = selectedItemElement;
            
            if (this.MultiSelectDataSelectedTail){
                this.MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
                MultiSelectData.selectedPrev=this.MultiSelectDataSelectedTail;
            }
            this.MultiSelectDataSelectedTail=MultiSelectData; 
            
            let adjustPair =(isSelected, toggle, remove, disable) => {
                option.selected = isSelected;
                dropDownItemContent.select(isSelected);
                MultiSelectData.toggle=toggle;
                MultiSelectData.remove=remove;
                MultiSelectData.disable=disable;
            }

            let removeItem = () => {
                dropDownItemContent.disabledStyle(false);
                dropDownItemContent.disable(option.disabled);
                adjustPair(
                    false, 
                    () => {
                        if (option.disabled)
                            return;
                        selectItem(true);
                    }, 
                    null,
                    null
                    );
                selectedItemElement.parentNode.removeChild(selectedItemElement);
                
                this.removeSelectedFromList(MultiSelectData);

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

            let onRemoveItemEvent = () => {
                setTimeout( ()=> {  
                    removeItem();
                    this.closeDropDown();
                }, 0);
            };

            let preventDefaultMultiSelect = (event) => {
                this.preventDefaultMultiSelectEvent=event;
            }

            let bsSelectedItemContent = this.selectedItemContent(
                selectedItemElement,
                option,
                onRemoveItemEvent,
                preventDefaultMultiSelect
            );

            bsSelectedItemContent.disable(this.disabled);
            adjustPair(true, ()=>removeItem(), removeItemAndCloseDropDown, bsSelectedItemContent.disable);

            this.selectedPanel.insertBefore(selectedItemElement, this.filterInputItem);
            if (doPublishEvents){
                this.optionsAdapter.triggerChange();
            }
        }

        dropDownMenuItemElement.addEventListener('mouseover', () => 
             this.styling.HoverIn(dropDownMenuItemElement));
        dropDownMenuItemElement.addEventListener('mouseout', () =>             
             this.styling.HoverOut(dropDownMenuItemElement));
        
        if (option.selected)
            selectItem(false);
        else
            MultiSelectData.toggle= () => { 
                if (option.disabled)
                    return;
                selectItem(true);
            }
        return MultiSelectData;
    }

    hoverInInternal(index){
        this.visibleIndex = 0;
        this.hoveredMultiSelectDataIndex = index;
        this.hoveredMultiSelectData = this.getVisibleMultiSelectDataList()[index];
        this.styling.HoverIn(this.hoveredMultiSelectData.dropDownMenuItemElement);
    }

    keydownArrow(down) {
        let visibleMultiSelectDataList = this.getVisibleMultiSelectDataList(); 
        if (visibleMultiSelectDataList.length > 0) {
            if (visibleMultiSelectDataList.length > 0 ) {
                this.updateDropDownPosition(true);
                this.showDropDown();
            }
            let index;
            if (this.hoveredMultiSelectData === null) {
                index = down ? 0 : visibleMultiSelectDataList.length - 1;
            }
            else {
                this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
                if (down) {
                    let newIndex = this.hoveredMultiSelectDataIndex + 1;
                    index = newIndex < visibleMultiSelectDataList.length ? newIndex : 0;
                } else {
                    let newIndex = this.hoveredMultiSelectDataIndex - 1;
                    index = newIndex >= 0 ? newIndex : visibleMultiSelectDataList.length - 1;
                }
            }
            this.hoverInInternal(index);
        }
    }
    input(forceUpdatePosition) {
        this.filterInput.style.width = this.filterInput.value.length*1.3 + 2 + "ch";
        this.filterDropDownMenu();

        if (this.getVisibleMultiSelectDataList().length > 0) {
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
        this.document.removeEventListener("mouseup", this.documentMouseup);
        this.document.removeEventListener("mouseup", this.documentMouseup2);
        this.document.removeEventListener("DOMContentLoaded", this.createDropDownItems);
        this.container.removeEventListener("mousedown", this.containerMousedown);
        
        this.labelAdapter.dispose();
        
        if (this.popper) {
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
            let i = this.MultiSelectDataSelectedTail;
            while(i){
                i.disable(isDisabled); 
                i = i.selectedPrev;
            }
        }
        if (this.disabled!==disabled){
            if (disabled) {
                this.filterInput.style.display = "none";
                this.styling.Disable(this.stylingComposite);
                itarate(true);
                    
                this.container.removeEventListener("mousedown", this.containerMousedown);
                this.document.removeEventListener("mouseup", this.documentMouseup);
                
                this.selectedPanel.removeEventListener("click", this.selectedPanelClick);
                this.document.removeEventListener("mouseup", this.documentMouseup2);
            } else {
                this.filterInput.style.display = "inline-block";
                this.styling.Enable(this.stylingComposite);
                itarate(false);

                this.container.addEventListener("mousedown", this.containerMousedown);
                this.document.addEventListener("mouseup", this.documentMouseup);
                
                this.selectedPanel.addEventListener("click", this.selectedPanelClick);
                this.document.addEventListener("mouseup", this.documentMouseup2);
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
        
        this.filterInput = document.createElement('INPUT'); 
        this.filterInput.setAttribute("type","search");
        this.filterInput.setAttribute("autocomplete","off");
        
        defFilterInputStyleSys(this.filterInput.style);
        this.filterInputItem.appendChild(this.filterInput);

        this.dropDownMenu = document.createElement('UL');
        this.dropDownMenu.style.display="none";
        container.appendChild(this.dropDownMenu);
        
        // prevent heavy understandable styling error
        defDropDownMenuStyleSys(this.dropDownMenu.style);
       
        this.documentMouseup = () => {
            this.skipFocusout = false;
        }

        this.containerMousedown = () => {
            this.skipFocusout = true;
        };

        this.documentMouseup2 = event => {
            if (!(container === event.target || container.contains(event.target))) {
                this.closeDropDown();
            }
        }

        this.selectedPanelClick = event => {
            if (event.target != this.filterInput)
            {   
                this.filterInput.value='';
                this.filterInput.focus();
            }
            if (this.getVisibleMultiSelectDataList().length > 0 &&  
                ( this.preventDefaultMultiSelectEvent != event)){
                this.updateDropDownPosition(true);
                this.showDropDown();
            }
            this.preventDefaultMultiSelectEvent=null;
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
        
        this.createDropDownItems = ()=>{
            let options = this.optionsAdapter.options;
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                if (!option.hidden)
                {
                    this.appendDropDownItem(option);
                }
            } 
            //this.hasDropDownVisible = options.length > 0;
            this.updateDropDownPosition(false);
        }

        // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
        if (this.document.readyState != 'loading'){
            this.createDropDownItems();
        } else {
            this.document.addEventListener('DOMContentLoaded', this.createDropDownItems); // IE9+
        }
        // there was unmotivated stopPropagation call. commented out.
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });
        this.dropDownMenu.addEventListener('mouseover', () => 
             this.resetDropDownMenuHover());

        this.filterInput.addEventListener('focusin', () => 
            this.styling.FocusIn(this.stylingComposite))
        
        this.filterInput.addEventListener('focusout', () => {
            if (!this.skipFocusout)
                this.styling.FocusOut(this.stylingComposite)
            });

        this.filterInput.addEventListener('keydown', (event) => {
            if ([38, 40, 13].indexOf(event.which)>=0 || (event.which == 9 && this.filterInput.value) ) {
                event.preventDefault();
            }

            if (event.which == 38) {
                this.keydownArrow(false);
            }
            else if (event.which == 40) {
                if (this.hoveredMultiSelectData === null && this.getVisibleMultiSelectDataList().length > 0) {
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
                    if (this.MultiSelectDataSelectedTail){ 
                        this.MultiSelectDataSelectedTail.remove();
                    }
                    this.updateDropDownPosition(false);
                }
            }

            if ([38, 40, 13, 9].indexOf(event.which)==-1)
                this.resetDropDownMenuHover();
        });
        this.filterInput.addEventListener('keyup', (event) => {
            if (event.which == 13 || event.which == 9 ) {
                if (this.hoveredMultiSelectData) {
                    this.hoveredMultiSelectData.toggle();
                    this.closeDropDown();
                } 
            }
            else if (event.which == 27) { // escape
                this.closeDropDown();
            }
            // TODO may be do it on "space" (when there is left only one)?
            else {
                let text = this.filterInput.value.trim().toLowerCase();
                let visibleMultiSelectDataList = this.getVisibleMultiSelectDataList();
                if (text && visibleMultiSelectDataList.length == 1)
                {
                    let fullMatchMultiSelectData=  visibleMultiSelectDataList[0];
                    if (fullMatchMultiSelectData.searchText == text)
                    {
                        fullMatchMultiSelectData.toggle();
                        this.clearFilterInput(true);
                    }
                }
            }
        });
        this.filterInput.addEventListener('input', () => {
            this.input(true);
        });
    }
}

export default MultiSelect;
