import $ from 'jquery'
import Popper from 'popper.js'

import {extendIfUndefined} from './ToolsJs';
import {MultiSelect} from './MultiSelect'
import {LabelAdapter} from './LabelAdapter';
import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {OptionsAdapterJson,OptionsAdapterElement} from './OptionsAdapters';

import {StylingCorrector} from './StylingCorrector'
import {Styling} from './Styling';

import {BsPickContentGenerator, BsPickContentStylingCorrector} from './BsPickContentGenerator';
import {BsChoiceContentGenerator, BsChoiceContentStylingCorrector} from './BsChoiceContentGenerator';
import {ContainerAdapter} from './ContainerAdapter';

import {createBsAppearance} from './BsAppearance';
import {findDirectChildByTagName, setStyles} from './ToolsDom';

const classesDefaults = {
    containerClass: 'dashboardcode-bsmultiselect',
    choicesClass: 'dropdown-menu',

    choiceClassHover: 'text-primary bg-light', // dirty but BS doesn't provide better choices
    choiceClassSelected: '', // not used? should be used in OptionsPanel.js
    choiceClassDisabled: '', // not used? should be used in OptionsPanel.js

    picksClass: 'form-control',  
    picksClassFocus: 'focus', // internal, not bs4, used in scss
    picksClassDisabled: 'disabled', // internal, not bs4, used in scss

    pickClassDisabled: '', // not used? should be used in PicksPanel.js
    
    pickFilterClass: '', 
    filterInputClass: 'form-control',

    // used in BsPickContentStylingCorrector
    pickClass: 'badge',
    pickContentClassDisabled: 'disabled', // internal, not bs4, used in scss
    pickButtonClass: 'close',

    // used in BsChoiceContentStylingCorrector
    choiceClass:  'px-2',
    choiceCheckBoxClassDisabled: 'disabled', // internal, not bs4, used in scss
    choiceContentClass: 'custom-control custom-checkbox',
    choiceCheckBoxClass: 'custom-control-input',
    choiceLabelClass: 'custom-control-label justify-content-start'

};

const stylingDefaults = {
    // used in StylingCorrector
    picksStyle: {marginBottom: 0, height: 'auto'},
    picksStyleDisabled: {backgroundColor: '#e9ecef'},

    picksStyleFocus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
    picksStyleFocusValid: {boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picksStyleFocusInvalid: {boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    //filterInputStyle: {color: 'inherit' /*#495057 for default BS*/, fontWeight : 'inherit'},

    // used in BsAppearance
    picksStyleDef: {minHeight: 'calc(2.25rem + 2px)'},
    picksStyleLg:  {minHeight: 'calc(2.875rem + 2px)'},
    picksStyleSm:  {minHeight: 'calc(1.8125rem + 2px)'},

    // used in BsPickContentStylingCorrector
    pickStyle: {paddingLeft: '0px', lineHeight: '1.5em'},
    pickButtonStyle: {fontSize:'1.5em', lineHeight: '.9em'},
    pickContentStyleDisabled: {opacity: '.65'}, // avoid opacity on pickElement's border

    // used in BsChoiceContentStylingCorrector
    choiceLabelStyleDisabled: {opacity: '.65'} // more flexible than {color: '#6c757d'}
};

(
    (window, $) => {
        function createPlugin(element, settings, onDispose){

            if (typeof Popper === 'undefined') {
                throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)')
            }
    
            let configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element
            if (configuration.buildConfiguration)
                configuration.buildConfiguration(element, configuration);
            
            let useCss = configuration.useCss;
            let styling = configuration.styling;
            if (!configuration.adapter)
            {
                let stylingCorrector = configuration.stylingCorrector;
                if (!stylingCorrector)
                {
                    if (!useCss)
                    {
                        extendIfUndefined(configuration, stylingDefaults);
                        stylingCorrector = StylingCorrector(configuration);
                        var defFocusIn = stylingCorrector.focusIn;
                        stylingCorrector.focusIn = (picksElement) => {
                            if (picksElement.classList.contains("is-valid")){
                                setStyles(picksElement, configuration.picksStyleFocusValid)
                            } else if (picksElement.classList.contains("is-invalid")){
                                setStyles(picksElement, configuration.picksStyleFocusInvalid)
                            } else {
                                defFocusIn(picksElement)
                            }
                        }
                    }
                }
                extendIfUndefined(configuration, classesDefaults);
                styling = Styling(configuration, stylingCorrector);
            }

            let optionsAdapter = null;
            let containerAdapter = null;
            if (configuration.optionsAdapter)
                optionsAdapter = configuration.optionsAdapter;
            else
            {
                var createElement = function(name){
                    return window.document.createElement(name);
                }
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
                        trigger );
                    if (!configuration.createInputId)
                        configuration.createInputId = () => `${configuration.containerClass}-generated-filter-${element.id}`;
                    // find direct child by tagName
                    var picksElement = findDirectChildByTagName(element, "UL");
                    containerAdapter = ContainerAdapter(createElement, null, element, picksElement);
                } 
                else  
                {
                    var selectElement = null;
                    var containerElement = null;
                    if (element.tagName=="SELECT")
                        selectElement = element;
                    else 
                    { 
                        selectElement = findDirectChildByTagName(element, "SELECT");
                        if (!selectElement)
                            throw "There are no SELECT element or options in the configuraion";
                        containerElement = element;
                    }

                    if (!containerElement && configuration.containerClass)
                    {
                        var $container = $(selectElement).closest('.' + configuration.containerClass);
                        if ($container.length>0)
                            containerElement =  $container.get(0);
                    }

                    if (!configuration.label)
                    {
                        let $formGroup = $(selectElement).closest('.form-group');
                        if ($formGroup.length == 1) {
                            let $label = $formGroup.find(`label[for="${selectElement.id}"]`);
                            if ($label.length>0)
                            {   
                                let label = $label.get(0);
                                let forId = label.getAttribute('for');
                                if (forId == selectElement.id) {
                                    configuration.label = label;
                                }
                            }   
                        }
                    }
                    var $form = $(selectElement).closest('form');
                    var form = null;
                    if ($form.length == 1) {
                        form = $form.get(0);
                    }
                    
                    if (!configuration.getDisabled) {
                        var $fieldset = $(selectElement).closest('fieldset');
                    
                        if ($fieldset.length == 1) {
                            var fieldset = $fieldset.get(0);
                            configuration.getDisabled = () => selectElement.disabled || fieldset.disabled;
                        }else{
                            configuration.getDisabled = () => selectElement.disabled;
                        }
                    }

                    if (!configuration.getSize) {
                        configuration.getSize = function(){
                            var value=null;
                            if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg') )
                                value='custom-select-lg';
                            else if (selectElement.classList.contains('custom-select-sm')  || selectElement.classList.contains('form-control-sm')  )
                                value='custom-select-sm';
                            else if (containerElement && containerElement.classList.contains('input-group-lg'))
                                value='input-group-lg';
                            else if (containerElement && containerElement.classList.contains('input-group-sm'))
                                value='input-group-sm';
                            return value;
                        }
                    }
                    if (!configuration.getIsValid) {
                        configuration.getIsValid = function()
                        { return selectElement.classList.contains('is-valid')}
                    }
                    if (!configuration.getIsInvalid) {
                        configuration.getIsInvalid = function()
                        { return selectElement.classList.contains('is-invalid')}
                    }
                    optionsAdapter = OptionsAdapterElement(selectElement, configuration.getDisabled, 
                        configuration.getSize, 
                        configuration.getIsValid, configuration.getIsInvalid,
                        trigger, form);

                    if (!configuration.createInputId)
                        configuration.createInputId = () => `${configuration.containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;

                    
                    var picksElement = null;
                    if (containerElement)
                        picksElement = findDirectChildByTagName(containerElement, "UL");
                    containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
                    
                }
            }
            let labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);

            let pickContentGenerator = configuration.pickContentGenerator;
            if (!pickContentGenerator){
                let pickContentStylingCorrector = configuration.pickContentStylingCorrector;
                if (!pickContentStylingCorrector)
                {
                    if (!useCss){
                        var  {pickStyle, pickButtonStyle, pickContentStyleDisabled} = stylingDefaults;
                        extendIfUndefined(configuration,  {pickStyle, pickButtonStyle, pickContentStyleDisabled});
                        pickContentStylingCorrector=BsPickContentStylingCorrector(configuration, $);
                    }
                }
                
                var  {pickClass, pickButtonClass, pickContentClassDisabled} = classesDefaults;
                extendIfUndefined(configuration, {pickClass, pickButtonClass, pickContentClassDisabled});
                pickContentGenerator = BsPickContentGenerator(configuration, pickContentStylingCorrector, $);
            }

            let choiceContentGenerator = configuration.choiceContentGenerator;
            if (!choiceContentGenerator){
                let choiceContentStylingCorrector = configuration.choiceContentStylingCorrector;
                if (!useCss){
                    var {choiceLabelStyleDisabled} = stylingDefaults;
                    extendIfUndefined(configuration, {choiceLabelStyleDisabled});
                    choiceContentStylingCorrector=BsChoiceContentStylingCorrector(configuration);
                }
                
                var  {choiceClass, choiceCheckBoxClassDisabled} = classesDefaults;
                extendIfUndefined(configuration, {choiceClass, choiceCheckBoxClassDisabled});
                choiceContentGenerator = BsChoiceContentGenerator(configuration, choiceContentStylingCorrector)
            }

            let createStylingComposite = function(pickFilterElement, inputElement, choicesElement){
                return {
                    container: containerAdapter.containerElement,
                    picks: containerAdapter.picksElement,
                    pickFilter: pickFilterElement,
                    input: inputElement,
                    choices: choicesElement
                };
            }
            var placeholderText = configuration.placeholder;
            if (!placeholderText)
            {
                if (selectElement)
                {
                    placeholderText = $(selectElement).data("bsmultiselect-placeholder");
                    if (!placeholderText)
                        placeholderText = $(selectElement).data("placeholder");
                }
                else if (containerElement)                 
                {
                    placeholderText = $(containerElement).data("bsmultiselect-placeholder");
                    if (!placeholderText)
                        placeholderText = $(containerElement).data("placeholder");
                }
            }
            
            let setSelected = configuration.setSelected;
            if (!setSelected){
                setSelected = (option, value)=> { option.selected = value;}
            }

            var bsAppearance =  createBsAppearance(containerAdapter.picksElement, configuration, optionsAdapter);

            var onUpdate = () => {
                bsAppearance.updateSize();
                bsAppearance.updateIsValid();
            }

            let multiSelect = new MultiSelect(
                optionsAdapter,
                setSelected,
                containerAdapter,
                styling,
                pickContentGenerator,
                choiceContentGenerator,
                labelAdapter,
                createStylingComposite,
                placeholderText,
                configuration,
                onUpdate,
                onDispose,
                Popper,
                window);
            
            multiSelect.UpdateSize = bsAppearance.updateSize;
            multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
            
            if (configuration.init)
                configuration.init(element, multiSelect);
            
            multiSelect.init();

            return multiSelect;
        };
        var defaults = {
            classes: classesDefaults,
            styling: stylingDefaults
        };
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
