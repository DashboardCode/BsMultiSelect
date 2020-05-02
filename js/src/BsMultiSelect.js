import {MultiSelect} from './MultiSelect'
import {PluginManager} from './PluginManager'

import {getDataGuardedWithPrefix, closestByTagName /*, getIsRtl*/} from './ToolsDom';

import {extendCss} from './ToolsStyling';
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

    let { containerClass, 
          css, 
          getSelected, setSelected, placeholder, 
          common,
          options, getDisabled,
          getIsOptionDisabled
        } = configuration;
    
    let staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    let staticContent = staticContentGenerator(
        element, name=>window.document.createElement(name), containerClass, css
    );

    if (!common){ 
        common = {}
    }
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

    if (!placeholder){
        placeholder = getDataGuardedWithPrefix(element,"bsmultiselect","placeholder");
    }
    if (!getSelected){
        getSelected = (option) => option.selected;
    }
    if (!setSelected){
        setSelected = (option, value) => {option.selected = value};
        // NOTE: adding this break Chrome's form reset functionality
        // if (value) option.setAttribute('selected','');
        // else  option.removeAttribute('selected');
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
        placeholder,
        onChange,
        css,
        Popper,
        window);

    pluginManager.afterConstructor(multiSelect);

    multiSelect.Dispose = composeSync(pluginManager.dispose, multiSelect.Dispose.bind(multiSelect));
    
    onInit?.(multiSelect);
   
    multiSelect.init();
    multiSelect.load();

    // support browser's "step backward" on form restore
    if (staticContent.selectElement && window.document.readyState !="complete"){
        window.setTimeout(function(){multiSelect.UpdateOptionsSelected()});
    }

    return multiSelect;
}