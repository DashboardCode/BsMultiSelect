import {MultiSelect} from './MultiSelect'
import {PluginManager, staticDomDefaults} from './PluginManager'

import {composeSync, def} from './ToolsJs';

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';

import {StaticDomFactory} from './StaticDomFactory';

import {PicksDom} from './PicksDom';
import {ChoicesDom} from './ChoicesDom';
import {PopupAspect as DefaultPopupAspect} from './PopupAspect';

import {ComponentAspect} from './ComponentAspect';
import {DataSourceAspect} from './DataSourceAspect';

import {DoublyLinkedCollection} from './ToolsJs'

import {FilterListAspect, ChoicesGetNextAspect, ChoicesEnumerableAspect } from './FilterListAspect'
import {ChoicesElementAspect, ChoiceFactoryAspect, ChoicesAspect } from './ChoicesAspect'


import {OptionToggleAspect, OptionAspect} from './OptionAspect.js'
import {Choices} from './Choices'
import {ChoicesHover} from './ChoicesHover'
import {Picks} from './Picks'

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

    let dataSourceAspect = DataSourceAspect(options, getSelected, setSelected, getIsOptionDisabled); 
    let componentAspect  = ComponentAspect(getDisabled, trigger);
    common.getDisabled = componentAspect.getDisabled;
          
    let PopupAspect = def(configuration.staticContentGenerator, DefaultPopupAspect); // TODO: rename configuration.staticContentGenerator
    let createElement =  name=>window.document.createElement(name);
    
    let choicesDom = ChoicesDom(createElement, css);
    let staticDomFactory = StaticDomFactory(createElement, choicesDom.choicesElement);
    staticDomDefaults(plugins, staticDomFactory); // manipulates with staticDomFactory.staticDomGenerator
   
    let {staticDom, staticManager} = staticDomFactory.staticDomGenerator(element, containerClass)
    // TODO get picksDom  from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElement, css);
    let popupAspect = PopupAspect(choicesDom.choicesElement, picksDom.filterInputElement, Popper);

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

    // TODO move to fully index collection
    let choices = Choices(
        collection,
        ()=>filterListAspect.filterListFacade_reset(), 
        (c)=>filterListAspect.filterListFacade_remove(c),
        (c)=>filterListAspect.addFilterFacade(c), 
        (c)=>filterListAspect.insertFilterFacade(c));
    
    let choicesHover = ChoicesHover((down, hoveredChoice)=>filterListAspect.navigate(down, hoveredChoice));

    let picks = Picks();

    let optionAspect = OptionAspect(dataSourceAspect)
    let optionToggleAspect = OptionToggleAspect(optionAspect)

    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    let choicesElementAspect = ChoicesElementAspect( choicesDom, (choiceElement, toggle) => choiceContentGenerator(choiceElement, common, css, toggle), componentAspect, optionToggleAspect)
    let choiceFactoryAspect =  ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
    let choicesAspect = ChoicesAspect(window.document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect);

    let pluginData = {environment, trigger, configuration, dataSourceAspect, componentAspect, 
        staticDom, picksDom, choicesDom, popupAspect, staticManager, 
        choicesGetNextAspect, choicesEnumerableAspect, filterListAspect, choices, choicesHover, picks,
        optionAspect, optionToggleAspect,
        choicesElementAspect, choiceFactoryAspect, choicesAspect,
        common
    } 
    
    
    
    // TODO: replace common with something new? 
    let pluginManager = PluginManager(plugins, pluginData);

    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
 

    var multiSelect = new MultiSelect(
        dataSourceAspect,
        componentAspect,
        picksDom,
        choicesDom,
        staticManager,
        popupAspect,        
        (pickElement) => pickContentGenerator(pickElement, common, css),
        //choicesGetNextAspect,
        filterListAspect,
        choices, 
        choicesHover,
        picks,
        optionAspect,
        optionToggleAspect,
        //choicesElementAspect, choiceFactoryAspect, 
        choicesAspect,
        window
    );

    pluginManager.afterConstructor(multiSelect);

    multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect), staticManager.dispose, popupAspect.dispose, picksDom.dispose );
    
    onInit?.(multiSelect);
   
    multiSelect.init();
    multiSelect.load();
    return multiSelect;
}