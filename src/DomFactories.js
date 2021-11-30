import {PickDomFactoryPlugCss} from './PickDomFactory'
import {PicksDomFactoryPlugCss} from './PicksDomFactory'
import {ChoiceDomFactoryPlugCssBs5, ChoiceDomFactoryPlugCssBs4} from './ChoiceDomFactory'
import {ChoicesDomFactoryPlugCss} from './ChoicesDomFactory'
import {FilterDomFactoryPlugCss} from './FilterDomFactory'

export function createDefaultCssBs5(){
    var defaultCss={};
    PickDomFactoryPlugCss(defaultCss) 
    PicksDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCssBs5(defaultCss)
    ChoicesDomFactoryPlugCss(defaultCss)
    FilterDomFactoryPlugCss(defaultCss)
    return defaultCss;
}

export function createDefaultCssBs4(){ 
    var defaultCss={}
    PickDomFactoryPlugCss(defaultCss)
    PicksDomFactoryPlugCss(defaultCss)
    ChoiceDomFactoryPlugCssBs4(defaultCss)
    ChoicesDomFactoryPlugCss(defaultCss)
    FilterDomFactoryPlugCss(defaultCss)
    return defaultCss;
}