import $ from 'jquery'
import Popper from 'popper.js'

import {MultiSelect} from './MultiSelect'
import {LabelAdapter} from './LabelAdapter';
import {RtlAdapter} from './RtlAdapter';
import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {OptionsAdapterJson, OptionsAdapterElement} from './OptionsAdapters';


import {pickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator} from './StaticContentGenerator';

import {bsAppearance, updateValidity, adjustBsOptionAdapterConfiguration, pushIsValidClassToPicks, getLabelElement} from './BsAppearance';
import {ValidityApi} from './ValidityApi'

import {createCss, extendCss} from './ToolsStyling';
import {extendOverriding, extendIfUndefined, sync, ObservableValue} from './ToolsJs';
import {closestByClassName} from './ToolsDom';


import {adjustLegacyConfiguration as adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {css, cssPatch} from './BsCssDefaults'


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
    var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // ? classes, merge styles
    configuration.css = defCss;
    configuration.cssPatch = defCssPatch;
}

(
    (window, $, Popper) => {
        var defaults = {
            useCssPatch : true,
            containerClass : "dashboardcode-bsmultiselect",
            css: css,
            cssPatch: cssPatch,
            placeholder: '',
            staticContentGenerator : staticContentGenerator,
            getLabelElement: getLabelElement,
            pickContentGenerator: pickContentGenerator,
            choiceContentGenerator : choiceContentGenerator,

            buildConfiguration: null,
            setSelected: (option, value) => {option.selected = value; },
            required: null, /* means look on select[required] or false */
            optionsAdapter: null,
            options: null,
            getDisabled: null,
            getSize: null,
            getIsValid: null,
            getIsInvalid: null
        };

        // Create our shared stylesheet:
        // const sheet = new CSSStyleSheet();
        // sheet.replaceSync('#target {color: darkseagreen}');
        // document.adoptedStyleSheets = [sheet];

        function createPlugin(element, settings, onDispose){

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
            var css = configuration.css;

            var useCssPatch = configuration.useCssPatch;
            var putRtlToContainer=false; 
            if (useCssPatch)
                extendCss(css, configuration.cssPatch); 
            if (configuration.isRtl===undefined || configuration.isRtl===null)
                configuration.isRtl = RtlAdapter(element);
            else if (configuration.isRtl===true)
                putRtlToContainer=true;

            let staticContent = configuration.staticContentGenerator(
                element, name=>window.document.createElement(name), configuration.containerClass, putRtlToContainer, css
            );
            
            if (configuration.required === null)
                    configuration.required = staticContent.required;

            var isValueMissingObservable;
            var wasUpdatedObservable;
            var getCount;
            var getWasValidated;
            var trigger = function(eventName){
                $(element).trigger(eventName);
                isValueMissingObservable.setValue(getCount()===0)
            }

            let optionsAdapter = configuration.optionsAdapter;
            if (!optionsAdapter)
            {
                if (configuration.options){
                    optionsAdapter = OptionsAdapterJson(
                        configuration.options,
                        configuration.getDisabled,
                        configuration.getSize,
                        configuration.getIsValid,
                        configuration.getIsInvalid,
                        trigger
                    );
                } 
                else  
                {
                    adjustBsOptionAdapterConfiguration(
                        configuration,
                        staticContent.selectElement
                    )
                    optionsAdapter = OptionsAdapterElement(
                        staticContent.selectElement, 
                        configuration.getDisabled, 
                        configuration.getSize, 
                        configuration.getIsValid, 
                        configuration.getIsInvalid,
                        trigger
                    );
                }
            }

            getCount =()=>{
                var count = 0;
                var options = optionsAdapter.getOptions();
                for (var i=0; i < options.length; i++) {
                    if (options[i].selected) count++;
                }
                return count;
            }
            getWasValidated = () => {
                var wasValidatedElement = closestByClassName(staticContent.containerElement, 'was-validated');
                return wasValidatedElement?true:false;
            }

            isValueMissingObservable = ObservableValue(getCount()===0);

            wasUpdatedObservable = ObservableValue(getWasValidated());

            var validationObservable = ObservableValue(wasUpdatedObservable.getValue()?!isValueMissingObservable.getValue():null);
            validationObservable.attach(
                (value)=>updateValidity( staticContent.containerElement, staticContent.picksElement,  value)
            )

            isValueMissingObservable.attach(
                (isValueMissing)=>{
                    validationObservable.setValue(wasUpdatedObservable.getValue()?!isValueMissing:null)
                }
            )
            wasUpdatedObservable.attach(
                (wasValidatedPresent)=>{
                    validationObservable.setValue(wasValidatedPresent?!isValueMissingObservable.getValue():null)
                }
            )

            if (useCssPatch)
                pushIsValidClassToPicks(staticContent, css);

            let labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

            if (!configuration.placeholder)
            {
                configuration.placeholder = $(element).data("bsmultiselect-placeholder");
                if (!configuration.placeholder)
                    configuration.placeholder = $(element).data("placeholder");
            }
            
            var valueMissingMessage = "Please select an item in the list";
            if (configuration.valueMissingMessage)
                valueMissingMessage = configuration.valueMissingMessage;

            
            var validityObservable = ObservableValue()
            var validityApi = ValidityApi(
                staticContent.filterInputElement, 
                isValueMissingObservable, 
                valueMissingMessage,
                (valid)=>validityObservable.setValue(valid));

            //var setSelected = configuration.setSelected;
            // if (configuration.required){
            //     var preSetSelected = configuration.setSelected;
            //     var setValidityForRequired = ()=>{
            //         if (configuration.getCount()===0) {
            //             staticContent.filterInputElement.setCustomValidity("Please select an item in the list");
            //         } else {
            //             staticContent.filterInputElement.setCustomValidity("");
            //         }
            //     }
            //     setValidityForRequired();
            //     setSelected = (option, value)=>{
            //         var success = preSetSelected(option, value);
            //         //console.log("setSelected success" + success);
            //         if (success!==false)
            //         { 
            //             setValidityForRequired()
            //         }
            //         return success;
            //     }
            // } 


            
            // var setSelectedWithChangedEvent =  (option, value) => {
            //     var success = setSelected(option, value);
            //     if (success!==false)
            //         changed();
            //     return success;
            // }

            var multiSelect = new MultiSelect(
                optionsAdapter,
                configuration.setSelected,
                staticContent,
                (pickElement) => configuration.pickContentGenerator(pickElement, css),
                (choiceElement) => configuration.choiceContentGenerator(choiceElement, css),
                labelAdapter,
                configuration.placeholder,
                configuration.isRtl,
                css,
                Popper,
                window);
            
            multiSelect.onDispose = ()=> sync(isValueMissingObservable.detachAll, onDispose);
            
            multiSelect.validity = validityApi;
            
            bsAppearance(
                multiSelect, staticContent, staticContent.containerElement, staticContent.picksElement, optionsAdapter, useCssPatch, wasUpdatedObservable, getWasValidated,  css);
            
            if (init && init instanceof Function)
                init(multiSelect);
            
            multiSelect.init();

            return multiSelect;
        }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
