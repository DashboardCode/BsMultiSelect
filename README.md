# DashboardCode Multiselect plugin for Bootstrap 4
*https://dashboardcode.github.io/BsMultiSelect/*

There are many of such plugins but this is small since reuses maximum of bootrap 4 styles and code. It also follows Bootstrap 4 conventions and solutions.

# Architecture
Instead of using BS4 Dropdown component (it is hardly possible because it require `toggle-buttons`) this plugin uses popper.js directly.
Inspite of this plugin utilize `dropdown-menu` and `show` styles. Menu items contains BS4 Custom checkboxes

Additionally those BS4 styles where used:

* `form-control` `btn` `border` `classes` - they are applied to div that emulates `input`

* `Badge` class - selected items, each item contains BS4 close buttons

This plugin doesn't have its own styles. This was a clear goal but unfrtunatly it can be achived only by a trick. Not all bootstrap styles varibales can be accessed from a plugin as classes, therefore we to configure them in javascript. Those variables are:

* `form-control`'s min-height; default value is "calc(2.25rem + 2px)",

* disable `form-control` background color; default value is "#e9ecef"

* `input` color (clorl of what you are typing); default value is "#495057"

If your theme changes those variables, you need to update them on the plugin initialization.

It would very nice for Bootstrap to provide those SASS variables as classes :

````
.h-input{
  min-height: $input-height !important; 
}

.bg-disabled{
   background-color: $input-disabled-bg !important; 
}

.text-input{
   color: $input-color !important;
}
````
Vote there: https://github.com/twbs/bootstrap/issues/26412 

Important that BS allready provide classes like: `h-25`, `bg-light`, `text-primary` , so the proposal is just a improovement of theirs class system. But there is even better solution: to provide full CSS styles set for "divs that look like input" that  could be used in plugins development.


### Alternatives:

* Chosen.js: https://harvesthq.github.io/chosen/ - (ver 1.8.5) strange "Consider marking event handler as 'passive' to make the page more responsive" warnings to console, heavy integrating to bootstrap theme (30KB+10KB js+css minified)

* Select2: https://select2.org/appearance - (ver 3.5.3) strange or broken backspace handling (at least in Chrome 66), heavy integrating to bootstrap theme (66KB+14KB js+css minified)

* Bootstrap multiselect: http://davidstutz.de/bootstrap-multiselect/  -  (ver. 0.9.15) BS 4 not supported, selected options looks as plain text (not as badges), no backspace key handling (67KB+1KB js+css NOT minified)

* Bootstrap-select: https://silviomoreto.github.io/bootstrap-select/ - (ver. 1.12.4) BS 4 supported, but badges line can't be multiline (33KB+7KB js+css minified)

Other Bootstrap extension ideas:
https://github.com/trumbitta/bootstrap-css-utils 

Used tools:
VS Code https://code.visualstudio.com/
