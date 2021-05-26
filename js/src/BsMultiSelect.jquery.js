import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect} from './BsMultiSelect'
import {plugDefaultConfig, plugMergeSettings} from './PluginManager'

import {Bs5Plugin} from './plugins/Bs5Plugin'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling'
import {extendIfUndefined, composeSync} from './ToolsJs'

import  {EventBinder} from './ToolsDom'
import  {addStyling, toggleStyling} from './ToolsStyling'

import  {MultiSelectBuilder} from './MultiSelectBuilder'

(
    (window, $, createPopper) => {
        const defaults = {containerClass: "dashboardcode-bsmultiselect"}
        if (createPopper.createPopper) {
            createPopper = createPopper.createPopper;
        }
        let defaultPlugins = MultiSelectBuilder();

        let createBsMultiSelect = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, createPopper}

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

            if (!environment.plugins) {
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
        defaultPlugins.unshift(Bs5Plugin);
        let prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, $);

        plugDefaultConfig(defaultPlugins, defaults);
        prototypable.defaults = defaults;
        MultiSelectBuilder.plugins.Bs5Plugin = Bs5Plugin;
        prototypable.tools = {EventBinder, addStyling, toggleStyling, composeSync, MultiSelectBuilder} 
    }
)(window, $, Popper)

