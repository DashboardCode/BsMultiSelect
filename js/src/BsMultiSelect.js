import {MultiSelect} from './MultiSelect'
import {PluginManager} from './PluginManager'

import {closestByTagName} from './ToolsDom';

import {composeSync, def} from './ToolsJs';

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator  as defStaticContentGenerator} from './StaticContentGenerator';

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
    
    let staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
    
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    let staticContent = staticContentGenerator(element, name=>window.document.createElement(name), containerClass, css, Popper);

    if (!common) 
        common = {}
    
    let pluginData = {window, configuration, staticContent, common} // TODO replace common with staticContent (but staticContent should be splitted)
    let pluginManager = PluginManager(plugins, pluginData);

    let onChange;
    let getOptions;
    
    if (options){
        if (!getDisabled)
            getDisabled = () => false;
        getOptions = () => options;
        onChange = () => {
            trigger('dashboardcode.multiselect:change')
        }
        
        if (!getIsOptionDisabled)
            getIsOptionDisabled = option => (option.disabled===undefined) ? false : option.disabled;
    } 
    else  
    {
        let selectElement = staticContent.selectElement;
        if(!getDisabled){
            var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
            if (fieldsetElement) {
                getDisabled = () => selectElement.disabled || fieldsetElement.disabled;
            } else {
                getDisabled = () => selectElement.disabled;
            }
        } 

        getOptions = () => selectElement.options; 
        onChange = () => {
            trigger('change')
            trigger('dashboardcode.multiselect:change')
        }

        if (!getIsOptionDisabled)
            getIsOptionDisabled = option => option.disabled;
    }

    if (!getSelected){
        getSelected = (option) => option.selected;
    }
    if (!setSelected){
        setSelected = (option, value) => {option.selected = value};
        // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
        // if (value) option.setAttribute('selected','');
        // else option.removeAttribute('selected');
    }

    common.getDisabled = getDisabled;

    var multiSelect = new MultiSelect(
        getOptions,
        getDisabled,
        setSelected,
        getSelected,
        getIsOptionDisabled,
        staticContent,
        (pickElement) => pickContentGenerator(pickElement, common, css),
        (choiceElement, toggle) => choiceContentGenerator(choiceElement, common, css, toggle),
        onChange,
        window);

    pluginManager.afterConstructor(multiSelect);

    multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect));
    
    onInit?.(multiSelect);
   
    multiSelect.init();
    multiSelect.load();
    return multiSelect;
}