import Popper from 'popper.js'
import FilterPanel from './FilterPanel.js'
import OptionsPanel from './OptionsPanel.js'
import SelectionsPanel from './SelectionsPanel.js'
import MultiSelectInputAspect from './MultiSelectInputAspect.js'

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

function collectFilterDropDownMenu(MultiSelectDataList, text) {
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
        this.window = window;
        this.document = window.document;

        //this.popper = null;

        this.visibleCount=10;

        this.selectionsPanel = null;
        this.filterInputItem = null;
        this.optionsPanel = null;

        this.stylingComposite = null;

        // removable handlers
        this.documentMouseup = null;
        this.containerMousedown = null;

        // state
        this.isComponentDisabled = null;
        this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
        
        this.resetMultiSelectDataList();
    }

    resetMultiSelectDataList(){
        this.MultiSelectDataList = [];
        this.filteredMultiSelectDataList = null;
    }

    
    getVisibleMultiSelectDataList(){
        if (this.filteredMultiSelectDataList)
            return this.filteredMultiSelectDataList;
        else
            return this.MultiSelectDataList;
    }

    resetFilter(){
        if (!this.filterPanel.isEmpty()) {
            this.filterPanel.setEmpty();
            this.processEmptyInput();
        }
    }

    processEmptyInput(){
        this.filterPanel.setEmptyLength();
        resetFilterDropDownMenu(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
    }

    // -----------------------------------------------------------------------------------------------------------------------
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
                this.optionsPanel.insertDropDownItem(multiSelectData, 
                    (p1,p2,p3)=>this.selectionsPanel.createSelectedItem(p1,p2,p3),
                    ()=>this.optionsAdapter.triggerChange(),
                    option.isSelected, option.isDisabled);
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
        this.optionsPanel.hideDropDown(); // always hide 1st
        this.resetFilter();

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.removeDropDownMenuItemElement)
                multiSelectData.removeDropDownMenuItemElement();
        }
        this.resetMultiSelectDataList();
        this.selectionsPanel.resetMultiSelectDataSelectedTail();// this.MultiSelectDataSelectedTail = null;

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
                    this.optionsPanel.insertDropDownItem(MultiSelectData, 
                        (p1,p2,p3)=>this.selectionsPanel.createSelectedItem(p1,p2,p3),
                        ()=>this.optionsAdapter.triggerChange(), isSelected, isDisabled);
                }
            } 
            this.aspect.alignToFilterInputItemLocation(false);
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
        if (this.onDispose)
            this.onDispose(); // primary used to remove from jQuery tables
        
        // remove event listeners
        // TODO check if open
        this.optionsPanel.hideDropDown();
        
        this.selectionsPanel.dispose();
        this.filterPanel.dispose();
        
        this.labelAdapter.dispose();
        
        this.aspect.dispose();
        
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
    }

    UpdateSize(){
        if (this.styling.UpdateSize)
            this.styling.UpdateSize(this.stylingComposite);
    }

    UpdateDisabled(){
        let isComponentDisabled = this.optionsAdapter.getDisabled();
        if (this.isComponentDisabled!==isComponentDisabled){
            if (isComponentDisabled) {
                this.selectionsPanel.disable();
                this.styling.Disable(this.stylingComposite);
            } else {
                this.selectionsPanel.enable();
                this.styling.Enable(this.stylingComposite);
            }
            this.isComponentDisabled=isComponentDisabled;
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
            this.filteredMultiSelectDataList = collectFilterDropDownMenu(this.MultiSelectDataList, text);
            if (this.filteredMultiSelectDataList.length == 1)
            {
                let fullMatchMultiSelectData =  this.filteredMultiSelectDataList[0];
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
        
        
        this.optionsPanel.stopAndResetDropDownMenuHover();
        if (this.getVisibleMultiSelectDataList().length == 1) {
            this.optionsPanel.hoverInInternal(0)
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
            this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.optionsPanel.showDropDown();
        } else {
            this.optionsPanel.hideDropDown();
        }
    }

    init() {
        var document = this.document;
        var createElement = (name) => document.createElement(name);
        let container = this.optionsAdapter.container;

        var lazyfilterItemInputElementAtach=null;
        
        this.filterPanel = FilterPanel(
            createElement,
            (filterItemInputElement) => {
                lazyfilterItemInputElementAtach = (filterItemElement)=>{
                    filterItemElement.appendChild(filterItemInputElement);
                    this.labelAdapter.init(filterItemInputElement); 
                };
            },
            () => this.styling.FocusIn(this.stylingComposite),  // focus in - show dropdown
            () => {
                if (!this.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
                {
                    this.resetFilter(); // if do not do this we will return to filtered list without text filter in input
                    this.styling.FocusOut(this.stylingComposite)
                }
                this.aspect.resetSkipFocusout();
            }, // focus out - hide dropdown
            () => this.optionsPanel.keyDownArrow(false), // arrow up
            () => this.optionsPanel.keyDownArrow(true),  // arrow down
            () => this.optionsPanel.hideDropDown(),  // tab on empty
            () => {
                this.selectionsPanel.removeSelectedTail();
                this.aspect.alignToFilterInputItemLocation(false);
            }, // backspace - "remove last"
            () => { 
                if (this.optionsPanel.getIsVisble())
                    this.optionsPanel.toggleHovered() }, // tab/enter "compleate hovered"
            () => {
                this.optionsPanel.hideDropDown(); // always hide 1st
                this.resetFilter();
            }, // esc  
            (filterInputValue, resetLength) => this.input(filterInputValue, resetLength) // filter
        );
             
        this.selectionsPanel =  SelectionsPanel(
            createElement,
            (filterItemElement) => {
                lazyfilterItemInputElementAtach(filterItemElement);
            },
            this.selectedItemContent,
            this.isComponentDisabled,
            () => this.optionsAdapter.triggerChange(),
            () => {
                this.optionsPanel.hideDropDown(); // always hide 1st
                this.resetFilter();
            },
            (event) => {
                if (!this.filterPanel.isEventTarget(event))
                    this.filterPanel.setFocus();
                this.aspect.alignAndShowDropDown(event);
            },
            (f, event) => {
                this.window.setTimeout(()=>f(),0)
                this.aspect.setPreventDefaultMultiSelectEvent(event)
            }
        );
        
        this.selectedPanel = this.selectionsPanel.selectedPanel; // TODO remove
        this.filterInputItem = this.selectionsPanel.filterInputItem;

        this.optionsPanel = OptionsPanel(
            createElement,
            () => this.aspect.onDropDownShow(),
            () => this.aspect.onDropDownHide(),
            this.dropDownItemContent,
            this.styling, 
            () => this.getVisibleMultiSelectDataList(),
            () => this.resetFilter(),
            () => this.aspect.alignToFilterInputItemLocation(true),
            () => this.filterPanel.setFocus()
        );

        this.aspect =  MultiSelectInputAspect(
            document,
            this.optionsAdapter.container, 
            this.selectionsPanel.selectedPanel, 
            this.selectionsPanel.filterInputItem, 
            this.optionsPanel.dropDownMenu, 
            () => this.optionsPanel.showDropDown(),
            () => {  
                this.optionsPanel.hideDropDown();
                this.resetFilter();
            },
            () => this.getVisibleMultiSelectDataList().length==0, 
            Popper
        );

        this.stylingComposite = this.createStylingComposite(container, 
            this.selectionsPanel.selectedPanel,
            this.selectionsPanel.filterInputItem, 
            this.filterPanel.input, 
            this.optionsPanel.dropDownMenu);
        
        this.styling.Init(this.stylingComposite);

        if (this.optionsAdapter.afterContainerFilled)
            this.optionsAdapter.afterContainerFilled();


        
        
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        
        this.UpdateSize();
        this.UpdateDisabled();
        
        this.updateDataImpl();
    }
}

export default MultiSelect;
