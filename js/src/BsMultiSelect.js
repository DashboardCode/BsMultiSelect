import $ from 'jquery'
import Popper from 'popper.js'

import {MultiSelect} from './MultiSelect'
import {LabelAdapter} from './LabelAdapter';
import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {OptionsAdapterJson} from './OptionsAdapters';


import {pickContentGenerator} from './PickContentGenerator';
import {choiceContentGenerator} from './ChoiceContentGenerator';
import {staticContentGenerator} from './StaticContentGenerator';

import {createBsAppearance, createBsOptionAdapter} from './BsAppearance';

import {cloneStyling,setStyling} from './ToolsStyling';

import {adjustLegacyConfiguration, injectConfigurationStyleValues, replaceConfigurationClassValues} from './BsMultiSelectDepricatedParameters'

const stylings = {
    choices: 'dropdown-menu', // bs4, in bsmultiselect.scss as ul.dropdown-menu

    choice_hover:  'hover',  //  not bs4, in scss as 'ul.dropdown-menu li.hover'
    // TODO
    choice_selected: '', // not used? should be used in OptionsPanel.js
    choice_disabled: '', // not used? should be used in OptionsPanel.js

    picks: 'form-control',  // bs4, in scss 'ul.form-control'
    picks_focus: 'focus', // not bs4, in scss 'ul.form-control.focus'
    picks_disabled: 'disabled', //  not bs4, in scss 'ul.form-control.disabled'
    pick_disabled: '',  
    
    pickFilter: '', 
    filterInput: '',

    // used in BsPickContentStylingCorrector
    pick: 'badge', // bs4
    pickContent_disabled: 'disabled', // not bs4, in scss 'ul.form-control li span.disabled'
    pickButton: 'close', // bs4

    // used in BsChoiceContentStylingCorrector
    choice:  '',
    choiceCheckBox_disabled: 'disabled', //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    choiceContent: 'custom-control custom-checkbox', // bs4
    choiceCheckBox: 'custom-control-input', // bs4
    choiceLabel: 'custom-control-label justify-content-start' // 
}

const compensation = {
    choices: { listStyleType:'none'},
    picks: { listStyleType:'none', display:'flex', flexWrap:'wrap'},
    choice: 'px-2' ,  
    choice_hover: 'text-primary bg-light', 
    filterInput: { 
        class: 'form-control', 
        style: {display:'flex', flexWrap:'wrap', listStyleType:'none', marginBottom: 0, height: 'auto'}
    },

    // used in StylingCorrector
    picks_disabled: {backgroundColor: '#e9ecef'},

    picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
    picks_focus_valid: {boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picks_focus_invalid: {boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    // used in BsAppearance
    picks_def: {minHeight: 'calc(2.25rem + 2px)'},
    picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
    picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'},
    
    // used in BsPickContentStylingCorrector
    pick: {paddingLeft: '0px', lineHeight: '1.5em'},
    pickButton: {fontSize:'1.5em', lineHeight: '.9em'},
    pickContent_disabled: {opacity: '.65'}, // avoid opacity on pickElement's border
    
    // used in BsChoiceContentStylingCorrector
    choiceLabel_disabled: {opacity: '.65'}  // more flexible than {color: '#6c757d'}
}

// 1) do not use css - classes  + styling js + prediction clases + compensation js
// 2) use scss - classes only 
(
    (window, $) => {
        var defaults = {
            useOwnCss : false,
            containerClass : "dashboardcode-bsmultiselect",
            stylings: stylings,
            compensation: compensation,
            placeholder: null,
            pickContentGenerator: pickContentGenerator,
            choiceContentGenerator : choiceContentGenerator,
            buildConfiguration: null,
            setSelected: (option, value)=> { option.selected = value;}
            // configuration.init

            // configuration.label
            // configuration.createInputId

            // configuration.options
            // configuration.getDisabled
            // configuration.getSize
            // configuration.getIsValid
            // configuration.getIsInvalid
        };

        function createPlugin(element, settings, onDispose){

            if (typeof Popper === 'undefined') {
                throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required")
            }
    
            // containerClass: 'dashboardcode-bsmultiselect'
            let configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element
            
            configuration.styles=extendStyling(defaults.styles); // TODO: copy instance
            configuration.compensation=cloneStyling(defaults.compensation); // TODO: copy instance

            adjustLegacyConfiguration(configuration)
            injectConfigurationStyleValues(configuration.stylings , configuration);
            replaceConfigurationClassValues(configuration.stylings, configuration);
            if (configuration.useCss==undefined )
                configuration.useCss=defaults.useCss;
            
            if (configuration.containerClass==undefined )
                configuration.containerClass=defaults.containerClass; 

            

            // --------------------------------------------------------------
            var init = configuration.buildConfiguration(element, configuration);
            // --------------------------------------------------------------
            var useCss = configuration.useCss; // useOwnCss
            
            var stylings = constructStyling(configuration.stylings);
            if (!useCss){
                merge(stylings, configuration.compensation);
                // TODO merge  with variables
            }
            
            let staticContent = configuration.staticContent;
            if (!staticContent){
                staticContent = staticContentGenerator(configuration.containerClass, stylings, 
                    (name)=>window.document.createElement(name), element);
            }

            let optionsAdapter = configuration.optionsAdapter;
            if (!optionsAdapter)
            {
                var trigger = function(eventName){
                    $(element).trigger(eventName);
                }
                
                if (configuration.options){
                    optionsAdapter = OptionsAdapterJson(
                        configuration.options,
                        configuration.getDisabled,
                        configuration.getSize,
                        configuration.getIsValid,
                        configuration.getIsInvalid,
                        trigger);

                } 
                else  
                {
                    optionsAdapter = createBsOptionAdapter(
                        configuration,
                        staticContent.selectElement, 
                        staticContent.containerElement,
                        trigger,
                        (element, selector) => { 
                            var q = $(element).closest(selector);
                            var value = null;
                            if (q.length>0)
                                value= q.get(0);
                            return value;
                        }
                    )
                }
            }

            if (!useCss)
            {
                var defFocusIn = staticContent.focusIn;
                staticContent.focusIn = () => {
                    var picksElement = staticContent.picksElement;
                    if (picksElement.classList.contains("is-valid")){ 
                        setStyling(picksElement, configuration.stylings.picks_focus_valid)
                    } else if (picksElement.classList.contains("is-invalid")){
                        setStyling(picksElement, configuration.stylings.picks_focus_invalid)
                    } else {
                        defFocusIn()
                    }
                }
            }

            let labelAdapter = LabelAdapter(configuration.label, staticContent.createInputId);


            if (!configuration.placeholder)
            {
                configuration.placeholder = $(element).data("bsmultiselect-placeholder");
                if (!configuration.placeholder)
                    configuration.placeholder = $(element).data("placeholder");
            }
            
            var bsAppearance =  createBsAppearance(staticContent.picksElement, configuration, optionsAdapter);

            var onUpdate = () => {
                bsAppearance.updateSize();
                bsAppearance.updateIsValid();
            }

            let multiSelect = new MultiSelect(
                optionsAdapter,
                configuration.setSelected,
                staticContent,
                (option, pickElement) => configuration.pickContentGenerator(option, pickElement, stylings),
                (option, choiceElement) => configuration.choiceContentGenerator(option, choiceElement, stylings),
                //pickContentGeneratorInst,
                //choiceContentGeneratorInst,
                labelAdapter,
                //createStylingComposite,
                configuration.placeholder,
                onUpdate,
                onDispose,
                Popper,
                window);
            
            multiSelect.UpdateSize = bsAppearance.updateSize;
            multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
            
            if (init && init instanceof Function)
                init(multiSelect);
            
            multiSelect.init();

            return multiSelect;
            }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
