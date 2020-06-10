import {PluginManager, plugOnConfiguration, staticDomDefaults} from './PluginManager'

import {composeSync} from './ToolsJs';

import {PickDomFactory} from './PickDomFactory';
import {ChoiceDomFactory} from './ChoiceDomFactory';

import {StaticDomFactory, CreateElementAspect} from './StaticDomFactory';

import {PicksDom} from './PicksDom';
import {FilterDom} from './FilterDom';

import {ChoicesDomFactory} from './ChoicesDomFactory';
import {PopupAspect} from './PopupAspect';

import {ComponentAspect, TriggerAspect, OnChangeAspect} from './ComponentAspect';
import {OptionsAspect, OptionPropertiesAspect} from './OptionsAspect';

import {DoublyLinkedCollection} from './ToolsJs'

import {FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect'
import {ChoicesElementAspect, ChoiceFactoryAspect, ChoicesAspect } from './ChoicesAspect'
import {UpdateDataAspect } from './UpdateDataAspect'

import {OptionToggleAspect} from './OptionToggleAspect'
import {ChoiceAspect} from './ChoiceAspect.js'
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
    
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let { containerClass, css, 
          getDisabled,
          options, 
          getText, getSelected, setSelected, getIsOptionDisabled,
        } = configuration;
    let disposeAspect = {};
    let triggerAspect = TriggerAspect(element, environment.trigger);
    let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
    let componentAspect = ComponentAspect(getDisabled);
    let optionsAspect   = OptionsAspect(options); 
    let optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected, getIsOptionDisabled);
    let choiceAspect        = ChoiceAspect(optionPropertiesAspect);
    let optionToggleAspect  = OptionToggleAspect(choiceAspect);
    let createElementAspect = CreateElementAspect(name => window.document.createElement(name));
    
    let aspects = {
        environment, configuration, triggerAspect, onChangeAspect, componentAspect, disposeAspect,
        optionsAspect, optionPropertiesAspect, choiceAspect, optionToggleAspect, createElementAspect
    }
    plugOnConfiguration(plugins, aspects); // apply cssPatch    
    
    let choicesDomFactory = ChoicesDomFactory(createElementAspect, css);
    let staticDomFactory  = StaticDomFactory(choicesDomFactory, createElementAspect);
    aspects.choicesDomFactory=choicesDomFactory;
    aspects.staticDomFactory=staticDomFactory;
    
    staticDomDefaults(plugins, aspects);

    let {choicesDom, createStaticDom} = staticDomFactory.create()
    let {staticDom, staticManager} = createStaticDom(element, containerClass)

    let filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
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

    let inputAspect = InputAspect(filterListAspect, choiceAspect, filterDom, popupAspect, choicesHover);

    let picks = Picks();
    
    let pickDomFactory = PickDomFactory(css, componentAspect, optionPropertiesAspect);
    let picksAspect = PicksAspect(
        picksDom, 
        pickDomFactory,
        choiceAspect, picks, manageableResetFilterListAspect
    );

    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
    
    let choicesElementAspect = ChoicesElementAspect( choicesDom, filterDom, choiceDomFactory, onChangeAspect, optionToggleAspect, picksAspect)
    let choiceFactoryAspect =  ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
    let choicesAspect = ChoicesAspect(window.document, choiceAspect, optionsAspect, choices, choiceFactoryAspect);

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
            var wasToggled = optionToggleAspect.toggle(hoveredChoice);
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

    aspects.pickDomFactory=pickDomFactory;
    aspects.choiceDomFactory=choiceDomFactory;
    aspects.staticDom=staticDom;
    aspects.picksDom=picksDom;
    aspects.choicesDom=choicesDom;
    aspects.popupAspect=popupAspect;
    aspects.staticManager=staticManager;

    aspects.choicesGetNextAspect=choicesGetNextAspect;
    aspects.choicesEnumerableAspect=choicesEnumerableAspect;
    aspects.filterListAspect=filterListAspect;
    aspects.choices=choices;
    aspects.choicesHover=choicesHover;
    aspects.picks=picks;
    aspects.choicesElementAspect=choicesElementAspect;
    aspects.choiceFactoryAspect=choiceFactoryAspect;
    aspects.choicesAspect=choicesAspect;

    aspects.picksAspect=picksAspect;
    aspects.filterDom=filterDom;
    aspects.inputAspect=inputAspect;
    aspects.resetFilterListAspect=resetFilterListAspect;
    aspects.manageableResetFilterListAspect=manageableResetFilterListAspect;

    aspects.multiSelectInputAspect=multiSelectInputAspect;
    aspects.focusInAspect=focusInAspect;
    aspects.filterAspect=filterAspect;
    aspects.disabledComponentAspect=disabledComponentAspect;
    aspects.appearanceAspect=appearanceAspect;

    aspects.loadAspect=loadAspect;
    aspects.updateDataAspect=updateDataAspect;

    let pluginManager = PluginManager(plugins, aspects);
        
    let api = {component: "BsMultiSelect.api"} 
   
    pluginManager.buildApi(api);

    api.dispose = composeSync(
        disposeAspect.dispose,
        multiSelectInputAspect.hideChoices,
        pluginManager.dispose, 
        picks.dispose,
        multiSelectInputAspect.dispose,
        choices.dispose,
        staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose, filterAspect.dispose );
    
    api.updateData = updateDataAspect.updateData;
    api.update = () => {
        updateDataAspect.updateData();
        appearanceAspect.updateAppearance();
    }
    api.updateAppearance = appearanceAspect.updateAppearance
    api.updateDisabled = disabledComponentAspect.updateDisabledComponent;

    onInit?.(api, aspects);
       
    picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
    picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
    staticManager.appendToContainer();
    popupAspect.init();
    loadAspect.load();

    return api;
}
