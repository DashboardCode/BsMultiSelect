import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksList} from './PicksList'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'
import {removeElement} from './ToolsDom'

import {sync} from './ToolsJs'

function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
    MultiSelectData.visible = isFiltered;
    MultiSelectData.visibleIndex = visibleIndex;
    MultiSelectData.setVisible(isFiltered);
    //MultiSelectData.choiceElement.style.display = isFiltered ? 'block': 'none';
} 

function resetChoices(choicesList) {
    for(let i=0; i<choicesList.length; i++)
    {
        let multiSelectData = choicesList[i];
        if ( !multiSelectData.isOptionHidden )
        {
            filterMultiSelectData(multiSelectData, true, i);
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
                if (choice.toggle)
                    choice.toggle();
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
            let option = options[i];
            let newIsSelected = option.selected;
            let choice = this.choicesList[i];
            if (newIsSelected!=choice.isOptionSelected)
                if (choice.toggle)
                    choice.toggle();
        }
    }

    createChoice(option, i){
        let isOptionSelected = option.selected;

        let isOptionDisabled = this.getIsOptionDisabled(option); 
        let isOptionHidden   = this.getIsOptionHidden(option);
        
        var choice = {
            option: option,
            isOptionDisabled: isOptionDisabled,
            isOptionHidden: isOptionHidden,
            isOptionSelected: isOptionSelected,

            searchText: option.text.toLowerCase().trim(),
            excludedFromSearch: isOptionSelected || isOptionDisabled || isOptionHidden,

            hoverIn: null,
            select: null,
            disable: null,
            dispose: null,
            toggle: null,
            setVisible: null,
            createPick: null,
            resetCandidateToHoveredMultiSelectData: null, // todo: setCandidateToHovered(Boolean) ?
            //removeChoiceElement: null, // TODO

            visible: false,
            visibleIndex: null // todo: check for errors
        };
        
        choice.createPick = ()=>{
            var {pick, adoptRemoveFromList} = this.createPick( 
                    choice.option, 
                    ()=>this.getIsOptionDisabled(choice.option),
                    (removePick)=>this.requestPickRemove(choice, removePick)
                );
            var removeFromList = this.picksList.addPick(pick);
            var remove = adoptRemoveFromList(removeFromList);
            this.requestPickCreate(choice, remove, this.picksList.getCount());
        }

        if (!isOptionHidden){
            choice.visible = true;
            choice.visibleIndex=i;
            this.choicesPanel.adoptChoice(
                choice, 
                isOptionSelected
            );
            // createPick, setSelected, triggerChange,
            if (isOptionSelected){
                choice.createPick();
            } else
            {
                choice.excludedFromSearch =  choice.isOptionDisabled;
                if (choice.isOptionDisabled)
                    choice.toggle = null;
                else
                    choice.toggle = () => {
                        var confirmed = this.setSelected(choice.option, true);
                        if (!(confirmed===false)) {
                            choice.createPick();
                            this.onChange();
                        }
                    }
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
            let multiSelectData = this.choicesList[i];
            multiSelectData.toggle = null;
            if (multiSelectData.dispose){
                multiSelectData.dispose();
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
                let fullMatchMultiSelectData =  this.filteredChoicesList[0];
                if (fullMatchMultiSelectData.searchText == text)
                {
                    if (fullMatchMultiSelectData.toggle)
                        fullMatchMultiSelectData.toggle();
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
            this.choicesPanel.hoverInInternal(0)
        }

        if (this.getVisibleChoicesList().length > 0) {
            this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
            this.aspect.showChoices();
        } else {
            this.aspect.hideChoices();
        }
    }

    requestPickCreate(choice, removePick, count){
        choice.isOptionSelected = true;
        choice.excludedFromSearch = true; // all selected excluded from search
        choice.toggle = () => removePick();
        choice.select(true);
        if (count==1) 
            this.placeholderAspect.updatePlacehodlerVisibility()
    }

    createPick(option, getIsOptionDisabled, requestPickRemove){
        let pickElement = this.staticContent.createPickElement(); 
        let attach = () => this.staticContent.picksElement.insertBefore(pickElement, this.staticContent.pickFilterElement);
        let detach = () => removeElement(pickElement);
        let pickContent = this.pickContentGenerator(pickElement);
        let processRemoveButtonClick = (removePick, event) => {
            this.aspect.processRemoveButtonClick(removePick, event);
            this.resetFilter();
        };
        var pick = {
            disableRemove: () => pickContent.disableRemove(this.getIsComponentDisabled()),
            setData: () => pickContent.setData(option),
            disable: () => pickContent.disable(getIsOptionDisabled()),
            removePick: null,
            dispose: () => { detach(); pickContent.dispose(); }, 
        }
        pick.setData();
        pick.disable();
        pick.disableRemove();
        attach();
        return {
            pick: pick,
            adoptRemoveFromList(removeFromList){
                var removeImpl = () => {
                    removeFromList();
                    pick.dispose();
                }
                var removePick = () => requestPickRemove(removeImpl);
                pick.removePick = removePick;
        
                // processRemoveButtonClick removes the item
                // what is a problem with calling 'remove' directly (not using  setTimeout('remove', 0)):
                // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
                // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
                // because of the event's bubling process 'remove' runs first. 
                // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
                // before we could analize is it belong to our dropdown or not.
                // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
                // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
                // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
                // the situation described above: click outside dropdown on the same component.
                // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target 
                // that belomgs to DOM (e.g. panel)
                

                pickContent.onRemove(event => {
                    processRemoveButtonClick(removePick, event);
                });
                return removePick;
            }
        };
    }

    requestPickRemove(choice, removePick){
        let confirmed = this.setSelected(choice.option, false);
        if (!(confirmed===false)) {
            removePick();
            choice.isOptionSelected = false;
            choice.excludedFromSearch = choice.isOptionDisabled; 
            if (choice.isOptionDisabled)
            {
                choice.disable( /*isOptionDisabled*/ true, /*isOptionSelected*/ false); 
                choice.toggle = null;
            }
            else
            {
                choice.toggle = () => {
                    let confirmed = this.setSelected(choice.option, true);
                    if (!(confirmed===false)){
                        choice.createPick();
                        // var {pick, adoptRemoveFromList} = this.createPick( 
                        //     choice.option, 
                        //     ()=>this.getIsOptionDisabled(choice.option),
                        //     (removePick)=>this.requestPickRemove(choice, removePick)                            
                        // );
                        // var removeFromList = this.picksList.addPick(pick);
                        // var remove = adoptRemoveFromList(removeFromList);
                        // this.requestPickCreate(choice, remove, this.picksList.getCount());
                        this.onChange();
                    }
                };
            }
            choice.select(false);
            if (this.picksList.getCount()==0) 
                this.placeholderAspect.updatePlacehodlerVisibility()
            this.onChange();
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
            () => { 
                if (this.staticContent.isChoicesVisible())
                    this.choicesPanel.toggleHovered() }, // tab/enter "compleate hovered"
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
        
        this.picksList =  PicksList(
            // () => {
            //     var pickElement = this.staticContent.createPickElement();
            //     return {
            //         pickElement,
            //         attach: () => this.staticContent.picksElement
            //             .insertBefore(pickElement, this.staticContent.pickFilterElement),
            //         detach: () =>removeElement(pickElement)
            //     }
            // },
            // this.pickContentGenerator,
            // (doUncheck, event) => {
            //     this.aspect.processUncheck(doUncheck, event);
            //     this.aspect.hideChoices(); // always hide 1st
            //     this.resetFilter();
            // },
            // this.common,
            // this.getIsComponentDisabled
        );

        this.choicesPanel = ChoicesPanel(
            ()=> this.staticContent.createChoiceElement(),
            () => this.aspect.eventSkipper,
            this.choiceContentGenerator,
            () => this.getVisibleChoicesList(),
            () => {
                    this.aspect.hideChoices();
                    this.resetFilter();},
            () => {
                this.aspect.alignToFilterInputItemLocation(true);
                this.aspect.showChoices();
            },
            () => this.filterPanel.setFocus()
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
            () => this.choicesPanel.resetCandidateToHoveredMultiSelectData(),
            () => {  
                this.aspect.hideChoices();
                this.resetFilter();
            },
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