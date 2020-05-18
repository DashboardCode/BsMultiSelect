import {MultiSelect} from './MultiSelect'
import {PluginManager, staticDomDefaults} from './PluginManager'

import {composeSync, def} from './ToolsJs';

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';

import {StaticDomFactory} from './StaticDomFactory';

import {StaticPicks} from './StaticPicks';
import {StaticDialog} from './StaticDialog';
import {StaticContent} from './StaticContent';

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
          
    let staticContentGenerator = def(configuration.staticContentGenerator, StaticContent);
    let createElement =  name=>window.document.createElement(name);
    
    let staticDomFactory = StaticDomFactory(createElement);
    staticDomDefaults(plugins, staticDomFactory);
   
    let staticDom = staticDomFactory.staticDomGenerator(element, containerClass)
    // TODO get staticPicks and staticDialog from staticDomFactory
    var staticPicks  = StaticPicks(staticDom.picksElement, createElement, css);
    var staticDialog = StaticDialog(createElement, css);
    
    var staticManager = {
        appendToContainer(){
            staticDom.appendChoicesToContainer(staticDialog.choicesElement);
            // add for SE && !ownContainerElement
            staticDom.attachPicksElement?.();
        },
        dispose(){
            staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
            if (staticDom.detachPicksElement)
                staticDom.detachPicksElement() // some kind of optimization with abstraction leak
            else
                staticPicks.dispose(); // already overrided for SE
        },
    };

    let staticContent = staticContentGenerator(staticPicks.filterInputElement, staticDialog.choicesElement, Popper);
    
    let pluginData = {environment, configuration, dataSourceAspect, componentAspect, 
        staticDom, staticPicks, staticDialog, staticContent, staticManager, common
    } // TODO replace common with staticContent (but staticContent should be splitted)
    let pluginManager = PluginManager(plugins, pluginData);

    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    var multiSelect = new MultiSelect(
        dataSourceAspect,
        componentAspect,
        staticContent,
        staticPicks,
        staticDialog,
        staticManager,
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