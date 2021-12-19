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
 
import {OnChangeAspect} from './OnChangeAspect';
//import {OptionsAspect} from './OptionsAspect';

import {ChoicesEnumerableAspect } from './ChoicesEnumerableAspect'
import {FilterManagerAspect, NavigateManager, FilterPredicateAspect} from './FilterManagerAspect'
import {BuildAndAttachChoiceAspect, ProduceChoiceAspect} from './ProduceChoiceAspect'
import {OptionsLoopAspect, OptionAttachAspect} from './OptionsLoopAspect'

import {UpdateDataAspect } from './UpdateDataAspect'
import {UpdateAspect } from './UpdateDataAspect'
import {CreateWrapAspect, CreateChoiceBaseAspect} from './CreateWrapAspect'

import {ProducePickAspect} from './ProducePickAspect'
import {NavigateAspect, HoveredChoiceAspect} from './NavigateAspect'
import {Wraps} from './Wraps'

import {AppendAspect} from './AppendAspect'


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
export function BsMultiSelect(initialElement, environment, pluginManager, configuration ){
    let { css, getText, containerClass, options} = configuration;
    let { trigger } = environment;

    let createElementAspect = CreateElementAspect(
        name => environment.window.document.createElement(name), 
        (element, html) => element.innerHTML = html ,
        (element, html) => {
            var newElement = new environment.window.DOMParser().parseFromString(html, 'text/html').body.children[0]; 
            element.parentNode.insertBefore(newElement, element.nextSibling);
        });
    let dataWrap = {};
    let staticDom = {initialElement, css, createElementAspect, containerClass};    

    let staticDomFactory  = StaticDomFactory(staticDom);
    let picksDomFactory   = PicksDomFactory(staticDom);
    let filterDomFactory  = FilterDomFactory(staticDom);
    let choicesDomFactory = ChoicesDomFactory(staticDom);

    dataWrap.getText = getText??(option => option.text);
    dataWrap.getOptions = ()=> options;

    staticDom.trigger = (eventName) => trigger(initialElement, eventName)

    let pickDomFactory    = PickDomFactory   (css, staticDom.createElementAspect, dataWrap); // overrided in CustomPickStylingsPlugin, DisableComponentPlugin
    let choiceDomFactory  = ChoiceDomFactory (css, staticDom.createElementAspect, dataWrap); // overrided in CustomChoicesStylingsPlugin, HighlightPlugin
    
    staticDom.environment=environment;
    staticDom.showErrorAspect=ShowErrorAspect(staticDom);
    try{
        let eventHandlers =  pluginManager.createHandlers();
        return BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers);
    } catch(error) {
        staticDom.showErrorAspect.showError(error);
        throw error;
    }
}

export function BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers){
    let onChangeAspect = OnChangeAspect(staticDom, 'dashboardcode.multiselect:change');
    let disposeAspect = {dispose(){}};

    eventHandlers.dom({
        showErrorAspect: staticDom.showErrorAspect,
        environment: staticDom.environment, 
        onChangeAspect,  
        disposeAspect, 
        staticDomFactory, choicesDomFactory, filterDomFactory, picksDomFactory,
        staticDom,
        dataWrap
    });
    
    // --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    let {staticManager} = staticDomFactory.createStaticDom(); 
    let choicesDom = choicesDomFactory.create();
    let picksDom   = picksDomFactory.create();
    let filterDom  = filterDomFactory.create();

    staticDom.choicesDom=choicesDom;
    staticDom.picksDom=picksDom;
    staticDom.filterDom=filterDom;
    // --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    
    let producePickAspect = ProducePickAspect(picksDom, pickDomFactory);    
    let picksList = List(); 

    let produceChoiceAspect = ProduceChoiceAspect(choicesDom, choiceDomFactory);
    
    let wrapsCollection = ArrayFacade();

    let countableChoicesList = DoublyLinkedList(
        (wrap)=>wrap.choice.itemPrev, 
        (warp, v)=>warp.choice.itemPrev=v, 
        (wrap)=>wrap.choice.itemNext, 
        (wrap, v)=>wrap.choice.itemNext=v
    );
    
    let countableChoicesListInsertAspect = CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList);

    let wraps = Wraps(
        wrapsCollection,
        () =>countableChoicesList.reset(), 
        (w)=>countableChoicesList.remove(w),
        (w, key)=>countableChoicesListInsertAspect.countableChoicesListInsert(w, key)); // !!!!!!!!!!!
    
    //let createChoiceHandlersAspect = CreateChoiceHandlersAspect(produceChoiceAspect, wraps);

    let createWrapAspect       = CreateWrapAspect();
    let createChoiceBaseAspect = CreateChoiceBaseAspect(dataWrap);
    //let addPickAspect = AddPickAspect();

    //--------------------------

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

    // TODO: union to events or create event bus
    eventHandlers.plugStaticDom({
        pickDomFactory, choiceDomFactory, 
        countableChoicesList, countableChoicesListInsertAspect, 
        wrapsCollection, choicesEnumerableAspect, filteredChoicesList, 
        filterPredicateAspect, 
        hoveredChoiceAspect, navigateAspect, 
        filterManagerAspect,
        createWrapAspect, createChoiceBaseAspect, 
        picksList, wraps, //addPickAspect,

        producePickAspect, produceChoiceAspect
    }); // apply selectElement support;  

    // TODO: to staticManager
    //let {staticManager, staticDom, filterDom, picksDom, choicesDom} = staticDomFactory.createStaticDom(); // overrided in SelectElementPlugin

    // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   

    let specialPicksEventsAspect = SpecialPicksEventsAspect();

    
    let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
    let resetFilterAspect =  ResetFilterAspect(filterDom, resetFilterListAspect);

    let focusInAspect = FocusInAspect(picksDom);

    let inputAspect = InputAspect(filterDom, filterManagerAspect /*, fullMatchAspect*/);    

    
    let buildAndAttachChoiceAspect =  BuildAndAttachChoiceAspect(produceChoiceAspect);
    let resetLayoutAspect = ResetLayoutAspect(resetFilterAspect); //!!!!!!!!!
    //createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps
    let optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
    let optionsLoopAspect = OptionsLoopAspect(dataWrap, optionAttachAspect);

    let updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
    let loadAspect = LoadAspect(optionsLoopAspect); // !!!!!!!!!!!
    let updateAspect = UpdateAspect(updateDataAspect);

    let picksElementAspect = PicksElementAspect(picksDom.picksElement);
    let choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
    let afterInputAspect = AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect);

    let multiSelectInlineLayoutAspect =  MultiSelectInlineLayoutAspect(
        staticDom.environment, 
        filterDom, 
        choicesDom, 
        choicesVisibilityAspect, 
        hoveredChoiceAspect, 
        navigateAspect, 
        filterManagerAspect,
        focusInAspect,
        picksList,
        inputAspect, 
        specialPicksEventsAspect,  
        produceChoiceAspect, 
        resetLayoutAspect, 
        picksElementAspect,
        afterInputAspect,
        disposeAspect,
        pickDomFactory
    );
    
    eventHandlers.layout({
        picksDom, choicesDom, filterDom, resetLayoutAspect, 
        choicesVisibilityAspect, staticManager, 
        buildAndAttachChoiceAspect, optionsLoopAspect, optionAttachAspect,
        inputAspect, resetFilterListAspect, resetFilterAspect, 
        specialPicksEventsAspect,
        resetLayoutAspect, focusInAspect, 
        loadAspect, updateDataAspect, updateAspect, 
        picksElementAspect, afterInputAspect
    });
    multiSelectInlineLayoutAspect.layout(); // TODO: to staticManager

    eventHandlers.append();

    let api = {
        component: "BsMultiSelect.api",// key to use in memory leak analyzes
        updateData: () => { 
            updateDataAspect.updateData();
        },
        update: () => {
            updateAspect.update()
        }
    } 
    eventHandlers.buildApi(api);

    // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

    api.dispose = composeSync(
        resetLayoutAspect.resetLayout,
        ()=>{disposeAspect.dispose()},
        eventHandlers.dispose, 
        ()=>{picksList.forEach(pick=>pick.dispose());},
        wraps.dispose,
        staticManager.dispose,
        ()=>{
            staticDom.choicesDom=null;
            staticDom.picksDom=null;
            staticDom.filterDom=null;
        });
    
    // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?        
    staticManager.appendToContainer();

    loadAspect.load();
    return api;
}