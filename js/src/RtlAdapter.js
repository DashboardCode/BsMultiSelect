import {closestByAttribute} from './ToolsDom';

export function RtlAdapter(element){
    var isRtl = false;
    var e = closestByAttribute(element,"dir","rtl");
    if (e)
        isRtl = true;
    return isRtl;
}