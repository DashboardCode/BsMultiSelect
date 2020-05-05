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
import {JQueryMethodsPlugin} from './plugins/JQueryMethodsPlugin';
import {OptionsApiPlugin} from './plugins/OptionsApiPlugin';
import {FormRestoreOnBackwardPlugin} from './plugins/FormRestoreOnBackwardPlugin';

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling';
import {extendIfUndefined, composeSync} from './ToolsJs';

(
    (window, $, Popper) => {
        const methodNames = [
            'dispose', 'deselectAll', 'selectAll', 'updateOptionsSelected', 
            'updateOptionsDisabled', 'updateDisabled', 'updateAppearance', 'updateData', 'update']

        const defaults = {containerClass : "dashboardcode-bsmultiselect", css: css}
        let defaultPlugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
        BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin, 
        JQueryMethodsPlugin, FormRestoreOnBackwardPlugin ];
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

            

            let multiSelect = BsMultiSelect(element, environment, configuration, onInit);
            multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData);
            return multiSelect;
        }
        let prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, methodNames, $);

        initiateDefaults(defaultPlugins, defaults);
        prototypable.defaults = defaults;
    }
)(window, $, Popper)

