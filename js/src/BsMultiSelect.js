import {PluginManager, plugStaticDom} from './PluginManager'

import {composeSync, List, extendIfUndefined} from './ToolsJs';
import {PickDomFactory} from './PickDomFactory';
import {ChoiceDomFactory} from './ChoiceDomFactory';

import {StaticDomFactory, CreateElementAspect} from './StaticDomFactory';

import {PicksDom} from './PicksDom';
import {FilterDom} from './FilterDom';

import {ChoicesDomFactory} from './ChoicesDomFactory';
import {ChoicesVisibilityAspect} from './ChoicesVisibilityAspect';
import {SpecialPicksEventsAspect} from './SpecialPicksEventsAspect';
 
import {ComponentPropertiesAspect, TriggerAspect, OnChangeAspect} from './ComponentPropertiesAspect';
import {OptionsAspect, OptionPropertiesAspect} from './OptionsAspect';

import {ChoicesEnumerableAspect } from './ChoicesEnumerableAspect'
import {FilterManagerAspect, NavigateManager, FilterPredicateAspect} from './FilterManagerAspect'
import {BuildAndAttachChoiceAspect, BuildChoiceAspect} from './BuildChoiceAspect'
import {FillChoicesAspect} from './FillChoicesAspect'

import {UpdateDataAspect } from './UpdateDataAspect'
import {CreateWrapAspect, CreateChoiceBaseAspect, OptionToggleAspect, CreatePickHandlersAspect, RemovePickAspect, 
    AddPickAspect, FullMatchAspect, ChoiceClickAspect, IsChoiceSelectableAspect, ProducePickAspect} from './CreateWrapAspect.js'
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'
import {Wraps} from './Wraps'


import {PickButtonAspect} from './PickButtonAspect'

import {BuildPickAspect} from './BuildPickAspect'
import {InputAspect} from './InputAspect'
import {ResetFilterAspect, FocusInAspect, ResetFilterListAspect} from './ResetFilterListAspect'

import {MultiSelectInlineLayout} from './MultiSelectInlineLayout'

import {SetDisabledComponentAspect, UpdateDisabledComponentAspect, LoadAspect, AppearanceAspect, ResetLayoutAspect} from './AppearanceAspect'
import {DoublyLinkedList, ArrayFacade} from './ToolsJs'
import {CountableChoicesListInsertAspect} from './CountableChoicesListInsertAspect'

/// environment - common for many; configuration for concreate
export function BsMultiSelect(element, environment, plugins, configuration, onInit){
    var {window} = environment;
    environment.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    let { containerClass,
          css, 
          getDisabled,
          options, 
          getText
        } = configuration;
    
    let disposeAspect = {};
    let triggerAspect = TriggerAspect(element, environment.trigger);
    let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
    let componentPropertiesAspect = ComponentPropertiesAspect(getDisabled??(() => false));
    let optionsAspect   = OptionsAspect(options); 
    let optionPropertiesAspect = OptionPropertiesAspect(getText);
    let isChoiceSelectableAspect = IsChoiceSelectableAspect();
    let createWrapAspect        = CreateWrapAspect();
    let createChoiceBaseAspect   = CreateChoiceBaseAspect(optionPropertiesAspect);
    //let rtlAspect = RtlAspect();
    //let setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);
    
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
        createWrapAspect, createChoiceBaseAspect, isChoiceSelectableAspect, 
        createElementAspect,
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
    let specialPicksEventsAspect = SpecialPicksEventsAspect();

    let choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect)
    let resetFilterAspect =  ResetFilterAspect(filterDom, resetFilterListAspect)
    

    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElementAspect, css);
    let focusInAspect = FocusInAspect(picksDom);
    
    let pickButtonAspect = PickButtonAspect(configuration.pickButtonHTML);
    
    let pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect, pickButtonAspect);
    let buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
    let producePickAspect = ProducePickAspect(picksList, removePickAspect, buildPickAspect)
    let createPickHandlersAspect = CreatePickHandlersAspect(producePickAspect);
    
    
    let optionToggleAspect  = OptionToggleAspect(createPickHandlersAspect, addPickAspect);
    let fullMatchAspect = FullMatchAspect(createPickHandlersAspect, addPickAspect);
    let inputAspect = InputAspect(filterDom, filterManagerAspect, fullMatchAspect);    

    let choiceClickAspect = ChoiceClickAspect(optionToggleAspect, filterDom);

    let choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect, aspects.highlightAspect); // optional highlightAspect added by highlightPlugin
    
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
        choicesVisibilityAspect, staticManager, buildChoiceAspect, optionToggleAspect,  choiceClickAspect, 
        buildAndAttachChoiceAspect , fillChoicesAspect, 
        buildPickAspect, producePickAspect, createPickHandlersAspect, inputAspect, resetFilterListAspect, resetFilterAspect, 
        specialPicksEventsAspect,
        resetLayoutAspect, focusInAspect, 
        updateDisabledComponentAspect, setDisabledComponentAspect, appearanceAspect, loadAspect,
        updateDataAspect , fullMatchAspect} )
    
    let pluginManager = PluginManager(plugins, aspects);
    
    let multiSelectInlineLayout =  MultiSelectInlineLayout(aspects);

    let api = {component: "BsMultiSelect.api"} // key used in memory leak analyzes
   
    pluginManager.buildApi(api);
    // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?
    api.dispose = composeSync(
        resetLayoutAspect.resetLayout,
        disposeAspect.dispose,
        pluginManager.dispose, 
        ()=>{picksList.forEach(pick=>pick.dispose());},
        multiSelectInlineLayout.dispose, // TODO move to layout
        wraps.dispose,
        staticManager.dispose,  picksDom.dispose, filterDom.dispose );
    
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
//    popupAspect.init();
    loadAspect.load();
    
    return api;
}
