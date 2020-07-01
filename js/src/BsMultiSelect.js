import {PluginManager, plugStaticDom} from './PluginManager'

import {composeSync, List, extendIfUndefined} from './ToolsJs';
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
import {FilterManagerAspect, NavigateManager, FilterPredicateAspect } from './FilterManagerAspect'
import {BuildAndAttachChoiceAspect, BuildChoiceAspect} from './BuildChoiceAspect'
import {FillChoicesAspect} from './FillChoicesAspect'

import {UpdateDataAspect } from './UpdateDataAspect'

import {CreateWrapAspect, CreateChoiceBaseAspect, OptionToggleAspect, WrapPickAspect, RemovePickAspect, AddPickAspect, ChoiceClickAspect, IsChoiceSelectableAspect, SetOptionSelectedAspect} from './CreateWrapAspect.js'
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'
import {Wraps} from './Wraps'

import {BuildPickAspect} from './BuildPickAspect'
import {InputAspect} from './InputAspect'
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
    let createWrapAspect        = CreateWrapAspect();
    let createChoiceBaseAspect   = CreateChoiceBaseAspect(optionPropertiesAspect);
    let setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
    let optionToggleAspect  = OptionToggleAspect(setOptionSelectedAspect);
    let addPickAspect = AddPickAspect();
    let removePickAspect = RemovePickAspect();
    let createElementAspect = CreateElementAspect(name => window.document.createElement(name));
    
    let choicesDomFactory = ChoicesDomFactory(createElementAspect);
    let staticDomFactory  = StaticDomFactory(choicesDomFactory, createElementAspect);
    
    let wrapsCollection = ArrayFacade();
    
    let countableChoicesList = DoublyLinkedList(
        (wrap)=>wrap.choice.itemPrev, 
        (warp, v)=>warp.choice.itemPrev=v, 
        (wrap)=>wrap.choice.itemNext, 
        (wrap, v)=>wrap.choice.itemNext=v
    );
    
    let countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection);

    let choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, wrap=>wrap.choice.itemNext)
    
    let filteredChoicesList = DoublyLinkedList(
        (wrap)=>wrap.choice.filteredPrev, 
        (wrap, v)=>wrap.choice.filteredPrev=v, 
        (wrap)=>wrap.choice.filteredNext, 
        (wrap, v)=>wrap.choice.filteredNext=v
    );
    
    let emptyNavigateManager = NavigateManager(
        countableChoicesList,
        (wrap)=>wrap.choice.itemPrev,
        (wrap)=>wrap.choice.itemNext 
        
    ); 
    let filteredNavigateManager = NavigateManager(
        filteredChoicesList, 
        (wrap)=>wrap.choice.filteredPrev,
        (wrap)=>wrap.choice.filteredNext ); 

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
    let picksList = List();
    let wraps = Wraps(
        wrapsCollection,
        ()=>countableChoicesList.reset(), 
        (w)=>countableChoicesList.remove(w),
        (w, key)=>countableChoicesListInsertAspect.countableChoicesListInsert(w, key));

    let aspects = {
        environment, configuration, triggerAspect, onChangeAspect, componentPropertiesAspect, disposeAspect,
        countableChoicesList, countableChoicesListInsertAspect,
        optionsAspect, optionPropertiesAspect, 
        createWrapAspect, createChoiceBaseAspect, setOptionSelectedAspect, isChoiceSelectableAspect, 
        optionToggleAspect, createElementAspect,
        choicesDomFactory, staticDomFactory,
        filterPredicateAspect, wrapsCollection, choicesEnumerableAspect, 
        filteredChoicesList, filterManagerAspect, hoveredChoiceAspect, navigateAspect, picksList, wraps,
        addPickAspect, removePickAspect
    }

    plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

    let {choicesDom, createStaticDom} = staticDomFactory.create(css)

    let {staticDom, staticManager} = createStaticDom(element, containerClass)

    // after this we can use staticDom in construtctor, this simplifies parameters passing a lot   

    let filterDom = FilterDom(staticDom.disposablePicksElement, createElementAspect, css);
    let popupAspect = PopupAspect(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect)
    let resetFilterAspect =  ResetFilterAspect(filterDom, resetFilterListAspect)
    let inputAspect = InputAspect( filterDom,filterManagerAspect);    

    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
    let focusInAspect = FocusInAspect(picksDom)

    let pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect);
    let buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
    let wrapPickAspect = WrapPickAspect(picksList, removePickAspect, buildPickAspect);
    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect);
    let choiceClickAspect = ChoiceClickAspect(wrapPickAspect, addPickAspect, filterDom);
    let buildChoiceAspect = BuildChoiceAspect( choicesDom, choiceDomFactory, choiceClickAspect);
    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(buildChoiceAspect);
    let resetLayoutAspect = ResetLayoutAspect(() => resetFilterAspect.resetFilter());

    let setDisabledComponentAspect = SetDisabledComponentAspect(picksList, picksDom);
    let updateDisabledComponentAspect = UpdateDisabledComponentAspect(componentPropertiesAspect,setDisabledComponentAspect );
    let appearanceAspect = AppearanceAspect(updateDisabledComponentAspect);
    
    let fillChoicesAspect = FillChoicesAspect(
        window.document, createWrapAspect, createChoiceBaseAspect, optionsAspect, wraps, buildAndAttachChoiceAspect );
    let loadAspect = LoadAspect(fillChoicesAspect, appearanceAspect);
    let updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, fillChoicesAspect, resetLayoutAspect);

    extendIfUndefined(aspects, {
        staticDom, picksDom, choicesDom,filterDom, resetLayoutAspect, pickDomFactory, choiceDomFactory,
        popupAspect, staticManager, buildChoiceAspect,  choiceClickAspect, 
        buildAndAttachChoiceAspect , fillChoicesAspect, 
        buildPickAspect, wrapPickAspect, inputAspect, resetFilterListAspect, resetFilterAspect, 
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
        ()=>{picksList.forEach(wrap=>wrap.pick.dispose());},
        multiSelectInlineLayout.dispose, // TODO move to layout
        wraps.dispose,
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
