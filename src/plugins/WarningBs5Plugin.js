import {WarningPlugin} from './WarningPlugin';

export function WarningBs5Plugin(defaults){
    defaults.css.warning = 'alert-warning';
    return WarningPlugin(defaults);
}

