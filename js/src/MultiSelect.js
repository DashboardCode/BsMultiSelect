import {FilterPanel} from './FilterPanel'
import {ChoicesPanel} from './ChoicesPanel'
import {PicksList} from './PicksList'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {PlaceholderAspect} from './PlaceholderAspect'
import {removeElement} from './ToolsDom'
import {Choice, updateDisabledChoice, updateSelectedChoice, setOptionSelected} from './Choice'
import {ListFacade, sync, composeSync} from './ToolsJs'
import {FilterFacade} from './FilterFacade'

export class MultiSelect {
    constructor(
        getOptions,
        getIsComponentDisabled,
        setSelected, 
        getIsOptionSelected,
        getIsOptionDisabled,
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
        this.getOptions=getOptions;
        this.getIsOptionSelected = getIsOptionSelected;
        this.getIsOptionDisabled = getIsOptionDisabled;
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
        this.filterFacade.resetFilter();
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

    isSelectable(choice){
        return !choice.isOptionSelected  && !choice.isOptionDisabled;
    }

    SelectAll(){
        this.aspect.hideChoices(); // always hide 1st
        this.choicesPanel.forLoop(
            (choice) => {
                if (this.isSelectable(choice))
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

    /*
    UpdateOption(key){
        let choice = this.choicesPanel.get(key)
        updateDisabledChoice(choice, this.getIsOptionDisabled)
        updateHiddenChoice(choice, this.getIsOptionHidden)
        updateSelectedChoice(choice)
    }*/

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
        updateSelectedChoice(choice, this.getIsOptionSelected ) // TODO: invite this.getIsOptionSelected
    }

    SetOptionSelected(key, value){
        let choice = this.choicesPanel.get(key);
        setOptionSelected(choice, value, this.setSelected);
    }

    UpdateOptionAdded(key){  // TODO: generalize index as key 
        let options = this.getOptions();
        let option = options[key];
        let choice = this.createChoice(option);
        this.choicesPanel.insert(key, choice);
        this.insertChoiceItem(choice)
    }


    UpdateOptionRemoved(key){ // TODO: generalize index as key 
        this.aspect.hideChoices(); // always hide 1st, then reset filter
        this.filterFacade.resetFilter();

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
    
            // not real data manipulation but internal state
            choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
            choice.setHoverIn = null;
    
            choice.dispose = null;
        }
    
        if (choice.isOptionSelected) {
            updateSelectedChoiceContent();
            createPick();
        }
        choice.updateDisabled(); 
    }

    createChoice(option /*, prevChoice*/ /*, prevVisibleChoiceElement*/){
        let isOptionSelected = this.getIsOptionSelected(option);
        let isOptionDisabled = this.getIsOptionDisabled(option); 
        
        var choice = Choice(option, isOptionSelected, isOptionDisabled);
        return choice;
    }

    insertChoiceItem(choice){
        this.createChoiceElement(choice);
        let nextChoice = this.getNext(choice);
        choice.choiceElementAttach(nextChoice?.choiceElement);
    }

    pushChoiceItem(choice){
        this.createChoiceElement(choice);
        choice.choiceElementAttach();
    }

    updateDataImpl(){
        var fillChoices = () => {
            let options = this.getOptions();
            for(let i = 0; i<options.length; i++) {
                let option = options[i];
                let choice = this.createChoice(option);
                this.choicesPanel.push(choice);
                this.pushChoiceItem(choice);
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
            this.filterFacade.setFilter(text);
            if (this.filterListFacade.getCount() == 1)
            {
                let fullMatchChoice =  this.filterListFacade.getHead();
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

        let visibleCount = this.filterListFacade.getCount();

        if (visibleCount>0){
            let panelIsVisble = this.staticContent.isChoicesVisible();
            if (!panelIsVisble){
                this.aspect.showChoices();
            }
            if (visibleCount == 1) {
                this.choicesPanel.hoverIn(this.filterListFacade.getHead())
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

    forEach(f){
        let choice = this.choicesPanel.getHead();
        while(choice){
            forEach( (choice)=>{
                f(choice);
                choice = this.getNext(choice);
            });
        }
    }

    getNext(choice){
        let next = choice.itemNext;
        return next;
    }

    navigate(down, hoveredChoice){
        return this.filterFacade.navigate(down, hoveredChoice);
    }

    addFilterFacade(choice){
        this.filterListFacade.add(choice);
    }

    insertFilterFacade(choice){
        let choiceNonhiddenBefore = this.getNext(choice);
        this.filterListFacade.add(choice, choiceNonhiddenBefore);
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
                    if (this.filterListFacade.getCount()>0){
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
        
        let composeFilterPredicate = (text) => 
            (choice) => !choice.isOptionSelected  && !choice.isOptionDisabled  && choice.searchText.indexOf(text) >= 0 

        this.filterListFacade = ListFacade(
            (choice)=>choice.filteredPrev, 
            (choice, v)=>choice.filteredPrev=v, 
            (choice)=>choice.filteredNext, 
            (choice, v)=>choice.filteredNext=v
        );

        this.filterFacade = FilterFacade(
            this.filterListFacade,
            (f) => this.forEach(f),
            composeFilterPredicate
        );
        
        this.choicesPanel = ChoicesPanel(this.filterListFacade, 
            (down, hoveredChoice)=>this.navigate(down, hoveredChoice),
            (c)=>this.addFilterFacade(c), 
            (c)=>this.insertFilterFacade(c));

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
            () => this.filterListFacade.getCount()==0, 
            /*onClick*/(event) => this.filterPanel.setFocusIfNotTarget(event.target),
            /*resetFocus*/() => this.setFocusIn(false),
            this.isRtl,
            this.popper
        );
        this.staticContent.attachContainer();
    }

    load(){
        this.updateDataImpl();
        this.UpdateAppearance(); // TODO: now appearance should be done after updateDataImpl, because items should be "already in place", correct it
    }
}