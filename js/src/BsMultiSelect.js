import $ from 'jquery'
import Bs4AdapterStylingMethodCss from './Bs4AdapterStylingMethodCss'
import Bs4AdapterStylingMethodJs from './Bs4AdapterStylingMethodJs'
import MultiSelect from './MultiSelect'
import AddToJQueryPrototype from './AddToJQueryPrototype'
import Bs4Adapter from './Bs4Adapter';
import LabelAdapter from './LabelAdapter';

import {OptionsAdapterJson,OptionsAdapterElement} from './OptionsAdapters';

import { ComposeBs4SelectedItemContentFactory, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss} from './Bs4SelectedItemContentFactory';
import { ComposeBs4DropDownItemContentFactory, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss } from './Bs4DropDownItemContentFactory';

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, settings, onDispose) => {
                let configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element
                if (configuration.buildConfiguration)
                    configuration.buildConfiguration(element, configuration);

                let optionsAdapter = null;
                if (configuration.optionsAdapter)
                    optionsAdapter = configuration.optionsAdapter;
                else
                {
                    if (configuration.options){
                        optionsAdapter = OptionsAdapterJson(element, configuration.options, 
                            configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid,
                            $ );
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
                        optionsAdapter = OptionsAdapterElement(element, $);
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
                    let stylingAdapter = configuration.useCss
                        ? Bs4AdapterStylingMethodCss(configuration)
                        : Bs4AdapterStylingMethodJs(configuration);
                    adapter = new Bs4Adapter(stylingAdapter, configuration);
                }

                let stylingAdapter2 = configuration.useCss
                    ? Bs4SelectedItemContentStylingMethodCss(configuration, $)
                    : Bs4SelectedItemContentStylingMethodJs(configuration, $);
                let stylingAdapter3 = configuration.useCss
                    ? Bs4DropDownItemContentStylingMethodCss(configuration, $)
                    : Bs4DropDownItemContentStylingMethodJs(configuration, $);
                let bs4SelectedItemContent = ComposeBs4SelectedItemContentFactory(stylingAdapter2, configuration, $);
                let bs4DropDownItemContent = ComposeBs4DropDownItemContentFactory(stylingAdapter3, configuration, $)

                
                let multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, 
                    labelAdapter, configuration, onDispose, window, $);
                return multiSelect;
            }, $);
    }
)(window, $)
