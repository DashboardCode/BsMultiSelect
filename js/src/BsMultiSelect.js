import {MultiSelect} from './MultiSelect'

import {LabelPlugin} from './LabelPlugin';
import {FormResetPlugin} from './FormResetPlugin';
import {ValidationApiPlugin} from './ValidationApiPlugin';
import {BsAppearancePlugin} from './BsAppearancePlugin';

import {getDataGuardedWithPrefix, closestByTagName, getIsRtl} from './ToolsDom';

import {createCss, extendCss} from './ToolsStyling';
import {extendOverriding, extendIfUndefined, composeSync, def, defCall, isBoolean} from './ToolsJs';

import {adjustLegacyConfiguration as adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator  as defStaticContentGenerator} from './StaticContentGenerator';
import {css, cssPatch} from './BsCss'

import {HiddenPlugin} from './HiddenPlugin'
import {PluginManager} from './PluginManager'

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

function extendConfigurtion(configuration, defaults){
    let cfgCss = configuration.css;
    let cfgCssPatch = configuration.cssPatch;
    configuration.css = null;
    configuration.cssPatch = null;
    extendIfUndefined(configuration, defaults); 
    var defCss = createCss(defaults.css, cfgCss); // replace classes, merge styles
    if (defaults.cssPatch instanceof Boolean || typeof defaults.cssPatch ==="boolean" 
        || cfgCssPatch instanceof Boolean || typeof cfgCssPatch==="boolean" 
    )
    throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'") // often type of error
    var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // replace classes, merge styles
    configuration.css = defCss;
    configuration.cssPatch = defCssPatch;
}

export function BsMultiSelect(element, environment, settings){
    var {Popper, window} = environment;
    var trigger = (eventName)=> environment.trigger(element, eventName);
    if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
    }

    let configuration = {};
    let init = null;
    if (settings instanceof Function){
        extendConfigurtion(configuration, defaults);
        init = settings(element, configuration);
    }
    else
    { 
        if (settings){
            adjustLegacySettings(settings);            
            extendOverriding(configuration, settings); // settings used per jQuery intialization, configuration per element
        }
        extendConfigurtion(configuration, defaults);
    }
    
    if (configuration.buildConfiguration)
        init = configuration.buildConfiguration(element, configuration);
    
    let {
            css, cssPatch, useCssPatch,
            containerClass, label, isRtl, 
            getSelected, setSelected, placeholder, 
            common,
            options, getDisabled,
            getIsOptionDisabled
        } = configuration;

    if (useCssPatch){
        extendCss(css, cssPatch); 
    }
    
    let staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    let forceRtlOnContainer = false; 
    if (isBoolean(isRtl))
        forceRtlOnContainer = true;
    else
        isRtl = getIsRtl(element);

    let labelElement = defCall(label);

    let staticContent = staticContentGenerator(
        element, labelElement, name=>window.document.createElement(name), containerClass, forceRtlOnContainer, css
    );
    

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
            getIsOptionDisabled = (option)=>(option.disabled===undefined)?false:option.disabled;
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

        getOptions = ()=>selectElement.options; //.getElementsByTagName('OPTION'), 
        onChange = () => {
            trigger('change')
            trigger('dashboardcode.multiselect:change')
        }

        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option)=>option.disabled;
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
    if (!common){
        common = {getDisabled}
    }

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
        isRtl,
        onChange,
        css,
        Popper,
        window);

    // ------------------------------------
    let plugins = [LabelPlugin, HiddenPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin];
    let pluginData = {configuration, options, common, staticContent, element, css, useCssPatch, window}

    let pluginManager = PluginManager(plugins, pluginData);
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