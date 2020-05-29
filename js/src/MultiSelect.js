import {FilterPanel} from './FilterPanel'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'


import {/*ListFacade,*/ sync, composeSync} from './ToolsJs'
//import {FilterFacade} from './FilterFacade'

export class MultiSelect {
    constructor(
        dataSourceAspect,
        componentAspect,
        picksDom, 
        choicesDom,
        staticManager,
        popupAspect,         
        
        pickContentGenerator, 
        
        filterListAspect,
        choices, 
        choicesHover,
        picks,

        optionAspect,
        optionToggleAspect,
        choicesAspect,

        window) {

        this.dataSourceAspect=dataSourceAspect;
        this.componentAspect=componentAspect;

        this.window = window;
        this.popupAspect = popupAspect;
        this.picksDom = picksDom;
        this.choicesDom = choicesDom;
        this.staticManager =staticManager;
        this.pickContentGenerator = pickContentGenerator;

        this.filterListAspect = filterListAspect;
        this.choices =  choices;
        this.choicesHover = choicesHover;
        this.picks = picks;

        this.optionAspect = optionAspect;
        this.optionToggleAspect = optionToggleAspect;

        this.choicesAspect = choicesAspect;
    }
   
    resetFilter(){
        if (!this.filterPanel.isEmpty()) 
            this.forceResetFilter();
    }

    forceResetFilter(){
        this.filterPanel.setEmpty();
        this.filterListAspect.processEmptyInput();
    }

    isSelectable(choice){
        return !choice.isOptionSelected  && !choice.isOptionDisabled;
    }
    
    empty(){
        // close drop down , remove filter
        this.aspect.hideChoices(); // always hide 1st
        this.resetFilter();

        this.choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
        
        this.choices.clear();
        this.picks.clear();
    }
    
    update(){
        this.updateAppearance();
        this.updateData();
    }

    updateData(){
        this.empty();
        this.choicesAspect.updateDataImpl(
            () => this.filterPanel.setFocus(),
            (c) => this.createPick(c),
            (c,e) => this.aspect.adoptChoiceElement(c,e)
        );
    }
    updateAppearance(){
        this.updateDisabled();    
    }
    
    updateDisabled(){
        let isComponentDisabled = this.componentAspect.getDisabled();
        if (this.isComponentDisabled!==isComponentDisabled){
            this.isComponentDisabled=isComponentDisabled;
            this.picks.disableRemoveAll(isComponentDisabled);
            this.aspect.disable(isComponentDisabled);
            this.picksDom.disable(isComponentDisabled);
        }
    }
    updateOptionsDisabled(){
        this.choices.forLoop(
            choice => {
                let newIsDisabled = multiSelect.dataSourceAspect.getDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        );
    }
    updateOptionsSelected(){
        this.choices.forLoop(
            choice => {
                let newIsSelected = this.dataSourceAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        );
    }
    selectAll(){
        this.aspect.hideChoices(); // always hide 1st
        this.choices.forLoop(
            choice => {
                if (this.isSelectable(choice))
                    this.optionAspect.setOptionSelected(choice, true)
            }
        ); 
        this.resetFilter();
    }

    deselectAll(){
        this.aspect.hideChoices(); // always hide 1st
        this.picks.removeAll();
        this.resetFilter();
    }

    createPick(choice){
        let { pickElement, attach, detach } = this.picksDom.createPickElement(); 
        let pickContent = this.pickContentGenerator(pickElement);
        
        var pick = {
            disableRemove: () => pickContent.disableRemove(this.componentAspect.getDisabled()),
            setData: () => pickContent.setData(choice.option),
            disable: () => pickContent.disable( this.dataSourceAspect.getDisabled(choice.option) ),
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

        var removeFromList = this.picks.addPick(pick);
        let removePick = () => {
            removeFromList();
            pick.dispose();

            choice.updateDisabled = choiceUpdateDisabledBackup; 
            choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
        }
        let setSelectedFalse = () => this.optionAspect.setOptionSelected(choice, false)
        pick.remove = setSelectedFalse;
    
        this.aspect.handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);
        return removePick;
    }

    input(filterInputValue, resetLength){
        let text = filterInputValue.trim().toLowerCase();
        var isEmpty=false;
        if (text == '')
            isEmpty=true;
        else
        {
            // check if exact match, otherwise new search
            this.filterListAspect.filterFacade_setFilter(text);
            if (this.filterListAspect.filterListFacade_getCount() == 1)
            {
                let fullMatchChoice =  this.filterListAspect.filterListFacade_getHead();
                if (fullMatchChoice.searchText == text)
                {
                    this.optionAspect.setOptionSelected(fullMatchChoice, true);
                    this.filterPanel.setEmpty();
                    isEmpty=true;
                }
            }
        }
        if (isEmpty){
            this.filterListAspect.processEmptyInput();
        }
        else
            resetLength();  
        
        this.aspect.eventLoopFlag.set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        let visibleCount = this.filterListAspect.filterListFacade_getCount();

        if (visibleCount>0){
            let panelIsVisble = this.popupAspect.isChoicesVisible();
            if (!panelIsVisble){
                this.aspect.showChoices();
            }
            if (visibleCount == 1) {
                this.choicesHover.hoverIn(this.filterListAspect.filterListFacade_getHead())
            } else {
                if (panelIsVisble)
                    this.choicesHover.resetHoveredChoice();
            }   
        }else{
            if (this.popupAspect.isChoicesVisible())
                this.aspect.hideChoices();
        }
    }

    hoveredToSelected(){
        let hoveredChoice = this.choicesHover.getHoveredChoice();
        if (hoveredChoice){
            var wasToggled = this.optionToggleAspect.toggleOptionSelected(hoveredChoice);
            if (wasToggled) {
                this.aspect.hideChoices();
                this.resetFilter();
            }
        }
    }

    keyDownArrow(down) {
        let iChoice = this.choicesHover.navigate(down);
        if (iChoice)
        {
            this.choicesHover.hoverIn(iChoice);
            this.aspect.showChoices();
        }
    }

    setFocusIn(focus){
        this.picksDom.setIsFocusIn(focus)
        this.picksDom.toggleFocusStyling();
    }

    isEmpty(){
        return this.picks.isEmpty() && this.filterPanel.isEmpty();
    }

    init() {
        this.filterPanel = FilterPanel(
            this.picksDom.filterInputElement,
            () => this.setFocusIn(true),  // focus in - show dropdown
            () => this.aspect.onFocusOut(
                    ()=>this.setFocusIn(false)
                  ), // focus out - hide dropdown
            () => this.keyDownArrow(false), // arrow up
            () => this.keyDownArrow(true),  // arrow down
            /*onTabForEmpty*/() => this.aspect.hideChoices(),  // tab on empty
            () => {
                let p = this.picks.removePicksTail();
                if (p)
                    this.popupAspect.updatePopupLocation();
            }, // backspace - "remove last"

            /*onTabToCompleate*/() => { 
                if (this.popupAspect.isChoicesVisible()) {
                    this.hoveredToSelected();
                } 
            },
            /*onEnterToCompleate*/() => { 
                if (this.popupAspect.isChoicesVisible()) {
                    this.hoveredToSelected();
                } else {
                    if (this.filterListAspect.filterListFacade_getCount()>0){
                        this.aspect.showChoices();
                    }
                }
            },
           
            /*onKeyUpEsc*/() => {
                this.aspect.hideChoices(); // always hide 1st
                this.resetFilter();
            }, // esc keyup 

             // tab/enter "compleate hovered"
            /*stopEscKeyDownPropogation */() => this.popupAspect.isChoicesVisible(),

            /*onInput*/(filterInputValue, resetLength) =>
            { 
                this.input(filterInputValue, resetLength) 
            }
        );
        
        // attach filterInputElement
        this.picksDom.pickFilterElement.appendChild(this.picksDom.filterInputElement);

        this.picksDom.picksElement.appendChild(
            this.picksDom.pickFilterElement); // located filter in selectionsPanel       

        this.staticManager.appendToContainer();

        this.aspect =  MultiSelectInputAspect(
            this.window,
            this.picksDom.filterInputElement, 
            this.picksDom.picksElement, 
            this.choicesDom.choicesElement, 
            ()=>this.popupAspect.isChoicesVisible(),
            (visible)=>this.popupAspect.setChoicesVisible(visible),
            () => this.choicesHover.resetHoveredChoice(), 
            (choice) => this.choicesHover.hoverIn(choice),
            () => this.resetFilter(),
            () => this.filterListAspect.filterListFacade_getCount()==0, 
            
            /*onClick*/(event) => this.filterPanel.setFocusIfNotTarget(event.target),
            /*resetFocus*/() => this.setFocusIn(false),
            /*alignToFilterInputItemLocation*/() => this.popupAspect.updatePopupLocation()
        );
        this.popupAspect.init();
    }

    load(){
        this.choicesAspect.updateDataImpl(
            ()=>this.filterPanel.setFocus(),
            (c)=>this.createPick(c),
            (c,e)=>this.aspect.adoptChoiceElement(c,e)

        );
        this.updateAppearance(); // TODO: now appearance should be done after updateDataImpl, because items should be "already in place", correct it
    }

    dispose(){
        sync(
            this.aspect.hideChoices,
            this.picks.dispose,
            this.filterPanel.dispose,
            this.aspect.dispose,
            this.choices.dispose
        );
    }
}