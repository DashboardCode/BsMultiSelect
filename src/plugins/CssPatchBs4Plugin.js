import {CssPatchPlugin} from './CssPatchPlugin';

import {PickDomFactoryPlugCssPatch} from '../PickDomFactory'
import {PicksDomFactoryPlugCssPatch} from '../PicksDomFactory' // TODO move specific styles to button plugin
import {ChoiceDomFactoryPlugCssPatch} from '../ChoiceDomFactory'
import {ChoicesDomFactoryPlugCssPatch} from '../ChoicesDomFactory'
import {FilterDomFactoryPlugCssPatch} from '../FilterDomFactory'

export function CssPatchBs4Plugin(defaults) {
    var cssPatch = {};

    PickDomFactoryPlugCssPatch(cssPatch);
    PicksDomFactoryPlugCssPatch(cssPatch);
    ChoiceDomFactoryPlugCssPatch(cssPatch);
    ChoicesDomFactoryPlugCssPatch(cssPatch);
    FilterDomFactoryPlugCssPatch(cssPatch);

    defaults.cssPatch = cssPatch;
    return CssPatchPlugin(defaults)
}