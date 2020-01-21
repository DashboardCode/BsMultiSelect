import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksPanel} from './PicksPanel'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'

import {removeElement, EventSkipper} from './ToolsDom'
import {sync} from './ToolsJs'

function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
    MultiSelectData.visible = isFiltered;
    MultiSelectData.visibleIndex = visibleIndex;
    MultiSelectData.choiceElement.style.display = isFiltered ? 'block': 'none';
} 

function resetChoices(MultiSelectDataList) {
    for(let i=0; i<MultiSelectDataList.length; i++)
    {
        let multiSelectData = MultiSelectDataList[i];
        if ( !multiSelectData.isHidden )
        {
            filterMultiSelectData(multiSelectData, true, i);
        }
    }
}

function collectFilterChoices(MultiSelectDataList, text) {
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

export class MultiSelect {

    constructor(optionsAdapter, setSelected, staticContent, /* styling, */
        pickContentGenerator, choiceContentGenerator, 
        labelAdapter, 
        //MultiSelect, 
        placeholderText,
        //onUpdate, 
        //onDispose, 
        popper, window) {

        this.onUpdate = null;
        this.onDispose = null; 

        // readonly
        this.optionsAdapter = optionsAdapter;
        this.staticContent = staticContent;
        //this.styling = styling;
        this.pickContentGenerator = pickContentGenerator;
        this.choiceContentGenerator = choiceContentGenerator;
        this.labelAdapter = labelAdapter;
        //this.createStylingComposite = createStylingComposite;
        this.placeholderText = placeholderText;
        this.setSelected=setSelected; // should I rebind this for callbacks? setSelected.bind(this);
        this.popper = popper;
        this.window = window;

        this.visibleCount=10;

        this.choicesPanel = null;

        this.stylingComposite = null;

        this.isComponentDisabled = null;
                
        this.resetMultiSelectDataList();
    }

    resetMultiSelectDataList(){
        this.MultiSelectDataList = [];
        this.filteredMultiSelectDataList = null;
    }

    
    getVisibleMultiSelectDataList(){
        return (this.filteredMultiSelectDataList)? 
            this.filteredMultiSelectDataList:
            this.MultiSelectDataList
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
        resetChoices(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
    }

    // -----------------------------------------------------------------------------------------------------------------------
    GetContainer(){
        return this.staticContent.containerElement;
    }

    Update(){
        if (this.onUpdate)
            this.onUpdate();
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
                this.optionsPanel.insertChoice(multiSelectData, 
                    (p1,p2,p3)=>this.picksPanel.createPick(p1,p2,p3),
                    ()=>this.optionsAdapter.triggerChange(),
                    option.isSelected, option.isDisabled);
            else
                multiSelectData.removeChoiceElement();
        }
        else 
        {
            if (multiSelectData.isSelected != option.isSelected)
            {
                multiSelectData.isSelected=option.isSelected;
                if (multiSelectData.isSelected)
                {
                    // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isSelected, isDisabled);
                }
                else
                {
                    // multiSelectData.removeChoiceElement();
                }
            }
            if (multiSelectData.isDisabled != option.isDisabled)
            {
                multiSelectData.isDisabled=option.isDisabled;
                if (multiSelectData.isDisabled)
                {
                    // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isSelected, isDisabled);
                }
                else
                {
                    // multiSelectData.removeChoiceElement();
                }
            }
        }    
        //multiSelectData.updateOption();
    }*/

    DeselectAll(){
        this.choicesPanel.hideChoices(); // always hide 1st
        this.picksPanel.deselectAll();
        this.resetFilter();
    }

    SelectAll(){
        this.choicesPanel.hideChoices(); // always hide 1st

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (!multiSelectData.excludedFromSearch)
                if (multiSelectData.toggle)
                    multiSelectData.toggle();
        }
        this.resetFilter();
    }

    empty(){
        // close drop down , remove filter
        this.choicesPanel.hideChoices(); // always hide 1st
        this.resetFilter();

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            if (multiSelectData.choiceElement)
                removeElement(multiSelectData.choiceElement);
        }
        this.resetMultiSelectDataList();
        this.picksPanel.clear();
        this.placeholderAspect.updatePlacehodlerVisibility();
    }

    UpdateData(){
        this.empty();
        // reinitiate
        this.updateDataImpl();
    }

    updateDataImpl(){
        var fillChoices = () => {
            let options = this.optionsAdapter.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];

                let isSelected = option.selected;

                let isOptionDisabled = (option.disabled)?option.disabled:false;
                let isOptionHidden   = (option.hidden)?option.hidden:false;
                
                var MultiSelectData = {
                    searchText: option.text.toLowerCase().trim(),
                    excludedFromSearch: isSelected || isOptionDisabled || isOptionHidden,
                    option: option,
                    isOptionDisabled: isOptionDisabled,
                    isHidden: isOptionHidden,
                    choiceElement: null,
                    choiceContent: null,
                    //selectedPrev: null,
                    //selectedNext: null,
                    visible: false,
                    toggle: null,
                    pickElement: null,
                    remove: null,
                    disable: null,
                    removeChoiceElement: null
                };

                this.MultiSelectDataList.push(MultiSelectData);
                if (!isOptionHidden){
                    MultiSelectData.visible = true;
                    MultiSelectData.visibleIndex=i;
                    this.choicesPanel.insertChoice(
                        MultiSelectData, 
                        /*createSelectedItemGen*/ (multiSelectData/*,isOptionDisabled,setChoiceContentDisabled*/) => {
                            this.picksPanel.createPick(
                                multiSelectData,
                                multiSelectData.option,
                                this.isComponentDisabled
                                )
                        },
                        (o,i) => this.setSelected(o,i),
                        () => this.optionsAdapter.triggerChange()
                        ,isSelected
                        );
                }
            } 
            this.aspect.alignToFilterInputItemLocation(false);
        }

        // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
        if (document.readyState != 'loading'){
            fillChoices();
        } else {
            var domContentLoadedHandler = function(){
                fillChoices();
                document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
            }
            document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
        }
    }

    Dispose(){
        sync(
            this.onDispose,
            this.choicesPanel.hideChoices,
            this.optionsAdapter.dispose,
            this.picksPanel.dispose,
            this.filterPanel.dispose,
            this.labelAdapter.dispose,
            this.aspect.dispose,
            this.staticContent.dispose
        );

        for(let i=0; i<this.MultiSelectDataList.length; i++)
        {
            let multiSelectData = this.MultiSelectDataList[i];
            multiSelectData.toggle = null;
            multiSelectData.remove = null; 
            multiSelectData.removeChoiceElement = null;
            if (multiSelectData.DisposeChoiceElement)
                multiSelectData.DisposeChoiceElement();
            
            if (multiSelectData.ChoiceContent)
                multiSelectData.ChoiceContent.dispose();
        }
    }

    UpdateDisabled(){
        let isComponentDisabled = this.optionsAdapter.getDisabled();
        if (this.isComponentDisabled!==isComponentDisabled){
            this.picksPanel.disable(isComponentDisabled);
            this.aspect.disable(isComponentDisabled);
            this.placeholderAspect.setDisabled(isComponentDisabled);
            this.staticContent.disable(isComponentDisabled);
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
            this.filteredMultiSelectDataList = collectFilterChoices(this.MultiSelectDataList, text);
            if (this.filteredMultiSelectDataList.length == 1)
            {
                let fullMatchMultiSelectData =  this.filteredMultiSelectDataList[0];
                if (fullMatchMultiSelectData.searchText == text)
                {
                    if (fullMatchMultiSelectData.toggle)
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
        
        
        this.choicesPanel.stopAndResetChoicesHover();
        if (this.getVisibleMultiSelectDataList().length == 1) {
            this.choicesPanel.hoverInInternal(0)
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
            this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.choicesPanel.showChoices();
        } else {
            this.choicesPanel.hideChoices();
        }
    }

    init() {
        var document = this.window.document;
        var createElement = (name) => document.createElement(name);

        this.filterPanel = FilterPanel(
            this.staticContent.filterInputElement,
            () => {
                this.staticContent.pickFilterElement.appendChild(this.staticContent.filterInputElement);
                this.labelAdapter.init(this.staticContent.filterInputElement); 
                this.staticContent.picksElement.appendChild(
                    this.staticContent.pickFilterElement); // located filter in selectionsPanel                    
            },
            () => {
                this.staticContent.focus(true)
            },  // focus in - show dropdown
            () => {
                if (!this.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
                {
                    this.resetFilter(); // if do not do this we will return to filtered list without text filter in input
                    this.staticContent.focus(false)
                }
                this.aspect.resetSkipFocusout();
            }, // focus out - hide dropdown
            () => this.choicesPanel.keyDownArrow(false), // arrow up
            () => this.choicesPanel.keyDownArrow(true),  // arrow down
            () => this.choicesPanel.hideChoices(),  // tab on empty
            () => {
                this.picksPanel.removePicksTail();
                this.aspect.alignToFilterInputItemLocation(false);
            }, // backspace - "remove last"
            () => { 
                if (this.choicesPanel.getIsVisble())
                    this.choicesPanel.toggleHovered() }, // tab/enter "compleate hovered"
            (isEmpty, event) => {
                if (!isEmpty || this.choicesPanel.getIsVisble()) // supports bs modal - stop esc (close modal) propogation
                    event.stopPropagation();
            }, // esc keydown
            () => {
                this.choicesPanel.hideChoices(); // always hide 1st
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
            /*createElement*/ () => {
                var pickElement = createElement('LI');
                return {
                    pickElement,
                    attach: () => this.staticContent.picksElement
                        .insertBefore(pickElement, this.staticContent.pickFilterElement)
                }
            },
            this.pickContentGenerator,
            /*onPickCreated*/ (multiSelectData, removePick, count) => {
                multiSelectData.excludedFromSearch = true; // all selected excluded from search
                multiSelectData.toggle = () => removePick();
                multiSelectData.ChoiceContent.select(true);
                if (count==1) 
                    this.placeholderAspect.updatePlacehodlerVisibility()
            },
            /*onPickRemoved*/ (multiSelectData, removePick) => {
                let confirmed = this.setSelected(multiSelectData.option, false);
                if (!(confirmed===false)) {
                    var {createPick, count} = removePick();
                    multiSelectData.excludedFromSearch = multiSelectData.isOptionDisabled;
                    if (multiSelectData.isOptionDisabled)
                    {
                        multiSelectData.ChoiceContent.disable( /*isDisabled*/ true, /*isSelected*/ true); // TODO test it, THERE SHOULD BE SOMETHING WRONGGGG
                        multiSelectData.toggle = null;
                    }
                    else
                    {
                        multiSelectData.toggle = ()=>{
                            let confirmed = this.setSelected(multiSelectData.option, true);
                            if (!(confirmed===false)){
                                createPick(multiSelectData, multiSelectData.option, this.isComponentDisabled );
                                this.optionsAdapter.triggerChange();
                            }
                        };
                    }
                    multiSelectData.ChoiceContent.select(false);
                    if (count==0) 
                        this.placeholderAspect.updatePlacehodlerVisibility()
                    this.optionsAdapter.triggerChange();
                }
            },
            (doUncheck, event) => {
                this.aspect.processUncheck(doUncheck, event);
                this.choicesPanel.hideChoices(); // always hide 1st
                this.resetFilter();
            }
        );

        this.choicesPanel = ChoicesPanel(
            createElement,
            this.staticContent.choicesElement,
            () => this.aspect.onChoicesShow(),
            () => this.aspect.onChoicesHide(),
            EventSkipper(this.window),
            this.choiceContentGenerator,
            () => this.getVisibleMultiSelectDataList(),
            () => this.resetFilter(),
            () => this.aspect.alignToFilterInputItemLocation(true),
            () => this.filterPanel.setFocus()
        );

        this.placeholderAspect = PlaceholderAspect(
            this.placeholderText, 
            () => this.picksPanel.isEmpty(), 
            () => this.filterPanel.isEmpty(), 
            this.staticContent.picksElement, 
            this.staticContent.filterInputElement
        )

        this.placeholderAspect.updateEmptyInputWidth();

        this.aspect =  MultiSelectInputAspect(
            this.window,
            ()=>this.staticContent.appendToContainer(), 
            this.staticContent.filterInputElement, 
            this.staticContent.picksElement, 
            this.staticContent.choicesElement, 
            () => this.choicesPanel.showChoices(),
            () => {  
                this.choicesPanel.hideChoices();
                this.resetFilter();
            },
            () => this.getVisibleMultiSelectDataList().length==0, 
            /*onClick*/(event) => {
                if (!this.filterPanel.isEventTarget(event))
                     this.filterPanel.setFocus();
            },
            this.popper
        );
        
        this.staticContent.attachContainer();

        if (this.onUpdate)
            this.onUpdate();
        this.updateDataImpl();
        this.UpdateDisabled(); // should be done after updateDataImpl

        if (this.optionsAdapter.onReset)
            this.optionsAdapter.onReset(()=> this.window.setTimeout( ()=>this.UpdateData() ) );
    }
}