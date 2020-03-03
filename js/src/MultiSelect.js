import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksList} from './PicksList'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'
import {removeElement} from './ToolsDom'
import {Choice, toggleOptionSelected as toggleOptionSelectedLib, updateSelected, setOptionSelected, setOptionSelectedTrue, setOptionSelectedFalse} from './Choice'

import {sync} from './ToolsJs'

function filterMultiSelectData(choice, isFiltered, visibleIndex) {
    choice.visible = isFiltered;
    choice.visibleIndex = visibleIndex;
    choice.setVisible(isFiltered);
    //MultiSelectData.choiceElement.style.display = isFiltered ? 'block': 'none';
} 

function resetChoices(choicesList) {
    for(let i=0; i<choicesList.length; i++)
    {
        let choice = choicesList[i];
        if ( !choice.isOptionHidden )
        {
            filterMultiSelectData(choice, true, i);
        }
    }
}

function collectFilterChoices(choicesList, text) {
    var list = [];
    var j = 0;
    for(let i=0; i<choicesList.length; i++)
    {
        let choice = choicesList[i];
        if ( !choice.isOptionHidden )
        {
            if ( choice.excludedFromSearch || choice.searchText.indexOf(text)<0 )
            {
                filterMultiSelectData(choice, false, null);
            }
            else 
            {
                filterMultiSelectData(choice, true, j++);
                list.push( choice );
            }
        }
    }
    return list;
}

export class MultiSelect {

    constructor(
        getOptions,
        common,
        getIsComponentDisabled,
        setSelected, 
        getIsOptionDisabled,
        getIsOptionHidden,
        staticContent, 
        pickContentGenerator, 
        choiceContentGenerator, 
        labelAdapter, 
        placeholderText,
        isRtl, 
        onChange,
        css,
        popper, window) {
        this.isRtl = isRtl;
        // readonly
        this.common = common;
        this.getOptions=getOptions;
        this.getIsOptionDisabled = getIsOptionDisabled;
        this.getIsOptionHidden = getIsOptionHidden;
        this.staticContent = staticContent;
        //this.styling = styling;
        this.pickContentGenerator = pickContentGenerator;
        this.choiceContentGenerator = choiceContentGenerator;
        this.labelAdapter = labelAdapter;
        //this.createStylingComposite = createStylingComposite;
        this.placeholderText = placeholderText;
        this.setSelected=setSelected; // should I rebind this for callbacks? setSelected.bind(this);
        this.css = css;
        this.popper = popper;
        this.window = window;

        this.visibleCount=10;

        this.choicesPanel = null;

        this.stylingComposite = null;
        this.onChange=onChange;
        
        this.getIsComponentDisabled = getIsComponentDisabled;
                
        this.resetChoicesList();
    }

    toggleOptionSelected(choice){
        return toggleOptionSelectedLib(choice, this.setSelected);
    }

    resetChoicesList(){
        this.choicesList = [];
        this.filteredChoicesList = null;
    }

    
    getVisibleChoicesList(){
        return (this.filteredChoicesList)? 
            this.filteredChoicesList:
            this.choicesList
    }

    resetFilter(){
        if (!this.filterPanel.isEmpty()) {
            this.filterPanel.setEmpty();
            this.placeholderAspect.updateEmptyInputWidth();
            this.processEmptyInput();
            this.placeholderAspect.updatePlacehodlerVisibility();
        }
    }

    processEmptyInput(){
        this.placeholderAspect.updateEmptyInputWidth();
        resetChoices(this.choicesList);
        this.filteredChoicesList = null;
    }

    // -----------------------------------------------------------------------------------------------------------------------
    GetContainer(){
        return this.staticContent.containerElement;
    }
    GetChoices(){
        return this.staticContent.choicesElement;
    }
    GetFilterInput(){
        return this.staticContent.filterInputElement;
    }
    Update(){
        this.UpdateAppearance();
        this.UpdateData();
    }

    /*
    UpdateOption(index){
        let multiSelectData = this.MultiSelectDataList[index];
        let option = multiSelectData.option;
        multiSelectData.searchText = option.text.toLowerCase().trim();
        if (multiSelectData.isOptionHidden != option.isHidden)
        {
            multiSelectData.isOptionHidden=option.isHidden;
            if (multiSelectData.isOptionHidden)
                this.optionsPanel.insertChoice(multiSelectData, 
                    (p1,p2,p3)=>this.picksList.addPick(p1,p2,p3),
                    ()=>this.optionsAdapter.triggerChange(),
                    option.isOptionSelected, option.isDisabled);
            else
                multiSelectData.removeChoiceElement();
        }
        else 
        {
            if (multiSelectData.isOptionSelected != option.isOptionSelected)
            {
                multiSelectData.isOptionSelected=option.isOptionSelected;
                if (multiSelectData.isOptionSelected)
                {
                    // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isOptionSelected, isDisabled);
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
                    // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isOptionSelected, isDisabled);
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
        this.aspect.hideChoices(); // always hide 1st
        this.picksList.removeAll();
        this.resetFilter();
    }

    PicksCount(){
        return this.picksList.getCount();
    }

    SelectAll(){
        this.aspect.hideChoices(); // always hide 1st

        for(let i=0; i<this.choicesList.length; i++)
        {
            let choice = this.choicesList[i];
            if (!choice.excludedFromSearch)
                if (!choice.isOptionSelected  && !choice.isOptionDisabled && !choice.isOptionHidden)
                    setOptionSelectedTrue(choice, this.setSelected)
        }
        this.resetFilter();
    }

    empty(){
        // close drop down , remove filter
        this.aspect.hideChoices(); // always hide 1st
        this.resetFilter();

        this.staticContent.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
        // for(let i=0; i<this.MultiSelectDataList.length; i++)
        // {
        //     let multiSelectData = this.MultiSelectDataList[i];
        //     if (multiSelectData.choice)
        //         multiSelectData.choice.remove();
        // }
        this.resetChoicesList();
        this.picksList.clear();
        this.placeholderAspect.updatePlacehodlerVisibility();
    }

    UpdateData(){
        this.empty();
        // reinitiate
        this.updateDataImpl();
    }

    UpdateSelected(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateSelectedChoice(i)
        }
    }

    UpdateSelectedChoice(key){
        let choice = this.choicesList[key]; // TODO: 
        updateSelected(choice, this.setSelected)
    }

    SetSelectedChoice(key, value){
        let choice = this.choicesList[key];
        setOptionSelected(choice, value, this.setSelected);
    }

    createPick(choice){
        let pickElement = this.staticContent.createPickElement(); 
        let attachPickElement = () => this.staticContent.picksElement.insertBefore(pickElement, this.staticContent.pickFilterElement);
        let detach = () => removeElement(pickElement);
        let pickContent = this.pickContentGenerator(pickElement);
        
        var pick = {
            disableRemove: () => pickContent.disableRemove(this.getIsComponentDisabled()),
            setData: () => pickContent.setData(choice.option),
            disable: () => pickContent.disable( this.getIsOptionDisabled(choice.option) ),
            remove: null,
            dispose: () => { 
                detach(); 
                pickContent.dispose(); 
                pick.disableRemove=null; pick.setData=null; pick.disable=null; pick.remove=null; 
                pick.dispose=null;  
            }, 
        }
        pick.setData();
        pick.disable();
        pick.disableRemove();
        attachPickElement();
        var removeFromList = this.picksList.addPick(pick);
        
        choice.updateSelectedFalse = () => {
            removeFromList();
            pick.dispose();
            choice.isOptionSelected = false;
            choice.excludedFromSearch = choice.isOptionDisabled; 
            if (choice.isOptionDisabled)
            {
                choice.disable( /*isOptionDisabled*/ true, /*isOptionSelected*/ false); 
            }
            choice.select();
            if (this.picksList.getCount()==0) 
                this.placeholderAspect.updatePlacehodlerVisibility()
            this.onChange();
        }
        let setSelectedFalse = () => setOptionSelectedFalse(choice, this.setSelected)
        pick.remove = setSelectedFalse;
    
        this.aspect.handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);

        choice.isOptionSelected = true;
        choice.excludedFromSearch = true; // all selected excluded from search
        choice.select();
        if (this.picksList.getCount()==1) 
            this.placeholderAspect.updatePlacehodlerVisibility()
    }

    createChoice(option, i){
        let isOptionSelected = option.selected;
        let isOptionDisabled = this.getIsOptionDisabled(option); 
        let isOptionHidden   = this.getIsOptionHidden(option);
        
        var choice = Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden);
        if (!isOptionHidden){
            var {choiceElement, setVisible, attach} = this.staticContent.createChoiceElement();
            var unbindChoiceElement = this.choicesPanel.adoptChoiceElement(choice, choiceElement);
            
            choice.updateSelectedTrue = () => {
                this.createPick(choice);
                this.onChange();
            }

            choice.visible = true;
            choice.visibleIndex=i;

            

            

            let choiceContent = this.choiceContentGenerator(choiceElement, ()=>{
                this.toggleOptionSelected(choice);
                this.filterPanel.setFocus();
            });
            attach();

            choiceContent.setData(choice.option);

            choice.updateHoverIn = () => {
                choiceContent.hoverIn(choice.isHoverIn);
            }

            choice.select = () => {
                choiceContent.select(choice.isOptionSelected);
            }

            choice.disable = (isDisabled, isOptionSelected) => {
                choiceContent.disable( isDisabled, isOptionSelected); 
            }

            choice.dispose = ()=> {
                unbindChoiceElement();
                choiceContent.dispose();

                choice.setVisible = null;
                choice.updateHoverIn = null;
                choice.select = null;
                choice.disable = null;
                choice.dispose = null;

                choice.updateSelectedFalse = null;
                choice.updateSelectedTrue = null;
            }

            if (choice.isOptionDisabled)
                choiceContent.disable(true, choice.isOptionSelected )


            choice.setVisible = isVisible => setVisible(isVisible)
            
            if (isOptionSelected){
                this.createPick(choice);
            } 
            else
            {
                choice.excludedFromSearch =  choice.isOptionDisabled;
            }
        }
        return choice;
    }

    updateDataImpl(){
        var fillChoices = () => {
            let options = this.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                let choice = this.createChoice(option,i);
                this.choicesList.push(choice);
            } 
            this.aspect.alignToFilterInputItemLocation(false);
        }
        // browsers can change select value as part of "autocomplete" (IE11) 
        // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
        // but they never "restore" selected-disabled options.
        // TODO: make the FROM Validation for 'selected-disabled' easy.
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
            this.aspect.hideChoices,
            this.picksList.dispose,
            this.filterPanel.dispose,
            this.labelAdapter.dispose,
            this.aspect.dispose,
            this.staticContent.dispose
        );

        for(let i=0; i<this.choicesList.length; i++)
        {
            let choice = this.choicesList[i];
            if (choice.dispose){
                choice.dispose();
            }
        }
    }

    UpdateAppearance(){
        this.UpdateDisabled();    
    }

    UpdateDisabled(){
        let isComponentDisabled = this.getIsComponentDisabled();
        if (this.isComponentDisabled!==isComponentDisabled){
            this.picksList.disableRemoveAll(isComponentDisabled);
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
            this.filteredChoicesList = collectFilterChoices(this.choicesList, text);
            if (this.filteredChoicesList.length == 1)
            {
                let fullMatchChoice =  this.filteredChoicesList[0];
                if (fullMatchChoice.searchText == text)
                {
                    setOptionSelectedTrue(fullMatchChoice, this.setSelected);
                    this.filterPanel.setEmpty(); // clear
                    this.placeholderAspect.updateEmptyInputWidth();
                    isEmpty=true;
                }
            }
        }
        if (isEmpty)
            this.processEmptyInput();
        else
            resetLength();  
        
        this.choicesPanel.stopAndResetChoicesHover();
        if (this.getVisibleChoicesList().length == 1) {
            this.choicesPanel.setFirstChoiceHovered();
        }

        if (this.getVisibleChoicesList().length > 0) {
            this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.aspect.showChoices();
        } else {
            this.aspect.hideChoices();
        }
    }

    init() {
        this.filterPanel = FilterPanel(
            this.staticContent.filterInputElement,
            () => {
                this.staticContent.pickFilterElement.appendChild(this.staticContent.filterInputElement);
                this.labelAdapter.init(this.staticContent.filterInputElement); 
                this.staticContent.picksElement.appendChild(
                    this.staticContent.pickFilterElement); // located filter in selectionsPanel                    
            },
            () => {
                this.staticContent.setIsFocusIn(true)
                this.staticContent.toggleFocusStyling();
            },  // focus in - show dropdown
            () => {
                if (!this.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
                {
                    this.resetFilter(); // if do not do this we will return to filtered list without text filter in input
                    this.staticContent.setIsFocusIn(false);
                    this.staticContent.toggleFocusStyling();
                }
                this.aspect.resetSkipFocusout();
            }, // focus out - hide dropdown
            () => this.choicesPanel.keyDownArrow(false), // arrow up
            () => this.choicesPanel.keyDownArrow(true),  // arrow down
            () => this.aspect.hideChoices(),  // tab on empty
            () => {
                this.picksList.removePicksTail();
                this.aspect.alignToFilterInputItemLocation(false);
            }, // backspace - "remove last"
            /*onEnterOrTabToCompleate*/() => { 
                if (this.staticContent.isChoicesVisible()) {
                    let hoveredChoice = this.choicesPanel.getHoveredChoice();
                    if (hoveredChoice){
                    var wasToggled = this.toggleOptionSelected(hoveredChoice);
                        if (wasToggled) {
                            this.choicesPanel.resetChoicesHover();
                            this.aspect.hideChoices();
                            this.resetFilter();
                        }
                    }
                } 
            }, // tab/enter "compleate hovered"
            (isEmpty, event) => {
                if (!isEmpty || this.staticContent.isChoicesVisible()) // supports bs modal - stop esc (close modal) propogation
                    event.stopPropagation();
            }, // esc keydown
            () => {
                this.aspect.hideChoices(); // always hide 1st
                this.resetFilter();
            }, // esc keyup 
            (filterInputValue, resetLength) =>
            { 
                this.placeholderAspect.updatePlacehodlerVisibility();
                this.input(filterInputValue, resetLength) 
            }
        );
        
        this.picksList =  PicksList();

        this.choicesPanel = ChoicesPanel(
            () => this.aspect.eventSkipper,
            () => this.getVisibleChoicesList(),
            () => {
                this.aspect.alignToFilterInputItemLocation(true);
                this.aspect.showChoices();
            }
        );

        this.placeholderAspect = PlaceholderAspect(
            this.placeholderText, 
            () => this.picksList.isEmpty() && this.filterPanel.isEmpty(), 
            this.staticContent.picksElement, 
            this.staticContent.filterInputElement,
            this.css
        )

        this.placeholderAspect.updateEmptyInputWidth();
        
        this.aspect =  MultiSelectInputAspect(
            this.window,
            ()=>this.staticContent.appendToContainer(), 
            this.staticContent.filterInputElement, 
            this.staticContent.picksElement, 
            this.staticContent.choicesElement, 
            ()=>this.staticContent.isChoicesVisible(),
            (visible)=>this.staticContent.setChoicesVisible(visible),
            () => this.choicesPanel.resetCandidateToHoveredChoice(),
            () => this.resetFilter(),
            () => this.getVisibleChoicesList().length==0, 
            /*onClick*/(event) => {
                if (!this.filterPanel.isEventTarget(event))
                     this.filterPanel.setFocus();
            },
            this.isRtl,
            this.popper
        );
        
        this.staticContent.attachContainer();

        
        this.updateDataImpl();
        this.UpdateAppearance(); // TODO: now appearance should be done after updateDataImpl, because items should be "already in place", correct it
    }
}