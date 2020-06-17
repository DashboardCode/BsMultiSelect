import {PluginManager, plugStaticDom} from './PluginManager'

import {composeSync} from './ToolsJs';

import {PickDomFactory} from './PickDomFactory';
import {ChoiceDomFactory} from './ChoiceDomFactory';

import {StaticDomFactory, CreateElementAspect} from './StaticDomFactory';

import {PicksDom} from './PicksDom';
import {FilterDom} from './FilterDom';

import {ChoicesDomFactory} from './ChoicesDomFactory';
import {PopupAspect} from './PopupAspect';

import {ComponentPropertiesAspect, TriggerAspect, OnChangeAspect} from './ComponentPropertiesAspect';
import {OptionsAspect, OptionPropertiesAspect} from './OptionsAspect';

import {ChoicesEnumerableAspect } from './ChoicesEnumerableAspect'
import {FilterManagerAspect, NavigateManager } from './FilterListAspect'
import {BuildAndAttachChoiceAspect, BuildChoiceAspect} from './BuildChoiceAspect'
import {FillChoicesAspect} from './FillChoicesAspect'

import {UpdateDataAspect } from './UpdateDataAspect'

import {OptionToggleAspect} from './OptionToggleAspect'
import {CreateChoiceAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect} from './CreateChoiceAspect.js'
import {Choices} from './Choices'
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'

import {Picks} from './Picks'
import {BuildPickAspect} from './BuildPickAspect'
import {InputAspect} from './InputAspect'
import {ResetFilterListAspect} from './ResetFilterListAspect'
import {ManageableResetFilterListAspect} from './ResetFilterListAspect'
import {FocusInAspect} from './ResetFilterListAspect'
import {MultiSelectInlineLayoutAspect} from './MultiSelectInlineLayoutAspect'
import {FilterAspect} from './FilterAspect'
import {DisabledComponentAspect, LoadAspect, AppearanceAspect} from './AppearanceAspect'
import {DoublyLinkedList, ArrayFacade} from './ToolsJs'
import {CountableChoicesListInsertAspect} from './CountableChoicesListInsertAspect'

/// environment - common for many; configuration for concreate
export function BsMultiSelect(element, environment, configuration, onInit){
    var {Popper, window, plugins} = environment;
    
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let { containerClass,
          css, 
          getDisabled,
          options, 
          getText, getSelected, setSelected, getIsOptionDisabled,
        } = configuration;

    let disposeAspect = {};
    let triggerAspect = TriggerAspect(element, environment.trigger);
    let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
    let componentPropertiesAspect = ComponentPropertiesAspect(getDisabled??(() => false));
    let optionsAspect   = OptionsAspect(options); 
    let optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected, getIsOptionDisabled);
    let isChoiceSelectableAspect = IsChoiceSelectableAspect();
    let createChoiceAspect        = CreateChoiceAspect(optionPropertiesAspect);
    let setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
    let optionToggleAspect  = OptionToggleAspect(setOptionSelectedAspect);
    let createElementAspect = CreateElementAspect(name => window.document.createElement(name));
    
    let choicesDomFactory = ChoicesDomFactory(createElementAspect);
    let staticDomFactory  = StaticDomFactory(choicesDomFactory, createElementAspect);
    
    let choicesCollection = ArrayFacade();
    
    let countableChoicesList = DoublyLinkedList(
        (choice)=>choice.itemPrev, 
        (choice, v)=>choice.itemPrev=v, 
        (choice)=>choice.itemNext, 
        (choice, v)=>choice.itemNext=v
    );
    
    let countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList);

    let choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, (choice)=>choice.itemNext)
    
    let filteredChoicesList = DoublyLinkedList(
        (choice)=>choice.filteredPrev, 
        (choice, v)=>choice.filteredPrev=v, 
        (choice)=>choice.filteredNext, 
        (choice, v)=>choice.filteredNext=v
    );

    
    let emptyNavigateManager = NavigateManager(
        countableChoicesList,
        (choice)=>choice.itemPrev,
        (choice)=>choice.itemNext 
        
    ); 
    let filteredNavigateManager = NavigateManager(
        filteredChoicesList, 
        (choice)=>choice.filteredPrev,
        (choice)=>choice.filteredNext ); 

    let filterManagerAspect = FilterManagerAspect(
        emptyNavigateManager,
        filteredNavigateManager,
        
        filteredChoicesList, 
        choicesEnumerableAspect
    );

    let hoveredChoiceAspect = HoveredChoiceAspect()
    let navigateAspect = NavigateAspect(hoveredChoiceAspect, 
        (down, hoveredChoice)=>filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice));
    let picks = Picks();
    let choices = Choices(
        choicesCollection,
        ()=>countableChoicesList.reset(), 
        (c)=>countableChoicesList.remove(c),
        (c, key)=>countableChoicesListInsertAspect.countableChoicesListInsert(c, key));

    let aspects = {
        environment, configuration, triggerAspect, onChangeAspect, componentPropertiesAspect, disposeAspect,
        countableChoicesList, countableChoicesListInsertAspect,
        optionsAspect, optionPropertiesAspect, createChoiceAspect, setOptionSelectedAspect, isChoiceSelectableAspect, optionToggleAspect, createElementAspect,
        choicesDomFactory, staticDomFactory,

        choicesCollection, choicesEnumerableAspect, 
        filteredChoicesList, filterManagerAspect, hoveredChoiceAspect, navigateAspect, picks, choices
    }

    plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

    let {choicesDom, createStaticDom} = staticDomFactory.create(css)

    let {staticDom, staticManager} = createStaticDom(element, containerClass)

    // after this we can use staticDom in construtctor, this simplifies parameter passing a lot   

    let filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
    let popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect)
    let manageableResetFilterListAspect =  ManageableResetFilterListAspect(filterDom, resetFilterListAspect)
    let inputAspect = InputAspect(filterManagerAspect, setOptionSelectedAspect, hoveredChoiceAspect, navigateAspect, filterDom, popupAspect);

    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
    let focusInAspect = FocusInAspect(picksDom)
    
    let pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);

    let createPickAspect = BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory);

    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
    
    let buildChoiceAspect = BuildChoiceAspect( choicesDom, filterDom, choiceDomFactory, onChangeAspect, optionToggleAspect, createPickAspect)
    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(buildChoiceAspect);
    let fillChoicesAspect = FillChoicesAspect(window.document, createChoiceAspect, optionsAspect, choices, buildAndAttachChoiceAspect);

    // -----------
    let multiSelectInlineLayoutAspect =  MultiSelectInlineLayoutAspect(
        window,
        () => filterDom.setFocus(), 
        picksDom.picksElement, 
        choicesDom.choicesElement, 
        () => popupAspect.isChoicesVisible(),
        (visible) => popupAspect.setChoicesVisible(visible),
        () => hoveredChoiceAspect.resetHoveredChoice(), 
        (choice) => navigateAspect.hoverIn(choice),
        (down) =>  navigateAspect.navigate(down),
        () => manageableResetFilterListAspect.resetFilter(),
        /*isChoicesListEmpty*/() => filterManagerAspect.getNavigateManager().getCount()==0, 
        
        /*onClick*/(event) => filterDom.setFocusIfNotTarget(event.target),
        /*resetFocus*/() => focusInAspect.setFocusIn(false),
        /*alignToFilterInputItemLocation*/() => popupAspect.updatePopupLocation(),
        /*toggleHovered*/ () => {
            var wasToggled = false;
            let hoveredChoice = hoveredChoiceAspect.getHoveredChoice(); 
            if (hoveredChoice){
                wasToggled = optionToggleAspect.toggle(hoveredChoice); 
            }
            return wasToggled;
        }
    );

    let filterAspect = FilterAspect(
        filterDom.filterInputElement,

        /*focusIn*/() => focusInAspect.setFocusIn(true),  // show dropdown
        /*focusOut*/() => multiSelectInlineLayoutAspect.onFocusOut(
            () => focusInAspect.setFocusIn(false)
        ), // hide dropdown

        /*onInput*/(filterInputValue, resetLength) =>
        { 
            inputAspect.input(
                filterInputValue, 
                resetLength,
                ()=>multiSelectInlineLayoutAspect.eventLoopFlag.set(), 
                ()=>multiSelectInlineLayoutAspect.showChoices(),
                ()=>multiSelectInlineLayoutAspect.hideChoices()
            ) 
        },

        () => multiSelectInlineLayoutAspect.keyDownArrow(false), // arrow up
        () => multiSelectInlineLayoutAspect.keyDownArrow(true),  // arrow down
        /*onTabForEmpty*/() => multiSelectInlineLayoutAspect.hideChoices(),  // tab on empty
        () => {
            let p = picks.removePicksTail();
            if (p)
                popupAspect.updatePopupLocation();
        }, // backspace - "remove last"

        /*onTabToCompleate*/() => { 
            if (popupAspect.isChoicesVisible()) {
                multiSelectInlineLayoutAspect.hoveredToSelected();
            } 
        },
        /*onEnterToCompleate*/() => { 
            if (popupAspect.isChoicesVisible()) {
                multiSelectInlineLayoutAspect.hoveredToSelected();
            } else {
                if (filterManagerAspect.getNavigateManager().getCount()>0){
                    multiSelectInlineLayoutAspect.showChoices();
                }
            }
        },
       
        /*onKeyUpEsc*/() => {
            multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st
            manageableResetFilterListAspect.resetFilter();
        }, // esc keyup 

        // tab/enter "compleate hovered"
        /*stopEscKeyDownPropogation*/() => popupAspect.isChoicesVisible()
    );

    let disabledComponentAspect = DisabledComponentAspect(componentPropertiesAspect, picks, multiSelectInlineLayoutAspect, picksDom);
    let appearanceAspect = AppearanceAspect(disabledComponentAspect);
    let loadAspect = LoadAspect(fillChoicesAspect, multiSelectInlineLayoutAspect, appearanceAspect);

    let updateDataAspect = UpdateDataAspect(multiSelectInlineLayoutAspect, manageableResetFilterListAspect,
        choicesDom, choices, picks, fillChoicesAspect);

    aspects.pickDomFactory=pickDomFactory;
    aspects.choiceDomFactory=choiceDomFactory;
    aspects.staticDom=staticDom;
    aspects.picksDom=picksDom;
    aspects.choicesDom=choicesDom;
    aspects.popupAspect=popupAspect;
    aspects.staticManager=staticManager;

    aspects.buildChoiceAspect=buildChoiceAspect;
    aspects.buildAndAttachChoiceAspect=buildAndAttachChoiceAspect;
    aspects.fillChoicesAspect=fillChoicesAspect;

    aspects.createPickAspect=createPickAspect;
    aspects.filterDom=filterDom;
    aspects.inputAspect=inputAspect;
    aspects.resetFilterListAspect=resetFilterListAspect;
    aspects.manageableResetFilterListAspect=manageableResetFilterListAspect;

    aspects.multiSelectInlineLayoutAspect=multiSelectInlineLayoutAspect;
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
        multiSelectInlineLayoutAspect.hideChoices,
        pluginManager.dispose, 
        picks.dispose,
        multiSelectInlineLayoutAspect.dispose,
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
