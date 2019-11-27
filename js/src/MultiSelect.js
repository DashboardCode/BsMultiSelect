import Popper from 'popper.js'
import FilterPanel from './FilterPanel.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul
function removeElement(e) {e.parentNode.removeChild(e)}

function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
    MultiSelectData.visible = isFiltered;
    MultiSelectData.visibleIndex = visibleIndex;
    MultiSelectData.dropDownMenuItemElement.style.display = isFiltered ? 'block': 'none';
} 

function resetFilterDropDownMenu(MultiSelectDataList) {
    for(let i=0; i<MultiSelectDataList.length; i++)
    {
        let multiSelectData = MultiSelectDataList[i];
        if ( !multiSelectData.isHidden )
        {
            filterMultiSelectData(multiSelectData, true, i);
        }
    }
}

function filterDropDownMenu(MultiSelectDataList, text) {
    var list = [];
    var j = 0;
    for(let i=0; i<MultiSelectDataList.length; i++)
    {
        let multiSelectData = MultiSelectDataList[i];
        if ( !multiSelectData.isHidden )
        {
            if ( multiSelectData.excludedFromSearch || multiSelectData.searchText.indexOf(text)<0 )
            {
                filterMultiSelectData(multiSelectData, false);
            }
            else 
            {
                filterMultiSelectData(multiSelectData, true, j++);
                list.push( multiSelectData );
            }
        }
    }
    return list;
}

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
        this.isDisposed = false;
        this.window = window;
        this.document = window.document;

        this.popper = null;

        this.visibleCount=10;

        this.selectedPanel = null;
        this.filterInputItem = null;

        this.dropDownMenu = null;

        this.stylingComposite = null;

        // removable handlers
        this.selectedPanelClick  = null;
        this.documentMouseup = null;
        this.containerMousedown = null;
        this.documentMouseup2 = null;

        // state
        this.isComponentDisabled = null;
        this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
        
        this.resetMultiSelectDataList();
        this.skipFocusout = false;
        this.hoveredMultiSelectData = null;
        this.hoveredMultiSelectDataIndex = null;
        
    }

    resetMultiSelectDataList(){
        this.MultiSelectDataList = [];
        this.MultiSelectDataSelectedTail = null;
        this.visibleMultiSelectDataList = null;
    }

    getVisibleMultiSelectDataList(){
        if (this.visibleMultiSelectDataList)
            return this.visibleMultiSelectDataList;
        else
            return this.MultiSelectDataList;
    }

    removeSelectedTail(){
        if (this.MultiSelectDataSelectedTail){ 
            this.MultiSelectDataSelectedTail.toggle(); // always remove in this case
        }
        this.updateDropDownLocation(false);
    }

    updateDropDownLocation(force) {
        let offsetLeft = this.filterInputItem.offsetLeft;
        if (force || this.filterInputItemOffsetLeft!=offsetLeft){
            this.popper.update();
            this.filterInputItemOffsetLeft=offsetLeft;
        }
    }

    hideDropDown() {
        if (this.candidateToHoveredMultiSelectData){
            this.resetCandidateToHoveredMultiSelectData();
        }
        if (this.dropDownMenu.style.display != 'none')
        {
            this.dropDownMenu.style.display = 'none';
            // remove listeners that manages close dropdown on input's focusout and click outside container
            this.container.removeEventListener("mousedown", this.containerMousedown);
            this.document.removeEventListener("mouseup", this.documentMouseup);
            this.document.removeEventListener("mouseup", this.documentMouseup2);
        }
    }

    setInShowDropDown(){
        this.inShowDropDown = true;
            setTimeout( () => {  
                this.inShowDropDown = null;
            }, 0)
    }    

    showDropDown() {
        if (this.dropDownMenu.style.display != 'block')
        {
            this.setInShowDropDown();
            this.dropDownMenu.style.display = 'block';
            // add listeners that manages close dropdown on input's focusout and click outside container
            this.container.addEventListener("mousedown", this.containerMousedown);
            this.document.addEventListener("mouseup", this.documentMouseup);
            this.document.addEventListener("mouseup", this.documentMouseup2);
        }
    }

    hoverInInternal(index){
        this.hoveredMultiSelectDataIndex = index;
        this.hoveredMultiSelectData = this.getVisibleMultiSelectDataList()[index];
        this.styling.HoverIn(this.hoveredMultiSelectData.dropDownMenuItemElement);
    }

    resetDropDownMenuHover() {
        if (this.hoveredMultiSelectData) {
            this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
            this.hoveredMultiSelectData = null;
            this.hoveredMultiSelectDataIndex = null;
        }
    }

    resetFilter(){
        if (!this.filterPanel.isEmpty()) {
            this.filterPanel.setEmpty();
            this.processEmptyInput();
        }
    }

    hideDropDownAndResetFilter() {
        this.hideDropDown(); // always hide 1st
        this.resetFilter();
    }
    
    removeSelectedFromList(MultiSelectData){
        if (MultiSelectData.selectedPrev){
            (MultiSelectData.selectedPrev).selectedNext = MultiSelectData.selectedNext;
        }
        if (MultiSelectData.selectedNext){
           (MultiSelectData.selectedNext).selectedPrev = MultiSelectData.selectedPrev;
        }
        if (this.MultiSelectDataSelectedTail == MultiSelectData){
            this.MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
        }
        MultiSelectData.selectedNext=null;
        MultiSelectData.selectedPrev=null;
    }

    insertDropDownItem(MultiSelectData, insertToDropDownMenu, isSelected, isOptionDisabled) {
        var dropDownMenuItemElement = this.document.createElement('LI');
        
        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onDropDownMenuItemElementMouseover = () => 
        {
            if (!this.inShowDropDown)
            {
                
                if (this.hoveredMultiSelectData!=MultiSelectData)
                {
                    // mouseleave is not enough to guarantee remove hover styles in situations
                    // when style was setuped without mouse (keyboard arrows)
                    // therefore force reset manually
                    this.resetDropDownMenuHover(); 
                    this.hoverInInternal(MultiSelectData.visibleIndex);
                }
            }
            else
            {
                this.candidateToHoveredMultiSelectData = MultiSelectData;
                dropDownMenuItemElement.addEventListener('mousemove', this.processCandidateToHovered);
                dropDownMenuItemElement.addEventListener('mousedown', this.processCandidateToHovered);
            }
        }

        dropDownMenuItemElement.addEventListener('mouseover', onDropDownMenuItemElementMouseover);
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onDropDownMenuItemElementMouseleave = () => this.resetDropDownMenuHover();
        dropDownMenuItemElement.addEventListener('mouseleave', onDropDownMenuItemElementMouseleave);


        insertToDropDownMenu(dropDownMenuItemElement);

        let dropDownItemContent = this.dropDownItemContent(dropDownMenuItemElement, MultiSelectData.option); 
        MultiSelectData.dropDownMenuItemElement = dropDownMenuItemElement;
        MultiSelectData.DropDownItemContent = dropDownItemContent;

        MultiSelectData.DisposeDropDownMenuItemElement = ()=> {
            dropDownMenuItemElement.removeEventListener('mouseover',  onDropDownMenuItemElementMouseover);
            dropDownMenuItemElement.removeEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
        }

        var setDropDownItemContentDisabled = (dropDownItemContent,  isSelected) => {
            dropDownItemContent.disabledStyle(true);
            // do not desable if selected! there should be possibility to unselect "disabled"
            dropDownItemContent.disable(!isSelected);
        }

        if (isOptionDisabled)
            setDropDownItemContentDisabled(dropDownItemContent, isSelected )

        dropDownItemContent.onSelected(() => {
            MultiSelectData.toggle();
            this.filterPanel.setFocus();
        });
        // ------------------------------------------------------------------------------
        
        var setPreventDefaultMultiSelectEvent = (event)=>{
                this.preventDefaultMultiSelectEvent = event;
            }
       
        
        var createSelectedItem = ()=>{
            var selectedItemElement = this.document.createElement('LI');
            MultiSelectData.selectedItemElement = selectedItemElement;
            if (this.MultiSelectDataSelectedTail){
                this.MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
                MultiSelectData.selectedPrev = this.MultiSelectDataSelectedTail;
            }
            this.MultiSelectDataSelectedTail = MultiSelectData;

            var removeSelectedItem = () => {
                MultiSelectData.option.selected = false;
                MultiSelectData.excludedFromSearch = isOptionDisabled;
                if (isOptionDisabled)
                {
                    setDropDownItemContentDisabled(dropDownItemContent, false);
                    MultiSelectData.toggle = ()=> {};
                }
                else
                {
                    MultiSelectData.toggle = ()=>{
                        createSelectedItem();
                        this.optionsAdapter.triggerChange();
                    };
                }
                dropDownItemContent.select(false);
                removeElement(selectedItemElement);
                MultiSelectData.SelectedItemContent.dispose();
                MultiSelectData.SelectedItemContent=null;
                MultiSelectData.selectedItemElement=null;

                this.removeSelectedFromList(MultiSelectData);
                this.optionsAdapter.triggerChange();
            }

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
    
            let removeSelectedItemAndCloseDropDown = () => {
                removeSelectedItem();
                this.hideDropDownAndResetFilter();
            };
        
            let onRemoveSelectedItemEvent = () => {
                setTimeout( () => {  
                    removeSelectedItemAndCloseDropDown();
                }, 0);
            };

            MultiSelectData.SelectedItemContent = this.selectedItemContent(
                selectedItemElement,
                MultiSelectData.option,
                onRemoveSelectedItemEvent,
                setPreventDefaultMultiSelectEvent);
    
            var disable = (isDisabled) =>
                MultiSelectData.SelectedItemContent.disable(isDisabled);
            disable(this.isComponentDisabled);

            MultiSelectData.option.selected = true;
            MultiSelectData.excludedFromSearch = true; // all selected excluded from search
            //MultiSelectData.remove  = removeSelectedItemAndCloseDropDown;
            MultiSelectData.disable = disable;
            this.selectedPanel.insertBefore(selectedItemElement, this.filterInputItem);


            MultiSelectData.toggle = () => removeSelectedItem();
            dropDownItemContent.select(true);
            
        }

        
        
        if (isSelected)
        {
            createSelectedItem();
        }
        else
        {
            MultiSelectData.excludedFromSearch =  isOptionDisabled;
            if (isOptionDisabled)
                MultiSelectData.toggle = () => { }
            else
                MultiSelectData.toggle = () =>  {
                    createSelectedItem();
                    this.optionsAdapter.triggerChange();
                }
        }
        MultiSelectData.removeDropDownMenuItemElement = () => {
            removeElement(dropDownMenuItemElement);
            if (MultiSelectData.selectedItemElement!=null)
                removeElement(MultiSelectData.selectedItemElement);
        }
    }

    keyDownArrowDown() {
        this.keyDownArrow(true);
    }
    keyDownArrowUp() {
        this.keyDownArrow(false);
    }
    keyDownArrow(down) {
        let visibleMultiSelectDataList = this.getVisibleMultiSelectDataList();
        let length = visibleMultiSelectDataList.length;
        let newIndex=null;
        if (length > 0) {
            if (down) {
                let i = this.hoveredMultiSelectDataIndex==null?0:this.hoveredMultiSelectDataIndex+1;
                while(i<length){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i++;
                }
            } else {
                let i = this.hoveredMultiSelectDataIndex==null?length-1:this.hoveredMultiSelectDataIndex-1;
                while(i>=0){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i--;
                }
            }
        }
        
        if (newIndex!=null)
        {
            if (this.hoveredMultiSelectData)
                this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
            this.updateDropDownLocation(true);
            this.showDropDown(); 
            this.hoverInInternal(newIndex);
        }
    }

    processEmptyInput(){
        this.filterPanel.setEmptyLength();
        resetFilterDropDownMenu(this.MultiSelectDataList);
        this.visibleMultiSelectDataList = null;
    }

    Update(){
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        this.UpdateSize();
        this.UpdateDisabled();
    }

    UpdateOption(index){
        let multiSelectData = this.MultiSelectDataList[index];
        let option = multiSelectData.option;
        multiSelectData.searchText = option.text.toLowerCase().trim();
        if (multiSelectData.isHidden != option.isHidden)
        {
            multiSelectData.isHidden=option.isHidden;
            if (multiSelectData.isHidden)
                this.insertDropDownItem(multiSelectData, (e)=>this.dropDownMenu.appendChild(e), option.isSelected, option.isDisabled);
            else
                multiSelectData.removeDropDownMenuItemElement();
        }
        else 
        {
            if (multiSelectData.isSelected != option.isSelected)
            {
                multiSelectData.isSelected=option.isSelected;
                if (multiSelectData.isSelected)
                {
                    // this.insertDropDownItem(multiSelectData, (e)=>this.dropDownMenu.appendChild(e), isSelected, isDisabled);
                }
                else
                {
                    // multiSelectData.removeDropDownMenuItemElement();
                }
            }
            if (multiSelectData.isDisabled != option.isDisabled)
            {
                multiSelectData.isDisabled=option.isDisabled;
                if (multiSelectData.isDisabled)
                {
                    // this.insertDropDownItem(multiSelectData, (e)=>this.dropDownMenu.appendChild(e), isSelected, isDisabled);
                }
                else
                {
                    // multiSelectData.removeDropDownMenuItemElement();
                }
            }
        }    
        //multiSelectData.updateOption();
    }

    UpdateData(){
        // close drop down , remove filter and listeners
        this.hideDropDownAndResetFilter();

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.removeDropDownMenuItemElement)
                multiSelectData.removeDropDownMenuItemElement();
        }
        this.resetMultiSelectDataList();

        // reinitiate
        this.updateDataImpl();
    }

    updateDataImpl(){
        var createDropDownItems = () => {
            let options = this.optionsAdapter.getOptions();
            var j = 0;
            for(let i = 0; i<options.length; i++) {
                let option = options[i];

                let isDisabled = option.disabled;
                let isHidden   = option.hidden;
                let isSelected = option.selected;
                
                var MultiSelectData = {
                    searchText: option.text.toLowerCase().trim(),
                    excludedFromSearch: isSelected || isDisabled || isHidden,
                    option: option,
                    isHidden: isHidden,
                    dropDownMenuItemElement: null,
                    dropDownItemContent: null,
                    selectedPrev: null,
                    selectedNext: null,
                    visible: false,
                    toggle: null,
                    selectedItemElement: null,
                    remove: null,
                    disable: null,
                    removeDropDownMenuItemElement: null
                };

                this.MultiSelectDataList.push(MultiSelectData);
                if (!isHidden){
                    MultiSelectData.visible = true;
                    MultiSelectData.visibleIndex=i;
                    this.insertDropDownItem(MultiSelectData, (e)=>this.dropDownMenu.appendChild(e), isSelected, isDisabled);
                }
            } 
            this.updateDropDownLocation(false);
        }

        // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
        if (document.readyState != 'loading'){
            createDropDownItems();
        } else {
            var createDropDownItemsHandler = function(){
                createDropDownItems();
                document.removeEventListener("DOMContentLoaded", createDropDownItemsHandler);
            }
            document.addEventListener('DOMContentLoaded', createDropDownItemsHandler); // IE9+
        }
    }

    Dispose(){
        this.isDisposed = true;
        if (this.onDispose)
            this.onDispose(); // primary used to remove from jQuery tables
        
        // remove event listeners
        // TODO check if open
        this.hideDropDown();
        
        this.selectedPanel.removeEventListener("click", this.selectedPanelClick); // OPEN dropdown
        this.filterPanel.dispose();
        
        this.labelAdapter.dispose();

        
        if (this.popper) {
            this.popper.destroy();
        }
        
        if (this.optionsAdapter.dispose) {
            this.optionsAdapter.dispose();
        }

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.DisposeDropDownMenuItemElement)
                multiSelectData.DisposeDropDownMenuItemElement();
            
            if (multiSelectData.SelectedItemContent)
                multiSelectData.SelectedItemContent.dispose();
            if (multiSelectData.DropDownItemContent)
                multiSelectData.DropDownItemContent.dispose();
        }

        // this.resetMultiSelectDataList();
        // this.onFilterInputInput = null;
        // this.onFilterInputKeyUp = null;
        // this.onfilterInputKeyDown = null;
        // this.onFilterInputFocusOut = null;
        // this.onFilterInputFocusIn = null;
        // this.selectedPanelClick = null;
        // this.containerMousedown = null;
        // this.documentMouseup = null;
        // this.documentMouseup2 = null;
        // this.processCandidateToHovered = null;
    }

    UpdateSize(){
        if (this.styling.UpdateSize)
            this.styling.UpdateSize(this.stylingComposite);
    }

    UpdateDisabled(){
        let isComponentDisabled = this.optionsAdapter.getDisabled();
        let iterateAll = (isDisabled)=>{
            let i = this.MultiSelectDataSelectedTail;
            while(i){
                i.disable(isDisabled); 
                i = i.selectedPrev;
            }
        }
        if (this.isComponentDisabled!==isComponentDisabled){
            if (isComponentDisabled) {
                //this.filterInput.style.display = "none";
                this.filterInputItem.style.display = "none";
                this.styling.Disable(this.stylingComposite);
                iterateAll(true);
                    
                this.selectedPanel.removeEventListener("click", this.selectedPanelClick);
            } else {
                //this.filterInput.style.display = "inline-block";
                this.filterInputItem.style.display = "list-item";
                this.styling.Enable(this.stylingComposite);
                iterateAll(false);

                this.selectedPanel.addEventListener("click", this.selectedPanelClick);
            }
            this.isComponentDisabled=isComponentDisabled;
        }
    }
    
    resetCandidateToHoveredMultiSelectData(){
        this.candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousemove', this.processCandidateToHovered);
        this.candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousedown', this.processCandidateToHovered);
        this.candidateToHoveredMultiSelectData = null;
    }

    toggleHovered(){
        if (this.hoveredMultiSelectData) {
            this.hoveredMultiSelectData.toggle();
            this.resetDropDownMenuHover();
            this.hideDropDownAndResetFilter();
        } 
    }

    input(filterInputValue, resetLength){
        let text = filterInputValue.trim().toLowerCase();
        var isEmpty=false;
        if (text == '')
            isEmpty=true;
        else
        {
            // check if exact match, otherwise new search
            this.visibleMultiSelectDataList = filterDropDownMenu(this.MultiSelectDataList, text);
            if (this.visibleMultiSelectDataList.length == 1)
            {
                let fullMatchMultiSelectData =  this.visibleMultiSelectDataList[0];
                if (fullMatchMultiSelectData.searchText == text)
                {
                    fullMatchMultiSelectData.toggle();
                    this.filterPanel.setEmpty(); // clear
                    isEmpty=true;
                }
            }
        }
        if (isEmpty)
            this.processEmptyInput();
        else
            resetLength();  
        this.setInShowDropDown();

        this.resetDropDownMenuHover();

        if (this.getVisibleMultiSelectDataList().length == 1) {
            this.hoverInInternal(0)
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
            this.updateDropDownLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.showDropDown();
        } else {
            this.hideDropDown();
        }
    }

    init() {
        var document = this.document;
        let container = this.optionsAdapter.container;
        this.selectedPanel = document.createElement('UL');
        defSelectedPanelStyleSys(this.selectedPanel.style); 
        container.appendChild(this.selectedPanel);
        
        this.filterInputItem = document.createElement('LI');
        this.selectedPanel.appendChild(this.filterInputItem);
        
        this.filterPanel = FilterPanel(
            (input) => {
                this.filterInputItem.appendChild(input);
                this.labelAdapter.init(input); 
            },
            () => this.styling.FocusIn(this.stylingComposite),  // show dropdown
            () => {
                if (!this.skipFocusout)
                {
                    this.resetFilter(); // if do not do this we will return to filtered list without text filter in input
                    this.resetDropDownMenuHover(); // if do not do this tab will select "only one hovered"
                    this.styling.FocusOut(this.stylingComposite)
                }
            }, // hide dropdown
            () => this.keyDownArrowUp(), 
            () => this.keyDownArrowDown(),
            () => this.hideDropDown(),  
            () => this.removeSelectedTail(), // backspace alike
            () => this.resetDropDownMenuHover(), 
            () => this.toggleHovered(), // "compleate alike"
            () => this.hideDropDownAndResetFilter(), // "esc" alike
            (filterInputValue, resetLength) => this.input(filterInputValue, resetLength) // filter
        );
        
        //defFilterInputStyleSys(this.filterInput.style);

        this.dropDownMenu = document.createElement('UL');
        this.dropDownMenu.style.display="none";
        container.appendChild(this.dropDownMenu);
        
        // prevent heavy understandable styling error
        defDropDownMenuStyleSys(this.dropDownMenu.style);

        // we want to escape the closing of the menu on a user's click inside the container
        this.containerMousedown = () => {
            this.skipFocusout = true;
            this.skipContainerMousedownEvent = event;
        };
        
        this.processCandidateToHovered = () => {
            if (this.hoveredMultiSelectData!=this.candidateToHoveredMultiSelectData)
            {
                this.resetDropDownMenuHover(); 
                this.hoverInInternal(this.candidateToHoveredMultiSelectData.visibleIndex);
            }
            this.resetCandidateToHoveredMultiSelectData();
        }

        // document.Mouseup used for better realiability
        // TODO : this.containerMousedown , this.documentMouseup and filterInput.focusOut are actual only when menu is open
        this.documentMouseup = () => {
            this.skipFocusout = false;
        }

        this.documentMouseup2 = event => {
            if (!(container === event.target || container.contains(event.target))) {
                this.hideDropDownAndResetFilter();
            }
        }

        this.selectedPanelClick = event => {
            if (!this.filterPanel.isEventTarget(event))
            {   
                //this.filterPanel.setEmpty();
                this.filterPanel.setFocus();
            }
            if (this.getVisibleMultiSelectDataList().length > 0 && this.preventDefaultMultiSelectEvent != event) {
                this.updateDropDownLocation(true);
                this.showDropDown();
            }
            this.preventDefaultMultiSelectEvent=null;
        };

        this.stylingComposite = this.createStylingComposite(container, this.selectedPanel,
            this.filterInputItem, this.filterPanel.input, this.dropDownMenu);
        
        this.styling.Init(this.stylingComposite);

        if (this.optionsAdapter.afterContainerFilled)
            this.optionsAdapter.afterContainerFilled();

        this.popper = new Popper( this.filterInputItem, this.dropDownMenu, {
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
        
        this.updateDataImpl();
    }
}

export default MultiSelect;
