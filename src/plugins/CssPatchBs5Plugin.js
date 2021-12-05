import {CssPatchPlugin} from './CssPatchPlugin';

import {PicksDomFactoryPlugCssPatchBs5} from '../PicksDomFactory' // TODO move specific styles to button plugin
import {ChoiceDomFactoryPlugCssPatch} from '../ChoiceDomFactory'
import {ChoicesDomFactoryPlugCssPatch} from '../ChoicesDomFactory'
import {FilterDomFactoryPlugCssPatch} from '../FilterDomFactory'

export function CssPatchBs5Plugin(defaults){
    var cssPatch = {};
    
    PicksDomFactoryPlugCssPatchBs5(cssPatch);
    ChoiceDomFactoryPlugCssPatch(cssPatch);
    ChoicesDomFactoryPlugCssPatch(cssPatch);
    FilterDomFactoryPlugCssPatch(cssPatch);

    defaults.cssPatch = cssPatch;
    return CssPatchPlugin(defaults)
}