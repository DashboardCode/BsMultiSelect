import {composeSync, List} from './ToolsJs';
import {PickDomFactory} from './PickDomFactory';
import {ChoiceDomFactory} from './ChoiceDomFactory';

import {StaticDomFactory} from './StaticDomFactory';

import {CreateElementAspect} from './CreateElementAspect';

import {PicksDomFactory} from './PicksDomFactory';
import {FilterDomFactory} from './FilterDomFactory';

import {ChoicesDomFactory} from './ChoicesDomFactory';
import {ChoicesVisibilityAspect} from './ChoicesVisibilityAspect';
import {SpecialPicksEventsAspect} from './SpecialPicksEventsAspect';
 
import {ComponentPropertiesAspect, TriggerAspect, OnChangeAspect} from './ComponentPropertiesAspect';
import {OptionsAspect, OptionPropertiesAspect} from './OptionsAspect';

import {ChoicesEnumerableAspect } from './ChoicesEnumerableAspect'
import {FilterManagerAspect, NavigateManager, FilterPredicateAspect} from './FilterManagerAspect'
import {BuildAndAttachChoiceAspect, BuildChoiceAspect} from './BuildChoiceAspect'
import {OptionsLoopAspect, OptionAttachAspect} from './OptionsLoopAspect'

import {UpdateDataAspect } from './UpdateDataAspect'
import {UpdateAspect } from './UpdateDataAspect'
import {CreateWrapAspect, CreateChoiceBaseAspect, OptionToggleAspect, CreatePickHandlersAspect, RemovePickAspect, 
    AddPickAspect, FullMatchAspect, ChoiceClickAspect, IsChoiceSelectableAspect, ProducePickAspect} from './CreateWrapAspect.js'
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'
import {Wraps} from './Wraps'


import {PickButtonAspect} from './PickButtonAspect'

import {BuildPickAspect} from './BuildPickAspect'
import {InputAspect} from './InputAspect'
import {ResetFilterAspect, FocusInAspect, ResetFilterListAspect} from './ResetFilterListAspect'

import {MultiSelectInlineLayoutAspect} from './MultiSelectInlineLayoutAspect'

import {ResetLayoutAspect} from './ResetLayoutAspect'

import {LoadAspect} from './LoadAspect'
import {DoublyLinkedList, ArrayFacade} from './ToolsJs'
import {CountableChoicesListInsertAspect} from './CountableChoicesListInsertAspect'

import {PicksElementAspect} from './PicksElementAspect'
import {AfterInputAspect} from './AfterInputAspect'


/// environment - common for many; configuration for concreate
export function BsMultiSelect(element, environment, pluginManager, configuration, onInit){
    var {window} = environment;
    environment.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    let { containerClass,
          css, 
          getDisabled,
          options, 
          getText
        } = configuration;
    
    let disposeAspect = {dispose(){}};
    let triggerAspect = TriggerAspect(element, environment.trigger);
    let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
    let componentPropertiesAspect = ComponentPropertiesAspect(getDisabled??(() => false));
    let optionsAspect = OptionsAspect(options); 
    let optionPropertiesAspect = OptionPropertiesAspect(getText);
    let isChoiceSelectableAspect = IsChoiceSelectableAspect();
    let createWrapAspect       = CreateWrapAspect();
    let createChoiceBaseAspect = CreateChoiceBaseAspect(optionPropertiesAspect);
    
    let addPickAspect = AddPickAspect();
    let removePickAspect = RemovePickAspect();
    
    let createElementAspect = CreateElementAspect(name => window.document.createElement(name), (element, html) => element.innerHTML = html );
    
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

    let picksDomFactory   = PicksDomFactory  (css, createElementAspect);
    let filterDomFactory  = FilterDomFactory (css, createElementAspect);
    let choicesDomFactory = ChoicesDomFactory(css, createElementAspect);

    let pickButtonAspect  = PickButtonAspect(configuration.pickButtonHTML);
    let pickDomFactory    = PickDomFactory   (css, createElementAspect, optionPropertiesAspect, pickButtonAspect);
    let choiceDomFactory  = ChoiceDomFactory (css, createElementAspect, optionPropertiesAspect);
    
    pluginManager.plugStaticDomFactories(
        {
            environment, configuration, disposeAspect, 
            
            triggerAspect, onChangeAspect, componentPropertiesAspect, 
            countableChoicesList, countableChoicesListInsertAspect, optionPropertiesAspect, createElementAspect,
            wrapsCollection, choicesEnumerableAspect, filteredChoicesList, 
            filterPredicateAspect, isChoiceSelectableAspect,  
    
            hoveredChoiceAspect, navigateAspect, 
    
            choicesDomFactory, filterDomFactory, picksDomFactory, 
            pickDomFactory, choiceDomFactory, 
    
            filterManagerAspect,
    
            optionsAspect, createWrapAspect, createChoiceBaseAspect, 
            picksList, wraps, addPickAspect, removePickAspect
        }
    );


    let staticDomFactory  = StaticDomFactory(createElementAspect);

    pluginManager.plugStaticDom(
        {staticDomFactory}
    ); // apply cssPatch to css, apply selectElement support;  

    let {createStaticDom} = staticDomFactory.create(choicesDomFactory, filterDomFactory, picksDomFactory); // overrided in SelectElementPlugin

    let {staticDom, filterDom, picksDom, staticManager, choicesDom} = createStaticDom(element, containerClass);

    // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   


    let specialPicksEventsAspect = SpecialPicksEventsAspect();

    let choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
    let resetFilterAspect =  ResetFilterAspect(filterDom, resetFilterListAspect);

    let focusInAspect = FocusInAspect(picksDom);
    
    let buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
    
    let producePickAspect = ProducePickAspect(picksList, removePickAspect, buildPickAspect);
    let createPickHandlersAspect = CreatePickHandlersAspect(producePickAspect);
    
    let optionToggleAspect  = OptionToggleAspect(createPickHandlersAspect, addPickAspect);
    let fullMatchAspect = FullMatchAspect(createPickHandlersAspect, addPickAspect);
    let inputAspect = InputAspect(filterDom, filterManagerAspect, fullMatchAspect);    
    let choiceClickAspect = ChoiceClickAspect(optionToggleAspect, filterDom);
    
    let buildChoiceAspect = BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect);
    
    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(buildChoiceAspect);
    let resetLayoutAspect = ResetLayoutAspect(() => resetFilterAspect.resetFilter());

    let optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
    let optionsLoopAspect = OptionsLoopAspect(optionsAspect, optionAttachAspect);
    let updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
    let updateAspect = UpdateAspect(updateDataAspect);

    let loadAspect = LoadAspect(optionsLoopAspect);

    let picksElementAspect = PicksElementAspect(picksDom.picksElement);
    let afterInputAspect = AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect);

    let multiSelectInlineLayoutAspect =  MultiSelectInlineLayoutAspect(
        environment, filterDom, choicesDom, 
        choicesVisibilityAspect, 
        hoveredChoiceAspect, navigateAspect, filterManagerAspect,
        focusInAspect, optionToggleAspect,
        createPickHandlersAspect,
        picksList,
        inputAspect, specialPicksEventsAspect,  buildChoiceAspect, 
        resetLayoutAspect, 
        picksElementAspect,
        afterInputAspect,
        disposeAspect
    );
    
    pluginManager.layout(
        {
            staticDom, picksDom, choicesDom, filterDom, resetLayoutAspect, 
            choicesVisibilityAspect, staticManager, buildChoiceAspect, optionToggleAspect,  choiceClickAspect, 
            buildAndAttachChoiceAspect, optionsLoopAspect, optionAttachAspect,
            buildPickAspect, producePickAspect, createPickHandlersAspect, inputAspect, resetFilterListAspect, resetFilterAspect, 
            specialPicksEventsAspect,
            resetLayoutAspect, focusInAspect, 
            loadAspect, updateDataAspect, updateAspect, 
            fullMatchAspect,
            picksElementAspect, afterInputAspect,
            multiSelectInlineLayoutAspect }
    );
    multiSelectInlineLayoutAspect.init();
    pluginManager.attach();

    let api = {component: "BsMultiSelect.api"} // key to use in memory leak analyzes
    pluginManager.buildApi(api);

    // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?
    api.dispose = composeSync(
        resetLayoutAspect.resetLayout,
        ()=>{disposeAspect.dispose()},
        pluginManager.dispose, 
        ()=>{picksList.forEach(pick=>pick.dispose());},
        wraps.dispose,
        staticManager.dispose,  picksDom.dispose, filterDom.dispose );
    
    api.updateData = () => { 
        updateDataAspect.updateData();
    };
    api.update = () => {
        updateAspect.update()
    }
 
    
    // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

    onInit?.(api, pluginManager.aspects);
    picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
    picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
    staticManager.appendToContainer();
    loadAspect.load();
    return api;
}
