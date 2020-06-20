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
import {FilterManagerAspect, NavigateManager, FilterPredicateAspect } from './FilterListAspect'
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
import {MultiSelectInlineLayout} from './MultiSelectInlineLayout'

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
          getText, getSelected, setSelected,
        } = configuration;

    let disposeAspect = {};
    let triggerAspect = TriggerAspect(element, environment.trigger);
    let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
    let componentPropertiesAspect = ComponentPropertiesAspect(getDisabled??(() => false));
    let optionsAspect   = OptionsAspect(options); 
    let optionPropertiesAspect = OptionPropertiesAspect(getText, getSelected, setSelected);
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

    let filterPredicateAspect = FilterPredicateAspect()
    let filterManagerAspect = FilterManagerAspect(
        emptyNavigateManager,
        filteredNavigateManager,
        
        filteredChoicesList, 
        choicesEnumerableAspect,
        filterPredicateAspect
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
        filterPredicateAspect, 
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
    let inputAspect = InputAspect(
        filterDom,
        filterManagerAspect, 
        /* setSelectedIfExactMatch */ 
        (text) => {
            let wasSetEmpty = false;
            if ( filterManagerAspect.getNavigateManager().getCount() == 1)
            {
                let fullMatchChoice =  filterManagerAspect.getNavigateManager().getHead();
                if (fullMatchChoice.searchText == text)
                {
                    setOptionSelectedAspect.setOptionSelected(fullMatchChoice, true);
                    filterDom.setEmpty();
                    wasSetEmpty = true;
                }
            }
            return wasSetEmpty;
        }
    );    

    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
    let focusInAspect = FocusInAspect(picksDom)

    let pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
    let createPickAspect = BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory);
    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);

    // TODO not real aspect, correct it
    // actually this should be a builder of all events (wrapper or redesign)
    let multiSelectInlineLayout =  MultiSelectInlineLayout(
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
        /*getNavigateManager*/() => filterManagerAspect.getNavigateManager(), 
        
        /*onClick*/(event) => filterDom.setFocusIfNotTarget(event.target),
        /*resetFocus*/() => focusInAspect.setFocusIn(false),
        /*setFocus*/() => focusInAspect.setFocusIn(true),
        /*alignToFilterInputItemLocation*/() => popupAspect.updatePopupLocation(),
        /*toggleHovered*/ () => {
            var wasToggled = false;
            let hoveredChoice = hoveredChoiceAspect.getHoveredChoice(); 
            if (hoveredChoice){
                wasToggled = optionToggleAspect.toggle(hoveredChoice); 
            }
            return wasToggled;
        },
        filterDom,
        /*processInput*/() => inputAspect.processInput(),
        /*removePicksTail*/() => picks.removePicksTail(),
    );
   
    let buildChoiceAspect = BuildChoiceAspect( 
        choicesDom, filterDom, choiceDomFactory, 
        onChangeAspect, optionToggleAspect, 
        // TODO move to layout
        /**/(choice)=>createPickAspect.buildPick(choice, (s) => multiSelectInlineLayout.handleOnRemoveButton(s)),
    );
    
    let origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice = (choice) => {
        origBuildChoice(choice);
        let unbindChoiceElement = multiSelectInlineLayout.adoptChoiceElement(choice);
        choice.dispose = composeSync(unbindChoiceElement, choice.dispose )
    }

    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(buildChoiceAspect);

    // TODO move to layout
    let disabledComponentAspect = DisabledComponentAspect(componentPropertiesAspect, picks, picksDom, 
        (newIsComponentDisabled) => multiSelectInlineLayout.disableComponent(newIsComponentDisabled)
    );
    let appearanceAspect = AppearanceAspect(disabledComponentAspect);

    let fillChoicesAspect = FillChoicesAspect(
        window.document, 
        createChoiceAspect, 
        optionsAspect, 
        choices, 
        (choice) => buildAndAttachChoiceAspect.buildAndAttachChoice(choice)
    );

    let loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);

    function HideChoicesResetFilterAspect(){
        return {
            hideChoicesResetFilter(){
                multiSelectInlineLayout.hideChoicesResetFilter()
            }
        }
    }
    let hideChoicesResetFilterAspect = HideChoicesResetFilterAspect();
    // TODO move to layout
    let updateDataAspect = UpdateDataAspect(
        choicesDom, choices, picks, fillChoicesAspect,
        /*beforeUpdateData*/ () => hideChoicesResetFilterAspect.hideChoicesResetFilter()
    );

    // TODO: similar for other events, starting from multiSelectInlineLayout.adoptChoiceElement
    let filterInputElementEvents = multiSelectInlineLayout.getFilterInputElementEvents();
    
    aspects.multiSelectInlineLayout = multiSelectInlineLayout;
    aspects.hideChoicesResetFilterAspect =hideChoicesResetFilterAspect;
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

    aspects.hideChoicesResetFilterAspect=hideChoicesResetFilterAspect;
    aspects.focusInAspect=focusInAspect;
    aspects.disabledComponentAspect=disabledComponentAspect;
    aspects.appearanceAspect=appearanceAspect;

    aspects.loadAspect=loadAspect;
    aspects.updateDataAspect=updateDataAspect;
    aspects.filterInputElementEvents=filterInputElementEvents;

    let pluginManager = PluginManager(plugins, aspects);
        
    let api = {component: "BsMultiSelect.api"} // key used in memory leak analyzes
   
    pluginManager.buildApi(api);

    api.dispose = composeSync(
        hideChoicesResetFilterAspect.hideChoicesResetFilter,
        disposeAspect.dispose,
        pluginManager.dispose, 
        picks.dispose,
        multiSelectInlineLayout.dispose,
        choices.dispose,
        staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose );
    
    api.updateData = updateDataAspect.updateData;
    api.update = () => {
        updateDataAspect.updateData();
        appearanceAspect.updateAppearance();
    }
    api.updateAppearance = appearanceAspect.updateAppearance
    api.updateDisabled = disabledComponentAspect.updateDisabledComponent;

    onInit?.(api, aspects);
    
    filterDom.onKeyDown(filterInputElementEvents.onKeyDown);    
    filterDom.onKeyUp(filterInputElementEvents.onKeyUp);
    picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);

    picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
    staticManager.appendToContainer();
    popupAspect.init();
    loadAspect.load();

    return api;
}
