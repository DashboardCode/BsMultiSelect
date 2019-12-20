import Popper from 'popper.js'
import FilterPanel from './FilterPanel.js'
import OptionsPanel from './OptionsPanel.js'
import PicksPanel from './PicksPanel.js'
import MultiSelectInputAspect from './MultiSelectInputAspect.js'
//import PlaceholderAsElementAspect from './PlaceholderAsElementAspect.js'
import PlaceholderAsInputAspect from './PlaceholderAsInputAspect.js'

import EventSkipper from './EventSkipper.js'
import removeElement from './removeElement.js'

function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
    MultiSelectData.visible = isFiltered;
    MultiSelectData.visibleIndex = visibleIndex;
    MultiSelectData.dropDownMenuItemElement.style.display = isFiltered ? 'block': 'none';
} 

function resetDropDownMenu(MultiSelectDataList) {
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
    constructor(optionsAdapter, setSelected, containerAdapter, styling, 
        selectedItemContent, dropDownItemContent, 
        labelAdapter, createStylingComposite, placeholderText,
        configuration, onDispose, window) {
        if (typeof Popper === 'undefined') {
            throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
        }

        this.onDispose = onDispose; // public

        // readonly
        this.optionsAdapter = optionsAdapter;
        this.containerAdapter = containerAdapter;
        this.styling = styling;
        this.selectedItemContent = selectedItemContent;
        this.dropDownItemContent = dropDownItemContent;
        this.labelAdapter = labelAdapter;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
        this.placeholderText = placeholderText;
        this.setSelected=setSelected; // should I rebind this for callbacks? setSelected.bind(this);
        this.window = window;

        this.visibleCount=10;

        this.optionsPanel = null;

        this.stylingComposite = null;

        this.isComponentDisabled = null;
                
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
            this.placeholderAspect.updatePlacehodlerVisibility();
        }
    }

    processEmptyInput(){
        this.filterPanel.setEmptyLength();
        resetDropDownMenu(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
    }

    // -----------------------------------------------------------------------------------------------------------------------
    GetContainer(){
        return this.containerAdapter.container;
    }

    Update(){
        this.UpdateIsValid();
        this.UpdateSize();
        this.UpdateDisabled();
        this.UpdateData();
    }

    /*
    UpdateOption(index){
        let multiSelectData = this.MultiSelectDataList[index];
        let option = multiSelectData.option;
        multiSelectData.searchText = option.text.toLowerCase().trim();
        if (multiSelectData.isHidden != option.isHidden)
        {
            multiSelectData.isHidden=option.isHidden;
            if (multiSelectData.isHidden)
                this.optionsPanel.insertDropDownItem(multiSelectData, 
                    (p1,p2,p3)=>this.picksPanel.createSelectedItem(p1,p2,p3),
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
    }*/

    DeselectAll(){
        this.optionsPanel.hideDropDown(); // always hide 1st

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.selectedItemElement)
                multiSelectData.toggle();
        }
        this.resetFilter();
        
    }

    SelectAll(){
        this.optionsPanel.hideDropDown(); // always hide 1st

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (!multiSelectData.excludedFromSearch)
                multiSelectData.toggle();
        }
        this.resetFilter();
    }

    empty(){
        // close drop down , remove filter and listeners
        this.optionsPanel.hideDropDown(); // always hide 1st
        this.resetFilter();

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.dropDownMenuItemElement)
                removeElement(multiSelectData.dropDownMenuItemElement);
            if (multiSelectData.selectedItemElement)
                removeElement(multiSelectData.selectedItemElement);
        }
        this.resetMultiSelectDataList();
        this.picksPanel.resetMultiSelectDataSelectedTail();// this.MultiSelectDataSelectedTail = null;
    }

    UpdateData(){
        this.empty();
        // reinitiate
        this.updateDataImpl();
        
    }

    updateDataImpl(){
        var createDropDownItems = () => {
            let options = this.optionsAdapter.getOptions();
            var j = 0;
            for(let i = 0; i<options.length; i++) {
                let option = options[i];

                let isSelected = option.selected;

                let isDisabled = (option.disabled)?option.disabled:false;
                let isHidden   = (option.hidden)?option.hidden:false;
                
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
                    this.optionsPanel.insertDropDownItem(
                        MultiSelectData, 
                        (p1,p2,p3) => this.picksPanel.createSelectedItem(p1,p2,p3),
                        (o,i) => this.setSelected(o,i),
                        () => this.optionsAdapter.triggerChange(), 
                        isSelected, 
                        isDisabled);
                }
            } 
            this.aspect.alignToFilterInputItemLocation(false);
            //this.placeholderAspect.updatePlacehodlerVisibility();
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
        if (this.optionsAdapter.dispose)
            this.optionsAdapter.dispose();
        this.picksPanel.dispose();
        this.filterPanel.dispose();
        
        this.labelAdapter.dispose();
        
        this.aspect.dispose();
        
        this.containerAdapter.dispose();

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            multiSelectData.toggle = null;
            multiSelectData.remove = null; 
            multiSelectData.removeDropDownMenuItemElement = null;
            if (multiSelectData.DisposeDropDownMenuItemElement)
                multiSelectData.DisposeDropDownMenuItemElement();
            
            if (multiSelectData.SelectedItemContent)
                multiSelectData.SelectedItemContent.dispose();
            if (multiSelectData.DropDownItemContent)
                multiSelectData.DropDownItemContent.dispose();
        }
    }

    UpdateSize(){
        if (this.styling.UpdateSize){
            this.styling.UpdateSize(this.stylingComposite, this.optionsAdapter.getSize() );
        }
        //this.placeholderAspect.updatePadding();
    }

    UpdateIsValid(){
        if (this.styling.UpdateIsValid)
            this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
    }

    UpdateDisabled(){
        let isComponentDisabled = this.optionsAdapter.getDisabled();
        if (this.isComponentDisabled!==isComponentDisabled){
            if (isComponentDisabled) {
                this.picksPanel.disable();
                this.placeholderAspect.setDisabled(true);
                this.styling.Disable(this.stylingComposite);
            } else {
                this.picksPanel.enable();
                this.placeholderAspect.setDisabled(false);
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
        var document = this.window.document;
        var createElement = (name) => document.createElement(name);
        let container = this.containerAdapter.container;

        var lazyfilterItemInputElementAtach=null;
        
        this.filterPanel = FilterPanel(
            createElement,
            (filterItemInputElement) => {
                lazyfilterItemInputElementAtach = (filterItemElement)=>{
                    filterItemElement.appendChild(filterItemInputElement);
                    this.labelAdapter.init(filterItemInputElement); 
                };
            },
            () => {
                this.styling.FocusIn(this.stylingComposite)
            },  // focus in - show dropdown
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
                this.picksPanel.removeSelectedTail();
                this.aspect.alignToFilterInputItemLocation(false);
            }, // backspace - "remove last"
            () => { 
                if (this.optionsPanel.getIsVisble())
                    this.optionsPanel.toggleHovered() }, // tab/enter "compleate hovered"
            (isEmpty, event) => {
                if (!isEmpty || this.optionsPanel.getIsVisble()) // supports bs modal - stop esc (close modal) propogation
                    event.stopPropagation();
            }, // esc keydown
            () => {
                this.optionsPanel.hideDropDown(); // always hide 1st
                this.resetFilter();
            }, // esc keyup 
            (filterInputValue, resetLength) =>
            { 
                this.placeholderAspect.updatePlacehodlerVisibility();
                this.input(filterInputValue, resetLength) 
            }, // filter
            () => {
                this.placeholderAspect.updateEmptyInputWidth();
            }
        );
        
        this.picksPanel =  PicksPanel(
            this.setSelected,
            createElement,
            this.containerAdapter.picksElement,
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
            ()=> this.placeholderAspect.updatePlacehodlerVisibility(),
            (doUncheck, event) => {
                this.aspect.processUncheck(doUncheck, event);
            }
        );

        this.optionsPanel = OptionsPanel(
            createElement,
            this.containerAdapter.optionsElement,
            () => this.aspect.onDropDownShow(),
            () => this.aspect.onDropDownHide(),
            EventSkipper(this.window),
            this.dropDownItemContent,
            this.styling, 
            () => this.getVisibleMultiSelectDataList(),
            () => this.resetFilter(),
            () => this.aspect.alignToFilterInputItemLocation(true),
            () => this.filterPanel.setFocus()
        );

        // this.placeholderAspect = PlaceholderAsElementAspect(
        //     this.placeholderText, 
        //     () => this.picksPanel.isEmpty(),
        //     () => this.filterPanel.isEmpty(), 
        //     this.containerAdapter.picksElement,
        //     this.filterPanel.inputElement, 
        //     createElement, 
        //     ()=>this.isComponentDisabled,
        //     this.picksPanel.inputItemElement);

        this.placeholderAspect = PlaceholderAsInputAspect(
            this.placeholderText, 
            () => this.picksPanel.isEmpty(), 
            () => this.filterPanel.isEmpty(), 
            this.containerAdapter.picksElement, 
            this.filterPanel.inputElement
        )

        this.placeholderAspect.init();
        this.placeholderAspect.updateEmptyInputWidth();
        

        this.aspect =  MultiSelectInputAspect(
            this.window,
            ()=>this.containerAdapter.appendToContainer(), 
            this.picksPanel.inputItemElement, 
            this.containerAdapter.picksElement, 
            this.containerAdapter.optionsElement, 
            () => this.optionsPanel.showDropDown(),
            () => {  
                this.optionsPanel.hideDropDown();
                this.resetFilter();
            },
            () => this.getVisibleMultiSelectDataList().length==0, 
            Popper
        );
        
        this.stylingComposite = this.createStylingComposite(container, 
            this.containerAdapter.picksElement,
            this.picksPanel.placeholderItemElement, 
            this.picksPanel.inputItemElement, 
            this.filterPanel.inputElement, 
            this.containerAdapter.optionsElement);
        
        this.styling.Init(this.stylingComposite);

        this.containerAdapter.attachContainer();

        this.UpdateSize();            
        this.UpdateIsValid();
        this.UpdateDisabled(); // should be done after updateDataImpl
        this.updateDataImpl();

        if (this.optionsAdapter.subscribeToReset)
            this.optionsAdapter.subscribeToReset(()=> this.window.setTimeout( ()=>this.UpdateData() ) );
    }
}

export default MultiSelect;
