import {CssPatchPlugin} from './CssPatchPlugin';

//import {PickDomFactoryPlugCssPatch} from '../PickDomFactory'
import {PicksDomFactoryPlugCssPatchBs4} from '../PicksDomFactory' // TODO move specific styles to button plugin
import {ChoiceDomFactoryPlugCssPatch} from '../ChoiceDomFactory'
import {ChoicesDomFactoryPlugCssPatch} from '../ChoicesDomFactory'
import {FilterDomFactoryPlugCssPatch} from '../FilterDomFactory'

export function CssPatchBs4Plugin(defaults) {
    var cssPatch = {};

    //PickDomFactoryPlugCssPatch(cssPatch);
    PicksDomFactoryPlugCssPatchBs4(cssPatch);
    ChoiceDomFactoryPlugCssPatch(cssPatch);
    ChoicesDomFactoryPlugCssPatch(cssPatch);
    FilterDomFactoryPlugCssPatch(cssPatch);

    defaults.cssPatch = cssPatch;
    return CssPatchPlugin(defaults)
}