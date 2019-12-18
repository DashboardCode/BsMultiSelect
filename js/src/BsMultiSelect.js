import $ from 'jquery'

import MultiSelect from './MultiSelect'
import LabelAdapter from './LabelAdapter';
import {OptionsAdapterJson,OptionsAdapterElement} from './OptionsAdapters';

import Bs4StylingMethodCss from './Bs4StylingMethodCss'
import Bs4StylingMethodJs from './Bs4StylingMethodJs'
import Bs4Styling from './Bs4Styling';
import AddToJQueryPrototype from './AddToJQueryPrototype'

import { Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss} from './Bs4SelectedItemContent';
import { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss} from './Bs4DropDownItemContent';
import ContainerAdapter from './ContainerAdapter';

function FindDirectChildByTagName(element, tagName){
    var returnValue = null;
    for (var i = 0; i<element.children.length;i++)
    {
        let tmp = element.children[i];
        if (tmp.tagName==tagName)
        {
            returnValue = tmp;
            break;
        }
    }
    return returnValue;
}

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, settings, onDispose) => {
                let configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element
                if (configuration.buildConfiguration)
                    configuration.buildConfiguration(element, configuration);
                
                let useCss = configuration.useCss;
                let styling = configuration.styling;
                if (!configuration.adapter)
                {
                    let stylingMethod = configuration.stylingMethod;
                    if (!stylingMethod)
                    {
                        if (useCss)
                            stylingMethod = Bs4StylingMethodCss(configuration);
                        else
                            stylingMethod = Bs4StylingMethodJs(configuration);
                    }
                    styling = Bs4Styling(stylingMethod, configuration, $);
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
                            configuration.getIsValid,
                            configuration.getIsInvalid,
                            trigger );
                        if (!configuration.createInputId)
                            configuration.createInputId = () => `${configuration.containerClass}-generated-filter-${element.id}`;
                        // find direct child by tagName
                        var picksElement = FindDirectChildByTagName(element, "UL");
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
                            selectElement = FindDirectChildByTagName(element, "SELECT");
                            if (!selectElement)
                                throw "There are no SELECT element or options in the configuraion";
                            containerElement = element;
                        }

                        if (!containerElement && configuration.containerClass)
                        {
                            var $container = $(selectElement).closest('.'+configuration.containerClass);
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
                        optionsAdapter = OptionsAdapterElement(selectElement, configuration.getDisabled, trigger, form);

                        if (!configuration.createInputId)
                            configuration.createInputId = () => `${configuration.containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;

                        
                        var picksElement = null;
                        if (containerElement)
                            picksElement = FindDirectChildByTagName(containerElement, "UL");
                        containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
                        
                    }
                }
                let labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);

                let selectedItemContent = configuration.selectedItemContent;
                if (!selectedItemContent){
                    let selectedItemContentStylingMethod = configuration.selectedItemContentStylingMethod;
                    if (!selectedItemContentStylingMethod)
                    {
                        if (useCss)
                            selectedItemContentStylingMethod=Bs4SelectedItemContentStylingMethodCss(configuration, $);
                        else
                            selectedItemContentStylingMethod=Bs4SelectedItemContentStylingMethodJs(configuration, $);
                    }
                    selectedItemContent = Bs4SelectedItemContent(selectedItemContentStylingMethod, configuration, $);
                }

                let dropDownItemContent = configuration.bs4DropDownItemContent;
                if (!dropDownItemContent){
                    let dropDownItemContentStylingMethod = configuration.dropDownItemContentStylingMethod;
                    if (useCss)
                        dropDownItemContentStylingMethod=Bs4DropDownItemContentStylingMethodCss(configuration, $);
                    else
                        dropDownItemContentStylingMethod=Bs4DropDownItemContentStylingMethodJs(configuration, $);
                    dropDownItemContent = Bs4DropDownItemContent(dropDownItemContentStylingMethod, configuration, $)
                }

                let createStylingComposite = function(container, selectedPanel, placeholderItemElement, filterInputItem, filterInput, dropDownMenu){
                    return {
                        $container:$(container),
                        $selectedPanel:$(selectedPanel),
                        $placeholderItem:placeholderItemElement?$(placeholderItemElement):null,
                        $filterInputItem:$(filterInputItem),
                        $filterInput:$(filterInput),
                        $dropDownMenu:$(dropDownMenu)
                    };
                }
                var placeholderText = configuration.placeholder;
                if (!placeholderText)
                {
                    if (selectElement)
                        placeholderText = $(selectElement).data("bsmultiselect-placeholder");
                    else if (containerElement)                 
                        placeholderText = $(containerElement).data("bsmultiselect-placeholder");
                }
                
                let setSelected = configuration.setSelected;
                if (!setSelected){
                    setSelected = (option, value)=> { option.selected = value;}
                }

                let multiSelect = new MultiSelect(
                    optionsAdapter,
                    setSelected,
                    containerAdapter,
                    styling,
                    selectedItemContent,
                    dropDownItemContent,
                    labelAdapter,
                    createStylingComposite,
                    placeholderText,
                    configuration,
                    onDispose,
                    window);
                
                if (configuration.init)
                    configuration.init(element, multiSelect);
                
                multiSelect.init();
                return multiSelect;
            }, $);
    }
)(window, $)
