import {PickDomFactoryPlugCss, PickDomFactoryPlugCssBs5, PickDomFactoryPlugCssBs4} from './PickDomFactory'
import {PicksDomFactoryPlugCss} from './PicksDomFactory'
import {ChoiceDomFactoryPlugCss, ChoiceDomFactoryPlugCssBs5, ChoiceDomFactoryPlugCssBs4} from './ChoiceDomFactory'
import {ChoicesDomFactoryPlugCss} from './ChoicesDomFactory'
import {FilterDomFactoryPlugCss} from './FilterDomFactory'

export function createDefaultCssBs5(){
    var defaultCss={};
    PickDomFactoryPlugCss(defaultCss)
    PickDomFactoryPlugCssBs5(defaultCss)
    PicksDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCssBs5(defaultCss)
    ChoicesDomFactoryPlugCss(defaultCss)
    FilterDomFactoryPlugCss(defaultCss)
    return defaultCss;
}

export function createDefaultCssBs4(){ 
    var defaultCss={}
    PickDomFactoryPlugCss(defaultCss)
    PickDomFactoryPlugCssBs4(defaultCss)
    PicksDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCssBs4(defaultCss)
    ChoicesDomFactoryPlugCss(defaultCss)
    FilterDomFactoryPlugCss(defaultCss)
    return defaultCss;
}