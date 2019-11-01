import $ from 'jquery'

import MultiSelect from './MultiSelect'
import LabelAdapter from './LabelAdapter';
import {OptionsAdapterJson,OptionsAdapterElement} from './OptionsAdapters';

import Bs4StylingMethodCss from './Bs4StylingMethodCss'
import Bs4StylingMethodJs from './Bs4StylingMethodJs'
import Bs4Styling from './Bs4Styling';
import AddToJQueryPrototype from './AddToJQueryPrototype'

import { Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss} from './Bs4SelectedItemContent';
import { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss } from './Bs4DropDownItemContent';

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, settings, onDispose) => {
                let configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element
                if (configuration.buildConfiguration)
                    configuration.buildConfiguration(element, configuration);
                var $element= $(element);
                let optionsAdapter = null;
                if (configuration.optionsAdapter)
                    optionsAdapter = configuration.optionsAdapter;
                else
                {
                    var trigger = function(eventName){
                        $element.trigger(eventName);
                    }
                    if (configuration.options){
                        optionsAdapter = OptionsAdapterJson(element, configuration.options, 
                            configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid,
                            trigger );
                        if (!configuration.createInputId)
                            configuration.createInputId=()=>`${configuration.containerClass}-generated-filter-${element.id}`;
            
                    }else {
                        if (!configuration.label)
                        {
                            let $formGroup = $(element).closest('.form-group');
                            if ($formGroup.length == 1) {
                                let $label = $formGroup.find(`label[for="${element.id}"]`);
                                if ($label.length>0)
                                {   
                                    let label = $label.get(0);
                                    let forId = label.getAttribute('for');
                                    if (forId == element.id) {
                                        configuration.label = label;
                                    }
                                }   
                            }
                        }
                        optionsAdapter = OptionsAdapterElement(element, trigger);
                        if (!configuration.createInputId)
                            configuration.createInputId=()=>`${configuration.containerClass}-generated-input-${((element.id)?element.id:element.name).toLowerCase()}-id`;
                    }
                }

                let labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);

                let adapter=null;
                if (configuration.adapter)
                    adapter = configuration.adapter;
                else
                {
                    let stylingMethod = configuration.useCss
                        ? Bs4StylingMethodCss(configuration)
                        : Bs4StylingMethodJs(configuration);
                    adapter = Bs4Styling(stylingMethod, configuration, $);
                }

                let stylingAdapter2 = configuration.useCss
                    ? Bs4SelectedItemContentStylingMethodCss(configuration, $)
                    : Bs4SelectedItemContentStylingMethodJs(configuration, $);
                let stylingAdapter3 = configuration.useCss
                    ? Bs4DropDownItemContentStylingMethodCss(configuration, $)
                    : Bs4DropDownItemContentStylingMethodJs(configuration, $);
                let bs4SelectedItemContent = Bs4SelectedItemContent(stylingAdapter2, configuration, $);
                let bs4DropDownItemContent = Bs4DropDownItemContent(stylingAdapter3, configuration, $)

                let createStylingComposite = function(container, selectedPanel, filterInputItem, filterInput, dropDownMenu){
                    return {
                        $container:$(container), $selectedPanel:$(selectedPanel),
                        $filterInputItem:$(filterInputItem), $filterInput:$(filterInput),
                        $dropDownMenu:$(dropDownMenu)
                        };
                }
                let multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, 
                    labelAdapter, createStylingComposite, configuration, onDispose, window);
                return multiSelect;
            }, $);
    }
)(window, $)
