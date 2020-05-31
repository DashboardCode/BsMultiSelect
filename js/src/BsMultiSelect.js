import {PluginManager, staticDomDefaults} from './PluginManager'

import {composeSync, def} from './ToolsJs';

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';

import {StaticDomFactory} from './StaticDomFactory';

import {PicksDom} from './PicksDom';
import {FilterDom} from './FilterDom';

import {ChoicesDom} from './ChoicesDom';
import {PopupAspect as DefaultPopupAspect} from './PopupAspect';

import {ComponentAspect} from './ComponentAspect';
import {DataSourceAspect} from './DataSourceAspect';

import {DoublyLinkedCollection} from './ToolsJs'

import {FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect'
import {ChoicesElementAspect, ChoiceFactoryAspect, ChoicesAspect } from './ChoicesAspect'
import {UpdateDataAspect } from './UpdateDataAspect'

import {OptionToggleAspect, OptionAspect} from './OptionAspect.js'
import {Choices} from './Choices'
import {ChoicesHover} from './ChoicesHover'
import {Picks} from './Picks'
import {PicksAspect} from './PicksAspect'
import {InputAspect} from './InputAspect'
import {ResetFilterListAspect} from './ResetFilterListAspect'
import {ManageableResetFilterListAspect} from './ResetFilterListAspect'
import {FocusInAspect} from './ResetFilterListAspect'
import {MultiSelectInputAspect} from './MultiSelectInputAspect'
import {FilterAspect} from './FilterAspect'
import {DisabledComponentAspect, LoadAspect, AppearanceAspect} from './AppearanceAspect'

export function BsMultiSelect(element, environment, configuration, onInit){
    var {Popper, window, plugins} = environment;
    var trigger = (eventName)=> environment.trigger(element, eventName);
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let { containerClass, css, 
          options, getDisabled,  
          getSelected, setSelected, 
          getIsOptionDisabled, common } = configuration;
    
    if (!common) 
        common = {}

    let componentAspect  = ComponentAspect(getDisabled, trigger);
    common.getDisabled = componentAspect.getDisabled;
    
    let dataSourceAspect = DataSourceAspect(options, getSelected, setSelected, getIsOptionDisabled); 
    let optionAspect = OptionAspect(dataSourceAspect)
    let optionToggleAspect = OptionToggleAspect(optionAspect)

          
    let PopupAspect = def(configuration.staticContentGenerator, DefaultPopupAspect); // TODO: rename configuration.staticContentGenerator
    let createElement =  name=>window.document.createElement(name);
    
    let choicesDom = ChoicesDom(createElement, css);
    let staticDomFactory = StaticDomFactory(createElement, choicesDom.choicesElement);
    staticDomDefaults(plugins, staticDomFactory); // manipulates with staticDomFactory.staticDomGenerator
   
    let {staticDom, staticManager} = staticDomFactory.staticDomGenerator(element, containerClass)

    let filterDom = FilterDom(staticDom.disposablePicksElement, createElement, css)
    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElement, css);
    let focusInAspect = FocusInAspect(picksDom)
    let popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);

    let collection = DoublyLinkedCollection(
        (choice)=>choice.itemPrev, 
        (choice, v)=>choice.itemPrev=v, 
        (choice)=>choice.itemNext, 
        (choice, v)=>choice.itemNext=v, 
    );

    let choicesGetNextAspect = ChoicesGetNextAspect(
        ()=>collection.getHead(),
        (choice)=>choice.itemNext
    )

    let choicesEnumerableAspect = ChoicesEnumerableAspect(
        choicesGetNextAspect
    )

    let filterListAspect = FilterListAspect(choicesGetNextAspect, choicesEnumerableAspect); 
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterListAspect)
    let manageableResetFilterListAspect =  ManageableResetFilterListAspect(filterDom, resetFilterListAspect)
    // TODO move to fully index collection
    let choices = Choices(
        collection,
        ()=>filterListAspect.reset(), 
        (c)=>filterListAspect.remove(c),
        (c)=>filterListAspect.addFilterFacade(c), 
        (c)=>filterListAspect.insertFilterFacade(c));
    
    let choicesHover = ChoicesHover((down, hoveredChoice)=>filterListAspect.navigate(down, hoveredChoice));

    let inputAspect = InputAspect(filterListAspect, optionAspect, filterDom, popupAspect, choicesHover);

    let picks = Picks();
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let picksAspect = PicksAspect(
        picksDom, 
        (pickElement) => pickContentGenerator(pickElement, common, css),
        componentAspect, dataSourceAspect, optionAspect, picks, manageableResetFilterListAspect
    );

    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
    let choicesElementAspect = ChoicesElementAspect( choicesDom, filterDom, (choiceElement, toggle) => choiceContentGenerator(choiceElement, common, css, toggle), componentAspect, optionToggleAspect, picksAspect)
    let choiceFactoryAspect =  ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
    let choicesAspect = ChoicesAspect(window.document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect);

    let multiSelectInputAspect =  MultiSelectInputAspect(
        window,
        () => filterDom.setFocus(), 
        picksDom.picksElement, 
        choicesDom.choicesElement, 
        () => popupAspect.isChoicesVisible(),
        (visible) => popupAspect.setChoicesVisible(visible),
        () => choicesHover.resetHoveredChoice(), 
        (choice) => choicesHover.hoverIn(choice),
        () => manageableResetFilterListAspect.resetFilter(),
        () => filterListAspect.getCount()==0, 
        
        /*onClick*/(event) => filterDom.setFocusIfNotTarget(event.target),
        /*resetFocus*/() => focusInAspect.setFocusIn(false),
        /*alignToFilterInputItemLocation*/() => popupAspect.updatePopupLocation()
    );

    let disabledComponentAspect = DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom);
    let appearanceAspect = AppearanceAspect(disabledComponentAspect);
    let loadAspect = LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect);

    function hoveredToSelected(){
        let hoveredChoice = choicesHover.getHoveredChoice();
        if (hoveredChoice){
            var wasToggled = optionToggleAspect.toggleOptionSelected(hoveredChoice);
            if (wasToggled) {
                multiSelectInputAspect.hideChoices();
                manageableResetFilterListAspect.resetFilter();
            }
        }
    }

    function keyDownArrow(down) {
        let choice = choicesHover.navigate(down);
        if (choice)
        {
            choicesHover.hoverIn(choice);
            multiSelectInputAspect.showChoices();
        }
    }

    let filterAspect = FilterAspect(
        filterDom.filterInputElement,
        () => focusInAspect.setFocusIn(true),  // focus in - show dropdown
        () => multiSelectInputAspect.onFocusOut(
            () => focusInAspect.setFocusIn(false)
        ), // focus out - hide dropdown
        
        () => keyDownArrow(false), // arrow up
        () => keyDownArrow(true),  // arrow down
        /*onTabForEmpty*/() => multiSelectInputAspect.hideChoices(),  // tab on empty
        () => {
            let p = picks.removePicksTail();
            if (p)
                popupAspect.updatePopupLocation();
        }, // backspace - "remove last"

        /*onTabToCompleate*/() => { 
            if (popupAspect.isChoicesVisible()) {
                hoveredToSelected();
            } 
        },
        /*onEnterToCompleate*/() => { 
            if (popupAspect.isChoicesVisible()) {
                hoveredToSelected();
            } else {
                if (filterListAspect.getCount()>0){
                    multiSelectInputAspect.showChoices();
                }
            }
        },
       
        /*onKeyUpEsc*/() => {
            multiSelectInputAspect.hideChoices(); // always hide 1st
            manageableResetFilterListAspect.resetFilter();
        }, // esc keyup 

         // tab/enter "compleate hovered"
        /*stopEscKeyDownPropogation */() => popupAspect.isChoicesVisible(),

        /*onInput*/(filterInputValue, resetLength) =>
        { 
            inputAspect.input(
                filterInputValue, 
                resetLength,
                ()=>multiSelectInputAspect.eventLoopFlag.set(), 
                ()=>multiSelectInputAspect.showChoices(),
                ()=>multiSelectInputAspect.hideChoices()
            ) 
        }
    );

    let updateDataAspect = UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect,
        choicesDom, choices, picks, choicesAspect);

    let pluginData = {environment, trigger, configuration, dataSourceAspect, componentAspect, 
        staticDom, picksDom, choicesDom, popupAspect, staticManager, 
        choicesGetNextAspect, choicesEnumerableAspect, filterListAspect, choices, choicesHover, picks,
        optionAspect, optionToggleAspect,
        choicesElementAspect, choiceFactoryAspect, choicesAspect,
        picksAspect,
        filterDom,
        inputAspect,
        resetFilterListAspect,
        manageableResetFilterListAspect,
        multiSelectInputAspect,
        focusInAspect,
        filterAspect,
        disabledComponentAspect,
        appearanceAspect,
        loadAspect,
        updateDataAspect,
        common // TODO: replace common with something new? 
    } 
    
    
    let pluginManager = PluginManager(plugins, pluginData);
        
    let api = {component: "BsMultiSelect.api"} 
   
    pluginManager.buildApi(api);

    api.dispose = composeSync(
        multiSelectInputAspect.hideChoices,
        pluginManager.dispose, 
        picks.dispose,
        multiSelectInputAspect.dispose,
        choices.dispose,
        staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose, filterAspect.dispose );
    
    api.updateDisabled = disabledComponentAspect.updateDisabledComponent;
    api.updateData = updateDataAspect.updateData;

    api.update = () => {
        updateDataAspect.updateData();
        appearanceAspect.updateAppearance();
    }

    api.updateAppearance = () => {
        appearanceAspect.updateAppearance();    
    }

    onInit?.(api);
       
    picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
    picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
    staticManager.appendToContainer();
    popupAspect.init();
    loadAspect.load();

    return api;
}
