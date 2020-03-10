import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksList} from './PicksList'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'
import {removeElement} from './ToolsDom'
import {Choice, isVisibleChoice, updateDisabledChoice, updateSelectedChoice, updateHiddenChoice, setOptionSelected} from './Choice'

import {sync, composeSync} from './ToolsJs'

function filterMultiSelectData(choice, isFilteredIn, visibleIndex) {
    choice.isFilteredIn = isFilteredIn;
    choice.visibleIndex = visibleIndex;
    choice.updateVisible();
} 

function resetChoices(choicesList) {
    for(let i=0; i<choicesList.length; i++)
    {
        let choice = choicesList[i];
        if ( !choice.isOptionHidden )
        {
            filterMultiSelectData(choice, true , i);
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
            if ( 
                choice.isOptionSelected || choice.isOptionDisabled || choice.isOptionHidden
                || choice.searchText.indexOf(text)<0 )
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
        var success = false;
        if (choice.isOptionSelected || !choice.isOptionDisabled)
            success = setOptionSelected(choice, !choice.isOptionSelected, this.setSelected);
        return success;
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
            if (!choice.isOptionSelected  && !choice.isOptionDisabled && !choice.isOptionHidden)
                setOptionSelected(choice, true, this.setSelected)
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

    UpdateOptionsDisabled(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionDisabled(i)
        }
    }

    // UpdateOption(key){
    //     let choice = this.choicesList[key]; // TODO: 
    //     updateDisabledChoice(choice, this.getIsOptionDisabled)
    //     updateSelectedChoice(choice)
    //     // TODO REFRESH the content
    // }

    UpdateOptionDisabled(key){
        let choice = this.choicesList[key]; // TODO: generalize index as key 
        updateDisabledChoice(choice, this.getIsOptionDisabled)
    }

    UpdateOptionsSelected(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionSelected(i)
        }
    }

    UpdateOptionSelected(key){
        let choice = this.choicesList[key]; // TODO: generalize index as key 
        updateSelectedChoice(choice) // TODO: invite this.getIsOptionSelected
    }

    SetOptionSelected(key, value){
        let choice = this.choicesList[key];
        setOptionSelected(choice, value, this.setSelected);
    }

    UpdateOptionsHidden(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionHidden(i)
        }
    }

    UpdateOptionHidden(key){
        let choice = this.choicesList[key]; // TODO: generalize index as key 
        updateHiddenChoice(choice) // TODO: invite this.getIsOptionSelected
    }

    createPick(choice){
        let { pickElement, attach } = this.staticContent.createPickElement(); 
        let detach = () => removeElement(pickElement);
        let pickContent = this.pickContentGenerator(pickElement);
        
        var pick = {
            disableRemove: () => pickContent.disableRemove(this.getIsComponentDisabled()),
            setData: () => pickContent.setData(choice.option),
            disable: () => pickContent.disable( this.getIsOptionDisabled(choice.option) ),
            remove: null,
            //visible: () => setVisible( !choice.isOptionHidden ),
            dispose: () => { 
                detach(); 
                pickContent.dispose(); 
                pick.disableRemove=null; pick.setData=null; pick.disable=null; pick.remove=null; // setVisible=null;
                pick.dispose=null;  
            }, 
        }
        pick.setData();
        pick.disableRemove();
        //pick.visible();
        
        attach();
        let choiceUpdateDisabledBackup = choice.updateDisabled;
        choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.disable);

        //let choiceUpdateVisibleBackup = choice.updateVisible;
        //choice.updateVisible = composeSync(choiceUpdateDisabledBackup, pick.visible);

        var removeFromList = this.picksList.addPick(pick);
        let removePick = () => {
            removeFromList();
            pick.dispose();

            //choice.updateVisible = choiceUpdateVisibleBackup; 
            //choice.updateVisible();
            choice.updateDisabled = choiceUpdateDisabledBackup; 
            choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            
            if (this.picksList.getCount()==0) 
                this.placeholderAspect.updatePlacehodlerVisibility()
        }
        let setSelectedFalse = () => setOptionSelected(choice, false, this.setSelected)
        pick.remove = setSelectedFalse;
    
        this.aspect.handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);

        if (this.picksList.getCount()==1) 
            this.placeholderAspect.updatePlacehodlerVisibility()
        return removePick;
    }
    
    createChoice(option, i, afterElement){
        let isOptionHidden   = this.getIsOptionHidden(option);
        let isOptionSelected = option.selected;
        let isOptionDisabled = this.getIsOptionDisabled(option); 
        
        var choice = Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden);

        if (!isOptionHidden) { 
            var {choiceElement, setVisible, attach} = this.staticContent.createChoiceElement();
            
            // choice.delete = () => {
            //     removeElement(choiceElement);
            // }
            //choice.choiceElement=choiceElement;

            choice.insertAfter = (option, i) => {
                var nextChoice = createChoice(option, i, choiceElement)
                return nextChoice;
            };
            let choiceContent = this.choiceContentGenerator(choiceElement, () => {
                this.toggleOptionSelected(choice);
                this.filterPanel.setFocus();
            });

            let updateSelectedChoiceContent = () => 
                choiceContent.select(choice.isOptionSelected)

            let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
            let createPick = () => { 
                var removePick = this.createPick(choice);
                pickTools.updateSelectedFalse = removePick;
            };

            pickTools.updateSelectedTrue = createPick;

            choice.updateSelected = () => {
                updateSelectedChoiceContent();
                if (choice.isOptionSelected)
                    pickTools.updateSelectedTrue();
                else 
                    pickTools.updateSelectedFalse();
                this.onChange();
            }

            var unbindChoiceElement = this.aspect.adoptChoiceElement(choice, choiceElement);

            choice.isFilteredIn = true;

            choice.visibleIndex = i;

            attach(afterElement);

            choiceContent.setData(choice.option);
            
            choice.updateHoverIn = () => {
                choiceContent.hoverIn(choice.isHoverIn);
            }

            choice.updateVisible = () => setVisible(isVisibleChoice(choice))

            // updateHidden
            choice.updateDisabled = () => {
                choiceContent.disable(choice.isOptionDisabled, choice.isOptionSelected); 
            }

            choice.dispose = ()=> {
                unbindChoiceElement();
                choiceContent.dispose();
                choice.insertAfter = null;
                choice.updateSelected = null;
                choice.updateDisabled = null;

                // not real data manipulation but internal state
                choice.updateVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
                choice.updateHoverIn = null;

                choice.dispose = null;
            }


            if (choice.isOptionSelected) {
                updateSelectedChoiceContent();
                createPick();
            }
            choice.updateDisabled(); 
        }
        return choice;
    }

    updateDataImpl(){
        var fillChoices = () => {
            let options = this.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                let choice = this.createChoice(option, i);
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
                    setOptionSelected(fullMatchChoice, true, this.setSelected);
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
        
        this.choicesPanel.resetHoveredChoice();
        this.aspect.eventLoopFlag.set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        var choicesList = this.getVisibleChoicesList();
        if (choicesList.length == 1) {
             // NOTE: do not require the resetHoveredChoice since we sure that there is no hovered (menu was just opened)
            this.choicesPanel.hoverIn(choicesList[0])
        }

        if (this.getVisibleChoicesList().length > 0) {
            this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.aspect.showChoices();
        } else {
            this.aspect.hideChoices();
        }
    }

    hoveredToSelected(){
        let hoveredChoice = this.choicesPanel.getHoveredChoice();
        if (hoveredChoice){
            var wasToggled = this.toggleOptionSelected(hoveredChoice);
            if (wasToggled) {
                this.choicesPanel.resetHoveredChoice();
                this.aspect.hideChoices();
                this.resetFilter();
            }
        }
    }

    keyDownArrow(down) {
        let visibleChoices = this.getVisibleChoicesList();
        let length = visibleChoices.length;
        let iChoice = null;
        let hoveredChoice =  this.choicesPanel.getHoveredChoice();
        if (length > 0) {
            if (down) {
                let i = hoveredChoice===null?0:hoveredChoice.visibleIndex+1;
                while(i<length){
                    iChoice = visibleChoices[i];
                    if (isVisibleChoice(iChoice)){
                        break;
                    }
                    i++;
                }
            } else {
                let i = hoveredChoice===null?length-1:hoveredChoice.visibleIndex-1;
                while(i>=0) {
                    iChoice = visibleChoices[i];
                    if (isVisibleChoice(iChoice)) {
                        break;
                    }
                    i--;
                }
            }
        }
        
        if (iChoice)
        {
            this.choicesPanel.hoverIn(iChoice);
            this.aspect.alignToFilterInputItemLocation(true);
            this.aspect.showChoices();
        }
    }

    init() {
        
        this.filterPanel = FilterPanel(
            this.staticContent.filterInputElement,
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
            () => this.keyDownArrow(false), // arrow up
            () => this.keyDownArrow(true),  // arrow down
            () => this.aspect.hideChoices(),  // tab on empty
            () => {
                this.picksList.removePicksTail();
                this.aspect.alignToFilterInputItemLocation(false);
            }, // backspace - "remove last"
            /*onTabToCompleate*/() => { 
                if (this.staticContent.isChoicesVisible()) {
                    this.hoveredToSelected();
                } 
            },
            /*onEnterToCompleate*/() => { 
                if (this.staticContent.isChoicesVisible()) {
                    this.hoveredToSelected();
                } else {
                    if (this.getVisibleChoicesList().length > 0){
                        this.aspect.alignToFilterInputItemLocation(true);
                        this.aspect.showChoices();
                    }
                }
            },
            // tab/enter "compleate hovered"
            /*stopEscKeyDownPropogation */() => this.staticContent.isChoicesVisible(),
            /*onKeyUpEsc*/() => {
                this.aspect.hideChoices(); // always hide 1st
                this.choicesPanel.resetHoveredChoice();
                this.resetFilter();
            }, // esc keyup 
            /*onInput*/(filterInputValue, resetLength) =>
            { 
                this.placeholderAspect.updatePlacehodlerVisibility();
                this.input(filterInputValue, resetLength) 
            }
        );
        
        // attach filterInputElement
        this.staticContent.pickFilterElement.appendChild(this.staticContent.filterInputElement);
        this.labelAdapter.init(this.staticContent.filterInputElement); 
        this.staticContent.picksElement.appendChild(
            this.staticContent.pickFilterElement); // located filter in selectionsPanel       

        this.picksList =  PicksList();

        this.choicesPanel = ChoicesPanel(
            () => this.aspect.eventLoopFlag
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
            () => this.choicesPanel.resetHoveredChoice(), 
            (choice) => this.choicesPanel.hoverIn(choice),
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