import {CssPatchPlugin} from './CssPatchPlugin';

import {PickDomFactoryPlugCssPatchBs5} from '../PickDomFactory'
import {PicksDomFactoryPlugCssPatchBs5} from '../PicksDomFactory'
import {ChoiceDomFactoryPlugCssPatch} from '../ChoiceDomFactory'
import {ChoicesDomFactoryPlugCssPatch} from '../ChoicesDomFactory'
import {FilterDomFactoryPlugCssPatch} from '../FilterDomFactory'

export function CssPatchBs5Plugin(defaults){
    var cssPatch = {};
    
    PickDomFactoryPlugCssPatchBs5(cssPatch);
    PicksDomFactoryPlugCssPatchBs5(cssPatch);
    ChoiceDomFactoryPlugCssPatch(cssPatch);
    ChoicesDomFactoryPlugCssPatch(cssPatch);
    FilterDomFactoryPlugCssPatch(cssPatch);

    defaults.cssPatch = cssPatch;
    return CssPatchPlugin(defaults)
}