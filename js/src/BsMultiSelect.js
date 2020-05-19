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

export function BsMultiSelect(element, environment, configuration, onInit){
    var {Popper, window, plugins} = environment;
    var trigger = (eventName)=> environment.trigger(element, eventName);
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let { containerClass, css, 
          options, getDisabled,  
          getSelected, setSelected, 
          getIsOptionDisabled,
          common } = configuration;
    
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
    // TODO get picksDom and choicesDom from staticDomFactory
    let picksDom  = PicksDom(staticDom.picksElement, createElement, css);
    let popupAspect = PopupAspect(choicesDom.choicesElement, picksDom.filterInputElement, Popper);

    if (!staticDom.ownPicksElement) { // some kind of optimization with abstraction leak: if we remove - everithing is disposed
        staticManager.dispose = composeSync(
            staticManager.dispose, 
            picksDom.dispose 
        );
    }
    
    let pluginData = {environment, trigger, configuration, dataSourceAspect, componentAspect, 
        staticDom, picksDom, choicesDom, popupAspect, staticManager, common
    } // TODO: replace common with something new? 
    let pluginManager = PluginManager(plugins, pluginData);

    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    var multiSelect = new MultiSelect(
        dataSourceAspect,
        componentAspect,
        picksDom,
        choicesDom,
        staticManager,
        popupAspect,        
        (pickElement) => pickContentGenerator(pickElement, common, css),
        (choiceElement, toggle) => choiceContentGenerator(choiceElement, common, css, toggle),
        window
    );

    pluginManager.afterConstructor(multiSelect);

    multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect));
    
    onInit?.(multiSelect);
   
    multiSelect.init();
    multiSelect.load();
    return multiSelect;
}