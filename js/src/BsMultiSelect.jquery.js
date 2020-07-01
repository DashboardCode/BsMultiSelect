import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect} from './BsMultiSelect'
import {plugDefaultConfig, plugMergeSettings} from './PluginManager'

import {css} from './BsCss'

import {LabelPlugin} from './plugins/LabelPlugin'
import {RtlPlugin} from './plugins/RtlPlugin'
import {FormResetPlugin} from './plugins/FormResetPlugin'
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin'
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin'

import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin'

import {CssPatchPlugin} from './plugins/CssPatchPlugin'
import {PlaceholderPlugin} from './plugins/PlaceholderPlugin'
import {JQueryMethodsPlugin} from './plugins/JQueryMethodsPlugin'
import {OptionsApiPlugin} from './plugins/OptionsApiPlugin'
import {FormRestoreOnBackwardPlugin} from './plugins/FormRestoreOnBackwardPlugin'
import {SelectElementPlugin} from './plugins/SelectElementPlugin'
import {SelectedOptionPlugin} from './plugins/SelectedOptionPlugin'
import {DisabledOptionPlugin} from './plugins/DisabledOptionPlugin'
import {PicksApiPlugin} from './plugins/PicksApiPlugin'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling'
import {extendIfUndefined, composeSync} from './ToolsJs'

import  {EventBinder} from './ToolsDom'
import  {addStyling, toggleStyling} from './ToolsStyling'

(
    (window, $, Popper) => {
        const defaults = {containerClass: "dashboardcode-bsmultiselect", css: css}

        let defaultPlugins = [CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
        BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin, 
        JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin, DisabledOptionPlugin, PicksApiPlugin];

        let createBsMultiSelect = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, Popper}

            let configuration = {};
            let buildConfiguration;
            if (settings instanceof Function) {
                buildConfiguration = settings;
                settings = null;
            } else {
                buildConfiguration = settings?.buildConfiguration;
            }

            if (settings){
                adjustLegacySettings(settings);
                if (settings.plugins) {
                    environment.plugins = settings.plugins;
                    settings.plugins = null;
                }
            }

            if (!environment.plugins){
                environment.plugins = defaultPlugins;
            }

            configuration.css = createCss(defaults.css, settings?.css);
            plugMergeSettings(environment.plugins, configuration, defaults, settings); // merge settings.cssPatch and defaults.cssPatch

            extendIfUndefined(configuration, settings);
            extendIfUndefined(configuration, defaults);

            let onInit = buildConfiguration?.(element, configuration);

            let multiSelect = BsMultiSelect(element, environment, configuration, onInit); // onInit(api, aspects) - before load data
            multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData);
            return multiSelect;
        }
        let prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, $);

        plugDefaultConfig(defaultPlugins, defaults);
        prototypable.defaults = defaults;

        prototypable.tools = {EventBinder, addStyling, toggleStyling, composeSync}
        
        prototypable.plugins = {CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
            BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin, 
            JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin,  DisabledOptionPlugin, PicksApiPlugin}
                    
    }
)(window, $, Popper)

