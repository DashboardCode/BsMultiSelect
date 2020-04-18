import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksList} from './PicksList'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'
import {removeElement} from './ToolsDom'
import {Choice, updateDisabledChoice, updateSelectedChoice, updateHiddenChoice, setOptionSelected, getNextNonHidden} from './Choice'

import {sync, composeSync} from './ToolsJs'

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
    }

    toggleOptionSelected(choice){
        var success = false;
        if (choice.isOptionSelected || !choice.isOptionDisabled)
            success = setOptionSelected(choice, !choice.isOptionSelected, this.setSelected);
        return success;
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
        this.choicesPanel.resetFilter();
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
        this.choicesPanel.forEach(
            (choice) => {
                if (!choice.isOptionSelected  && !choice.isOptionDisabled && !choice.isOptionHidden)
                setOptionSelected(choice, true, this.setSelected)
            }
        ); 
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
        
        this.choicesPanel.clear();
        this.picksList.clear();
        this.placeholderAspect.updatePlacehodlerVisibility();
    }

    UpdateData(){
        this.empty();
        this.updateDataImpl();
    }

    UpdateOptionsDisabled(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionDisabled(i)
        }
    }

    UpdateOption(key){
        let choice = this.choicesPanel.get(key)
        updateDisabledChoice(choice, this.getIsOptionDisabled)
        updateHiddenChoice(choice, this.getIsOptionHidden)
        updateSelectedChoice(choice)
    }

    UpdateOptionDisabled(key){
        let choice = this.choicesPanel.get(key); // TODO: generalize index as key 
        updateDisabledChoice(choice, this.getIsOptionDisabled)
    }

    UpdateOptionsSelected(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionSelected(i)
        }
    }

    UpdateOptionSelected(key){
        let choice = this.choicesPanel.get(key); // TODO: generalize index as key 
        updateSelectedChoice(choice) // TODO: invite this.getIsOptionSelected
    }

    SetOptionSelected(key, value){
        let choice = this.choicesPanel.get(key);
        setOptionSelected(choice, value, this.setSelected);
    }

    UpdateOptionsHidden(){
        let options = this.getOptions();
        for(let i = 0; i<options.length; i++){
            this.UpdateOptionHidden(i)
        }
    }

    UpdateOptionHidden(key){
        let choice = this.choicesPanel.get(key); // TODO: generalize index as key 
        updateHiddenChoice(choice, this.getIsOptionHidden) // TODO: invite this.getIsOptionSelected
    }

    UpdateOptionAdded(key){  // TODO: generalize index as key 
        let options = this.getOptions();
        let option = options[key];
        let choice = this.createChoice(option);

        this.choicesPanel.add(key, choice);

        if (choice.isOptionHidden){ 
            this.buildHiddenChoice(choice);
        }
        else{ 
            this.createChoiceElement(choice);
            let nextChoice = getNextNonHidden(choice);
            choice.choiceElementAttach(nextChoice?.choiceElement);
        }
        choice.updateHidden = () => this.updateHidden(choice);
    }

    UpdateOptionRemoved(key){ // TODO: generalize index as key 
        this.aspect.hideChoices(); // always hide 1st, then reset filter
        this.choicesPanel.resetFilter();

        var choice = this.choicesPanel.remove(key);
        choice.remove?.();
        choice.dispose?.();
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
            dispose: () => { 
                detach(); 
                pickContent.dispose(); 
                pick.disableRemove=null; pick.setData=null; pick.disable=null; pick.remove=null; 
                pick.dispose=null;  
            }, 
        }
        pick.setData();
        pick.disableRemove();
        
        attach();
        let choiceUpdateDisabledBackup = choice.updateDisabled;
        choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.disable);

        var removeFromList = this.picksList.addPick(pick);
        let removePick = () => {
            removeFromList();
            pick.dispose();

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
    
    createChoiceElement(choice){
        var {choiceElement, setVisible, attach} = this.staticContent.createChoiceElement();
        choice.choiceElement = choiceElement;
        choice.choiceElementAttach = attach;
                
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
        
        choice.remove = () => {
            removeElement(choiceElement);
            if (pickTools.updateSelectedFalse) {
                pickTools.updateSelectedFalse();
                pickTools.updateSelectedFalse=null;
            }
        };
        
        choice.updateSelected = () => {
            updateSelectedChoiceContent();
            if (choice.isOptionSelected)
                pickTools.updateSelectedTrue();
            else {
                pickTools.updateSelectedFalse();
                pickTools.updateSelectedFalse=null;
            }
            this.onChange();
        }
    
        var unbindChoiceElement = this.aspect.adoptChoiceElement(choice, choiceElement);
    
        choice.isFilteredIn = true;
    
        choiceContent.setData(choice.option);
        
        choice.setHoverIn = (v) => {
            choice.isHoverIn =v ;
            choiceContent.hoverIn(choice.isHoverIn);
        }
    
        choice.setVisible = (v) => {
            choice.isFilteredIn = v;
            setVisible(choice.isFilteredIn)
        }
    
        choice.updateDisabled = () => {
            choiceContent.disable(choice.isOptionDisabled, choice.isOptionSelected); 
        }
    
        choice.dispose = () => {
            unbindChoiceElement();
            choiceContent.dispose();

            choice.choiceElement = null;
            choice.choiceElementAttach = null;
            choice.remove = null; 
            
            choice.updateSelected = null;
            choice.updateDisabled = null;
            choice.updateHidden = null;
    
            // not real data manipulation but internal state
            choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
            choice.setHoverIn = null;
    
            //choice.itemPrev = null;
            //choice.itemNext = null;
            
            choice.dispose = null;
        }
    
        if (choice.isOptionSelected) {
            updateSelectedChoiceContent();
            createPick();
        }
        choice.updateDisabled(); 
    }

    createChoice(option /*, prevChoice*/ /*, prevVisibleChoiceElement*/){
        let isOptionHidden   = this.getIsOptionHidden(option);
        let isOptionSelected = option.selected;
        let isOptionDisabled = this.getIsOptionDisabled(option); 
        
        var choice = Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden);

        return choice;
    }

    buildHiddenChoice(choice){
        choice.updateSelected = () => void 0;
        choice.updateDisabled = () => void 0;
        
        choice.choiceElement = null;
        choice.choiceElementAttach = null;
        choice.setVisible = null; 
        choice.setHoverIn = null;
        choice.remove = null; 
        
        choice.dispose = () => { 
            choice.dispose = null;
            choice.updateHidden = null;
        };
    }
    
    updateHidden(choice) {
        if (choice.isOptionHidden) {
            this.choicesPanel.updateHiddenOn(choice);
            choice.remove(); 
            this.buildHiddenChoice(choice);
        } else {

            let nextChoice = getNextNonHidden(choice);
            this.choicesPanel.updateHiddenOff(choice, nextChoice);
            this.createChoiceElement(choice);
            choice.choiceElementAttach(nextChoice?.choiceElement); // itemPrev?.choiceElement
        }
    }

    updateDataImpl(){
        var fillChoices = () => {
            let options = this.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                let choice = this.createChoice(option);
                this.choicesPanel.push(choice);
                if (choice.isOptionHidden){ 
                    this.buildHiddenChoice(choice);
                }
                else{ 
                    this.createChoiceElement(choice);
                    choice.choiceElementAttach();
                }
                choice.updateHidden = () => this.updateHidden(choice);
            } 
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
            this.staticContent.dispose,
            this.choicesPanel.dispose
        );
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
        this.placeholderAspect.updatePlacehodlerVisibility();
        let text = filterInputValue.trim().toLowerCase();
        var isEmpty=false;
        if (text == '')
            isEmpty=true;
        else
        {
            // check if exact match, otherwise new search
            this.choicesPanel.setFilter(text);
            if (this.choicesPanel.getVisibleCount() == 1)
            {
                let fullMatchChoice =  this.choicesPanel.getFirstVisibleChoice();
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
        
        this.aspect.eventLoopFlag.set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        let visibleCount = this.choicesPanel.getVisibleCount();

        if (visibleCount>0){
            let panelIsVisble = this.staticContent.isChoicesVisible();
            if (!panelIsVisble){
                this.aspect.showChoices();
            }
            if (visibleCount == 1) {
                this.choicesPanel.hoverIn(this.choicesPanel.getFirstVisibleChoice())
            } else {
                if (panelIsVisble)
                    this.choicesPanel.resetHoveredChoice();
            }   
        }else{
            if (this.staticContent.isChoicesVisible())
                this.aspect.hideChoices();
        }
    }

    hoveredToSelected(){
        let hoveredChoice = this.choicesPanel.getHoveredChoice();
        if (hoveredChoice){
            var wasToggled = this.toggleOptionSelected(hoveredChoice);
            if (wasToggled) {
                this.aspect.hideChoices();
                this.resetFilter();
            }
        }
    }

    keyDownArrow(down) {
        let iChoice = this.choicesPanel.navigate(down);
        if (iChoice)
        {
            this.choicesPanel.hoverIn(iChoice);
            this.aspect.showChoices();
        }
    }

    setFocusIn(focus){
        this.staticContent.setIsFocusIn(focus)
        this.staticContent.toggleFocusStyling();
    }

    init() {
        this.filterPanel = FilterPanel(
            this.staticContent.filterInputElement,
            () => this.setFocusIn(true),  // focus in - show dropdown
            () => this.aspect.onFocusOut(
                    ()=>this.setFocusIn(false)
                  ), // focus out - hide dropdown
            () => this.keyDownArrow(false), // arrow up
            () => this.keyDownArrow(true),  // arrow down
            /*onTabForEmpty*/() => this.aspect.hideChoices(),  // tab on empty
            () => {
                let p = this.picksList.removePicksTail();
                if (p)
                    this.aspect.alignToFilterInputItemLocation();
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
                    if (this.choicesPanel.getHasVisible()){
                        this.aspect.showChoices();
                    }
                }
            },
           
            /*onKeyUpEsc*/() => {
                this.aspect.hideChoices(); // always hide 1st
                this.resetFilter();
            }, // esc keyup 

             // tab/enter "compleate hovered"
            /*stopEscKeyDownPropogation */() => this.staticContent.isChoicesVisible(),

            /*onInput*/(filterInputValue, resetLength) =>
            { 
                this.input(filterInputValue, resetLength) 
            }
        );
        
        // attach filterInputElement
        this.staticContent.pickFilterElement.appendChild(this.staticContent.filterInputElement);
        this.labelAdapter.init(this.staticContent.filterInputElement); 

        this.staticContent.picksElement.appendChild(
            this.staticContent.pickFilterElement); // located filter in selectionsPanel       

        this.picksList =  PicksList();

        this.choicesPanel = ChoicesPanel();

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
            () => !this.choicesPanel.getHasVisible(), 
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