import {MultiSelect} from './MultiSelect'
import {LabelAdapter} from './LabelAdapter';

import {bsAppearance, getLabelElement,  composeGetValidity, composeGetDisabled, composeGetSize} from './BsAppearance';
import {ValidityApi} from './ValidityApi'

import {getDataGuardedWithPrefix, EventBinder, closestByTagName, getIsRtl} from './ToolsDom';

import {createCss, extendCss} from './ToolsStyling';
import {extendOverriding, extendIfUndefined, composeSync, ObservableValue, ObservableLambda, def, defCall, isBoolean} from './ToolsJs';

import {adjustLegacyConfiguration as adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {pickContentGenerator as defPickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator as defChoiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator  as defStaticContentGenerator} from './StaticContentGenerator';
import {css, cssPatch} from './BsCss'

const defValueMissingMessage = 'Please select an item in the list'

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
        containerClass, label, isRtl, required,
        getIsValueMissing, setSelected, placeholder, 
        common,
        options, getDisabled, getValidity, getSize,
        getIsOptionDisabled,  getIsOptionHidden
        } = configuration;

    if (useCssPatch){
        extendCss(css, cssPatch); 
    }
    
    let staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
    let pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
    let choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);

    let valueMissingMessage = defCall(configuration.valueMissingMessage,
        ()=> getDataGuardedWithPrefix(element,"bsmultiselect","value-missing-message"),
        defValueMissingMessage)

    let forceRtlOnContainer = false; 
    if (isBoolean(isRtl))
        forceRtlOnContainer = true;
    else
        isRtl = getIsRtl(element);

    let staticContent = staticContentGenerator(
        element, name=>window.document.createElement(name), containerClass, forceRtlOnContainer, css
    );
    
    required = def(required, staticContent.required);

    let lazyDefinedEvent;

    let onChange;
    let getOptions;
    
    if (options){
        if (!getValidity)
            getValidity = () => null
        if (!getDisabled)
            getDisabled = () => false;
        if (!getSize)
            getSize = () => null;
        getOptions = () => options,
        onChange = () => {
            lazyDefinedEvent()
            trigger('dashboardcode.multiselect:change')
        }
        
        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option)=>(option.disabled===undefined)?false:option.disabled;
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>(option.hidden===undefined)?false:option.hidden;     
    } 
    else  
    {
        let selectElement = staticContent.selectElement;
        if(!getValidity)
            getValidity = composeGetValidity(selectElement);
    
        if(!getDisabled) 
            getDisabled = composeGetDisabled(selectElement);

        if(!getSize) 
            getSize = composeGetSize(selectElement);

        getOptions = ()=>selectElement.options, //.getElementsByTagName('OPTION'), 
        onChange = () => {
            lazyDefinedEvent()
            trigger('change')
            trigger('dashboardcode.multiselect:change')
        }

        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option)=>option.disabled;
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>option.hidden;     
    }


    if (!getIsValueMissing){
        getIsValueMissing = () => {
            let count = 0;
            let optionsArray = getOptions();
            for (var i=0; i < optionsArray.length; i++) {
                if (optionsArray[i].selected) 
                    count++;
            }
            return count===0;
        }
    }
    var isValueMissingObservable = ObservableLambda(()=>required && getIsValueMissing());
    var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue())
    lazyDefinedEvent = () => isValueMissingObservable.call();

    let labelElement = defCall(label);
    if (!labelElement) 
        labelElement=getLabelElement(staticContent.selectElement); 
    let labelAdapter = LabelAdapter(labelElement, staticContent.createInputId);

    if (!placeholder)
    {
        placeholder = getDataGuardedWithPrefix(element,"bsmultiselect","placeholder");
    }



    if (!setSelected){
        setSelected = (option, value) => {option.selected = value};
        // NOTE: adding this break Chrome's form reset functionality
        // if (value) option.setAttribute('selected','');
        // else  option.removeAttribute('selected');
        
    }
    var validationApi = ValidityApi(
        staticContent.filterInputElement, 
        isValueMissingObservable, 
        valueMissingMessage,
        (isValid)=>validationApiObservable.setValue(isValid));

    
    if (!common){
        common = {
            getDisabled,
            getValidity,
            getSize,
        }
    }

    var multiSelect = new MultiSelect(
        getOptions,
        common,
        getDisabled,
        setSelected,
        getIsOptionDisabled,
        getIsOptionHidden,
        staticContent,
        (pickElement) => pickContentGenerator(pickElement, common, css),
        (choiceElement, toggle) => choiceContentGenerator(choiceElement, common, css, toggle),
        labelAdapter,
        placeholder,
        isRtl,
        onChange,
        css,
        Popper,
        window);

    var resetDispose=null;
    if (staticContent.selectElement){
         var form = closestByTagName(staticContent.selectElement, 'FORM');
         if (form) {
             var eventBuilder = EventBinder();
             eventBuilder.bind(form, 
                     'reset', 
                     () => window.setTimeout( ()=>multiSelect.UpdateData() ) );
             resetDispose = ()=>eventBuilder.unbind();
         }
    }
            
    multiSelect.Dispose = composeSync(multiSelect.Dispose.bind(multiSelect), isValueMissingObservable.detachAll, validationApiObservable.detachAll, resetDispose);
    multiSelect.validationApi = validationApi;
    
    bsAppearance(
        multiSelect, staticContent, getValidity, getSize,
        validationApiObservable,
        useCssPatch, css);
    
    if (init && init instanceof Function)
        init(multiSelect);
   
    multiSelect.init();

    // support browser's "step backward" on form restore
    if (staticContent.selectElement && window.document.readyState !="complete"){
        window.setTimeout( function(){multiSelect.UpdateOptionsSelected()});
    }

    return multiSelect;
}