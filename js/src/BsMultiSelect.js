import {MultiSelect} from './MultiSelect'
import {PluginManager} from './PluginManager'

import {composeSync, def} from './ToolsJs';

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';


import {StaticDomFactory} from './StaticDomFactory';

import {StaticPicks} from './StaticPicks';
import {StaticDialog} from './StaticDialog';
import {StaticContent} from './StaticContent';

import {ComponentAspect} from './ComponentAspect';
import {DataSourceAspect} from './DataSourceAspect';

import {selectElementStaticDomGenerator, selectElementCompletedDomGenerator} from './plugins/SelectElementPlugin';

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
    // --- --- --- --- ---         
          
    let staticContentGenerator = def(configuration.staticContentGenerator, StaticContent);
    let createElement =  name=>window.document.createElement(name);
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
    
    let staticDomFactory = StaticDomFactory();
    // --- --- --- --- --- 
    let origStaticDomGenerator = staticDomFactory.staticDomGenerator;
    staticDomFactory.staticDomGenerator = (e,c) => selectElementStaticDomGenerator(origStaticDomGenerator, e, c);
    
    let staticDom = staticDomFactory.staticDomGenerator( element, containerClass)

    let appendToContainer = (choicesElement) => staticDom.containerElement.appendChild(choicesElement);
    let ownContainerElement = staticDom.containerElement?false:true;

    var {attachPicksElement, detachPicksElement} = staticDomFactory.completedDomGenerator(staticDom, createElement);
    
    let selectElementContainerTools = selectElementCompletedDomGenerator(staticDom, containerClass, createElement);

    if (!ownContainerElement && staticDom.selectElement){
        appendToContainer = (choicesElement) => 
            staticDom.selectElement.parentNode.insertBefore(choicesElement, staticDom.selectElement.nextSibling);
    }
    // --- --- --- --- --- --- --- 
    var staticPicks = StaticPicks(staticDom.picksElement,  createElement, css);
    if (detachPicksElement){
        staticPicks.dispose = detachPicksElement;
    }

    var staticDialog = StaticDialog(createElement, css);
    
    var staticManager = {
        appendToContainer(){
            appendToContainer(staticDialog.choicesElement);
            // add for SE && !ownContainerElement
            attachPicksElement?.();
        },
        dispose(){
            staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
            staticPicks.dispose(); // already overrided for SE
        },
    };

    let staticContent = staticContentGenerator(staticDom, staticPicks, staticDialog, Popper);
    
    staticContent.selectElementContainerTools=selectElementContainerTools;
    // ---------------------------------------------------------------------------------------
          
    let pluginData = {window, containerClass, configuration, staticDom, staticContent, staticPicks, staticDialog, staticManager, trigger, common,
        dataSourceAspect,componentAspect
    } // TODO replace common with staticContent (but staticContent should be splitted)
    let pluginManager = PluginManager(plugins, pluginData);

    var multiSelect = new MultiSelect(
        dataSourceAspect,
        componentAspect,
        staticContent,
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

// export function StaticContentFactory(staticDom, staticPicks, staticDialog, Popper) { 
//     let staticDomFactory = StaticDomFactory();
//     // --- --- --- --- --- 
//     staticDomFactory.staticDomGenerator = (e,c) => selectElementStaticDomGenerator(staticDomFactory.staticDomGenerator, e, c);
    
//     let staticDom = staticDomFactory.staticDomGenerator( element, containerClass)

//     let appendToContainer = (choicesElement) => staticDom.containerElement.appendChild(choicesElement);
//     let ownContainerElement = staticDom.containerElement?false:true;

//     var {attachPicksElement, detachPicksElement} = staticDomFactory.completedDomGenerator(staticDom, createElement);
    
//     let selectElementContainerTools = selectElementCompletedDomGenerator(staticDom, containerClass, createElement);

//     if (!ownContainerElement && staticDom.selectElement){
//         appendToContainer = (choicesElement) => 
//             staticDom.selectElement.parentNode.insertBefore(choicesElement, staticDom.selectElement.nextSibling);
//     }
//     // --- --- --- --- --- --- --- 
//     var staticPicks = StaticPicks(staticDom.picksElement,  createElement, css);
//     if (detachPicksElement){
//         staticPicks.dispose = detachPicksElement;
//     }

//     var staticDialog = StaticDialog(createElement, css);
    
//     var staticManager = {
//         appendToContainer(){
//             appendToContainer(staticDialog.choicesElement);
//             // add for SE && !ownContainerElement
//             attachPicksElement?.();
//         },
//         dispose(){
//             staticDialog.choicesElement.parentNode.removeChild(staticDialog.choicesElement);
//             staticPicks.dispose(); // already overrided for SE
//         },
//     };

   
//     return {
//         staticDomFactory,
//         createStaticManager(){
//             let staticContent = staticContentGenerator(staticDom, staticPicks, staticDialog, Popper);
//             //staticContent.selectElementContainerTools = selectElementContainerTools;
//             return {
//                 staticContent,
//                 staticManager
//             }
//         }
        
//     }
// }