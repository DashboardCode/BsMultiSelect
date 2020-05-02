import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect} from './BsMultiSelect';
import {initiateDefaults, mergeDefaults, onConfiguration} from './PluginManager';

import {css} from './BsCss'

import {LabelPlugin} from './plugins/LabelPlugin';
import {RtlPlugin} from './plugins/RtlPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';
import {CssPatchPlugin} from './plugins/CssPatchPlugin';
import {PlaceholderPlugin} from './plugins/PlaceholderPlugin';

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling';
import {extendIfUndefined, composeSync} from './ToolsJs';

(
    (window, $, Popper) => {
        const defaults = {containerClass : "dashboardcode-bsmultiselect", css: css}
        let defaultPlugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
        BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin];
        let createBsMultiSelect = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, Popper}
            environment.plugins = defaultPlugins;

            let configuration = {};
            let buildConfiguration;
            if (settings instanceof Function){
                buildConfiguration = settings;
                settings = null;
            } else {
                buildConfiguration = settings?.buildConfiguration;
            }

            if (settings)
                adjustLegacySettings(settings);
            
            configuration.css = createCss(defaults.css, settings?.css);
            mergeDefaults(defaultPlugins, configuration, defaults, settings);

            extendIfUndefined(configuration, settings); 
            extendIfUndefined(configuration, defaults); 
        
            let onInit = buildConfiguration?.(element, configuration);

            onConfiguration(defaultPlugins, configuration);

            let bsMultiSelect = BsMultiSelect(element, environment, configuration, onInit);
            bsMultiSelect.Dispose = composeSync(bsMultiSelect.Dispose, removeInstanceData);
            return bsMultiSelect;
        }
        let prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, $);

        initiateDefaults(defaultPlugins, defaults);
        prototypable.defaults = defaults;
    }
)(window, $, Popper)

