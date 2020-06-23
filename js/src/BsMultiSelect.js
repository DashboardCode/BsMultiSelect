import {PluginManager, plugStaticDom} from './PluginManager'

import {composeSync, extendIfUndefined} from './ToolsJs';

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
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'
import {Choices} from './Choices'

import {Picks} from './Picks'
import {BuildPickAspect} from './BuildPickAspect'
import {InputAspect, SetSelectedIfExactMatch} from './InputAspect'
import {ResetFilterAspect, FocusInAspect, ResetFilterListAspect} from './ResetFilterListAspect'

import {MultiSelectInlineLayout} from './MultiSelectInlineLayout'

import {SetDisabledComponentAspect, UpdateDisabledComponentAspect, LoadAspect, AppearanceAspect, ResetLayoutAspect} from './AppearanceAspect'
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

    // after this we can use staticDom in construtctor, this simplifies parameters passing a lot   

    let filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
    let popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect)
    let resetFilterAspect =  ResetFilterAspect(filterDom, resetFilterListAspect)
    let setSelectedIfExactMatch = SetSelectedIfExactMatch(filterDom,filterManagerAspect)
    let inputAspect = InputAspect( filterDom,filterManagerAspect, setSelectedIfExactMatch);    

    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
    let focusInAspect = FocusInAspect(picksDom)

    let pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
    let buildPickAspect = BuildPickAspect(picksDom, pickDomFactory, setOptionSelectedAspect, picks);
    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);

    let buildChoiceAspect = BuildChoiceAspect( 
        choicesDom, choiceDomFactory, optionToggleAspect, filterDom, 
        onChangeAspect, 
    );
    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(buildChoiceAspect);
    let resetLayoutAspect = ResetLayoutAspect(() => resetFilterAspect.resetFilter());

    let setDisabledComponentAspect = SetDisabledComponentAspect(picks, picksDom);
    let updateDisabledComponentAspect = UpdateDisabledComponentAspect(componentPropertiesAspect,setDisabledComponentAspect );
    let appearanceAspect = AppearanceAspect(updateDisabledComponentAspect);

    let fillChoicesAspect = FillChoicesAspect(
        window.document, createChoiceAspect, optionsAspect, choices, buildAndAttachChoiceAspect );
    let loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);
    let updateDataAspect = UpdateDataAspect(choicesDom, choices, picks, fillChoicesAspect, resetLayoutAspect);

    extendIfUndefined(aspects, {
        staticDom, picksDom, choicesDom,filterDom, resetLayoutAspect, pickDomFactory, choiceDomFactory,
        popupAspect, staticManager, buildChoiceAspect, 
        buildAndAttachChoiceAspect , fillChoicesAspect, 
        buildPickAspect, setSelectedIfExactMatch, inputAspect, resetFilterListAspect, resetFilterAspect, 
        resetLayoutAspect, focusInAspect, 
        updateDisabledComponentAspect, setDisabledComponentAspect, appearanceAspect, loadAspect,
        updateDataAspect} )
    
    let pluginManager = PluginManager(plugins, aspects);
    let multiSelectInlineLayout =  MultiSelectInlineLayout(aspects);

    let api = {component: "BsMultiSelect.api"} // key used in memory leak analyzes
   
    pluginManager.buildApi(api);
    // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?
    api.dispose = composeSync(
        resetLayoutAspect.resetLayout,
        disposeAspect.dispose,
        pluginManager.dispose, 
        picks.dispose,
        multiSelectInlineLayout.dispose, // TODO move to layout
        choices.dispose,
        staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose );
    
    api.updateAppearance = appearanceAspect.updateAppearance;
    api.updateData = updateDataAspect.updateData;
    api.update = () => {
        updateDataAspect.updateData();
        appearanceAspect.updateAppearance();
    }
    
    api.updateDisabled = updateDisabledComponentAspect.updateDisabledComponent;
    // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

    onInit?.(api, aspects);
    picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
    picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
    staticManager.appendToContainer();
    popupAspect.init();
    loadAspect.load();

    return api;
}
