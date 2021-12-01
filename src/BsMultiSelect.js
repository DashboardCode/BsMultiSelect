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
 
import {TriggerAspect, OnChangeAspect} from './OnChangeAspect';
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

//import {PickButtonAspect} from './PickButtonAspect'

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

import {ShowErrorAspect} from './ShowErrorAspect'

/// environment - common for many; configuration for concreate
export function BsMultiSelect(element, environment, pluginManager, configuration){
    let { css, 
          options, 
          getText,
          containerClass
        } = configuration;
    
    let initialDom = {initialElement: element};
    let createElementAspect = CreateElementAspect(
        name => environment.window.document.createElement(name), 
        (element, html) => element.innerHTML = html ,
        (element, html) => {
            var newElement = new environment.window.DOMParser().parseFromString(html, 'text/html').body.children[0]; 
            element.parentNode.insertBefore(newElement, element.nextSibling);
        });
        
    let showErrorAspect = ShowErrorAspect(initialDom, createElementAspect);
    try{
        
        let picksDomFactory   = PicksDomFactory  (css, createElementAspect);
        let filterDomFactory  = FilterDomFactory (css, createElementAspect);
        let choicesDomFactory = ChoicesDomFactory(css, createElementAspect);

        let staticDomFactory  = StaticDomFactory(
            createElementAspect, 
            choicesDomFactory, 
            filterDomFactory, 
            picksDomFactory, 
            initialDom, 
            containerClass
        );

        let eventHandlers =  pluginManager.createHandlers();
        
        let disposeAspect = {dispose(){}};
        let triggerAspect = TriggerAspect(element, environment.trigger);
        let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
        
        let optionsAspect = OptionsAspect(options); 

        eventHandlers.dom({
            configuration, 
            initialDom, createElementAspect, showErrorAspect,
            
            onChangeAspect, triggerAspect, 
            optionsAspect, disposeAspect, 
            staticDomFactory, choicesDomFactory, filterDomFactory, picksDomFactory});

        let {staticManager, staticDom, filterDom, picksDom, choicesDom} = staticDomFactory.createStaticDom(); // overrided in SelectElementPlugin

        let optionPropertiesAspect = OptionPropertiesAspect(getText);

        let pickDomFactory    = PickDomFactory   (css, createElementAspect, optionPropertiesAspect); // overrided in CustomPickStylingsPlugin, DisableComponentPlugin
        let choiceDomFactory  = ChoiceDomFactory (css, createElementAspect, optionPropertiesAspect); // overrided in CustomChoicesStylingsPlugin, HighlightPlugin

        // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
        let isChoiceSelectableAspect = IsChoiceSelectableAspect();
        let createWrapAspect       = CreateWrapAspect();
        let createChoiceBaseAspect = CreateChoiceBaseAspect(optionPropertiesAspect);
        
        let addPickAspect = AddPickAspect();
        let removePickAspect = RemovePickAspect();

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
            () =>countableChoicesList.reset(), 
            (w)=>countableChoicesList.remove(w),
            (w, key)=>countableChoicesListInsertAspect.countableChoicesListInsert(w, key));

        // TODO: union to events or create event bus
        eventHandlers.plugStaticDom({
            environment, 
            pickDomFactory, choiceDomFactory, 
            countableChoicesList, countableChoicesListInsertAspect, optionPropertiesAspect, 
            wrapsCollection, choicesEnumerableAspect, filteredChoicesList, 
            filterPredicateAspect, isChoiceSelectableAspect,  
            hoveredChoiceAspect, navigateAspect, 
            filterManagerAspect,
            createWrapAspect, createChoiceBaseAspect, 
            picksList, wraps, addPickAspect, removePickAspect,

            
        }); // apply selectElement support;  

        // TODO: to staticManager
        //let {staticManager, staticDom, filterDom, picksDom, choicesDom} = staticDomFactory.createStaticDom(); // overrided in SelectElementPlugin

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
        let resetLayoutAspect = ResetLayoutAspect(resetFilterAspect);

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
            disposeAspect,
            pickDomFactory
        );
        
        eventHandlers.layout({
            staticDom, picksDom, choicesDom, filterDom, resetLayoutAspect, 
            choicesVisibilityAspect, staticManager, buildChoiceAspect, optionToggleAspect,  choiceClickAspect, 
            buildAndAttachChoiceAspect, optionsLoopAspect, optionAttachAspect,
            buildPickAspect, producePickAspect, createPickHandlersAspect, inputAspect, resetFilterListAspect, resetFilterAspect, 
            specialPicksEventsAspect,
            resetLayoutAspect, focusInAspect, 
            loadAspect, updateDataAspect, updateAspect, 
            fullMatchAspect,
            picksElementAspect, afterInputAspect,
            multiSelectInlineLayoutAspect 
        });
        multiSelectInlineLayoutAspect.layout(); // TODO: to staticManager

        eventHandlers.append();

        let api = {component: "BsMultiSelect.api"} // key to use in memory leak analyzes
        eventHandlers.buildApi(api);

        api.updateData = () => { 
            updateDataAspect.updateData();
        };
        api.update = () => {
            updateAspect.update()
        }
        // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

        api.dispose = composeSync(
            resetLayoutAspect.resetLayout,
            ()=>{disposeAspect.dispose()},
            eventHandlers.dispose, 
            ()=>{picksList.forEach(pick=>pick.dispose());},
            wraps.dispose,
            staticManager.dispose);
        
        // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?        
        staticManager.appendToContainer();

        loadAspect.load();
        return api;
    } catch(error) {
        showErrorAspect.showError(error);
        throw error;
    }
}
