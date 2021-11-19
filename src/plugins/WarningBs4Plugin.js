import {WarningPlugin} from './WarningPlugin';

export function WarningBs4Plugin(defaults){
    defaults.css.warning = 'alert-warning bg-warning';
    return WarningPlugin(defaults);
}
