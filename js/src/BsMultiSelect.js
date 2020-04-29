import {MultiSelect} from './MultiSelect'
import {PluginManager} from './PluginManager'

import {getDataGuardedWithPrefix, closestByTagName /*, getIsRtl*/} from './ToolsDom';

import {createCss, extendCss} from './ToolsStyling';
import {extendOverriding, extendIfUndefined, composeSync, def , isBoolean} from './ToolsJs';

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator  as defStaticContentGenerator} from './StaticContentGenerator';
import {css, cssPatch} from './BsCss'

export const defaults = {
    useCssPatch : true,
    containerClass : "dashboardcode-bsmultiselect",
    css: css,
    cssPatch: cssPatch,
    
    label: null,
    placeholder: '',
    staticContentGenerator : null, 
    pickContentGenerator: null, 
    choiceContentGenerator : null, 
    buildConfiguration: null,
    isRtl: null,
    getSelected: null,
    setSelected: null,
    required: null, /* null means look on select[required] or false if jso-source */
    common: null,
    options: null,
    getIsOptionDisabled: null,
    getIsOptionHidden: null,

    getDisabled: null,
    getSize: null,
    getValidity: null,
    
    valueMissingMessage: '',
    getIsValueMissing: null
};


function extendConfigurtion(configuration){
    let cfgCss = configuration.css;
    configuration.css = null;
    let cfgCssPatch = configuration.cssPatch;
    configuration.cssPatch = null;
    extendIfUndefined(configuration, defaults); // copy 1st level of properties

    var defCss = createCss(defaults.css, cfgCss); // replace classes, merge styles
    configuration.css = defCss;

    if (isBoolean(defaults.cssPatch) || isBoolean(cfgCssPatch))
        throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'") // often type of error
    var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // replace classes, merge styles
    configuration.cssPatch = defCssPatch;
}

export function BsMultiSelect(element, environment, settings){
    var {Popper, window, plugins} = environment;
    var trigger = (eventName)=> environment.trigger(element, eventName);
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let configuration = {};
    let init = null;
    
    //let pluginManager = PluginManager(configuration, defaults);
    if (settings instanceof Function){
        extendConfigurtion(configuration);
        init = settings(element, configuration);
    }
    else
    { 
        if (settings){
            adjustLegacySettings(settings);            
            extendOverriding(configuration, settings); // settings used per jQuery intialization, configuration per element
        }

        extendConfigurtion(configuration);
    }
    
    if (configuration.buildConfiguration)
        init = configuration.buildConfiguration(element, configuration);
    
    let { css, cssPatch, useCssPatch,
          containerClass, 
          getSelected, setSelected, placeholder, 
          common,
          options, getDisabled,
          getIsOptionDisabled
        } = configuration;

    // TODO move to plugin
    if (useCssPatch){
        extendCss(css, cssPatch); 
    }
    
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
    
    if (init && init instanceof Function)
        init(multiSelect);
   
    multiSelect.init();
    multiSelect.load();

    // support browser's "step backward" on form restore
    if (staticContent.selectElement && window.document.readyState !="complete"){
        window.setTimeout( function(){multiSelect.UpdateOptionsSelected()});
    }

    return multiSelect;
}