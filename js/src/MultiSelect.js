import {FilterPanel} from './FilterPanel'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {sync} from './ToolsJs'

export class MultiSelect {
    constructor(
        dataSourceAspect,
        componentAspect,
        picksDom,
        filterDom, 
        choicesDom,
        staticManager,
        popupAspect,         
        
        filterListAspect,
        choices, 
        choicesHover,
        picks,

        optionAspect,
        optionToggleAspect,
        choicesAspect,
        picksAspect,
        inputAspect,
        window) {

        this.dataSourceAspect=dataSourceAspect;
        this.componentAspect=componentAspect;

        this.window = window;
        this.popupAspect = popupAspect;
        this.picksDom = picksDom;
        this.filterDom = filterDom;
        this.choicesDom = choicesDom;
        this.staticManager =staticManager;

        this.filterListAspect = filterListAspect;
        this.choices =  choices;
        this.choicesHover = choicesHover;
        this.picks = picks;

        this.optionAspect = optionAspect;
        this.optionToggleAspect = optionToggleAspect;

        this.choicesAspect = choicesAspect;
        this.picksAspect=picksAspect;
        this.inputAspect=inputAspect;
    }

    forceResetFilter(){
        this.filterDom.setEmpty();
        this.filterListAspect.processEmptyInput();
    }

    resetFilter(){
        if (!this.filterDom.isEmpty()) 
            this.forceResetFilter();
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
            (c,e) => this.aspect.adoptChoiceElement(c,e),
            (o,s) => this.aspect.handleOnRemoveButton(o,s)
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
        let choice = this.choicesHover.navigate(down);
        if (choice)
        {
            this.choicesHover.hoverIn(choice);
            this.aspect.showChoices();
        }
    }

    setFocusIn(focus){
        this.picksDom.setIsFocusIn(focus)
        this.picksDom.toggleFocusStyling()
    }

    init() {
        this.filterPanel = FilterPanel(
            this.filterDom.filterInputElement,
            () => this.setFocusIn(true),  // focus in - show dropdown
            () => this.aspect.onFocusOut(
                () => this.setFocusIn(false)
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
                    if (this.filterListAspect.getCount()>0){
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
                this.inputAspect.input(
                    filterInputValue, 
                    resetLength,
                    ()=>this.aspect.eventLoopFlag.set(), 
                    ()=>this.aspect.showChoices(),
                    ()=>this.aspect.hideChoices()
                ) 
            }
        );
        
        this.picksDom.pickFilterElement.appendChild(this.filterDom.filterInputElement);
        this.picksDom.picksElement.appendChild(this.picksDom.pickFilterElement); 

        this.staticManager.appendToContainer();

        this.aspect =  MultiSelectInputAspect(
            this.window,
            ()=>this.filterDom.setFocus(), 
            this.picksDom.picksElement, 
            this.choicesDom.choicesElement, 
            ()=>this.popupAspect.isChoicesVisible(),
            (visible)=>this.popupAspect.setChoicesVisible(visible),
            () => this.choicesHover.resetHoveredChoice(), 
            (choice) => this.choicesHover.hoverIn(choice),
            () => this.resetFilter(),
            () => this.filterListAspect.getCount()==0, 
            
            /*onClick*/(event) => this.filterDom.setFocusIfNotTarget(event.target),
            /*resetFocus*/() => this.setFocusIn(false),
            /*alignToFilterInputItemLocation*/() => this.popupAspect.updatePopupLocation()
        );
        this.popupAspect.init();
    }

    load(){
        this.choicesAspect.updateDataImpl(
            (c,e) => this.aspect.adoptChoiceElement(c,e),
            (o,s) => this.aspect.handleOnRemoveButton(o,s)
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