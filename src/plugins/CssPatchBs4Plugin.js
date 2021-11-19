import {CssPatchPlugin} from './CssPatchPlugin';

import {PickDomFactoryPlugCssPatch, PickDomFactoryPlugCssPatchBs4} from '../PickDomFactory'
import {PicksDomFactoryPlugCssPatch, PicksDomFactoryPlugCssPatchBs4} from '../PicksDomFactory'
import {ChoiceDomFactoryPlugCssPatch} from '../ChoiceDomFactory'
import {ChoicesDomFactoryPlugCssPatch} from '../ChoicesDomFactory'
import {FilterDomFactoryPlugCssPatch} from '../FilterDomFactory'

export function CssPatchBs4Plugin(defaults) {
    var cssPatch = {};

    PickDomFactoryPlugCssPatch(cssPatch);
    PickDomFactoryPlugCssPatchBs4(cssPatch);
    PicksDomFactoryPlugCssPatch(cssPatch);
    PicksDomFactoryPlugCssPatchBs4(cssPatch);
    ChoiceDomFactoryPlugCssPatch(cssPatch);
    ChoicesDomFactoryPlugCssPatch(cssPatch);
    FilterDomFactoryPlugCssPatch(cssPatch);

    defaults.cssPatch = cssPatch;
    return CssPatchPlugin(defaults)
}