# Bootstrap 4 Multiselect plugin
*Reuse boostrap 4 styles where it can*

There are many of such plugins but this is small since reuses maximum of bootrap 4 styles and code.

# Architecture
Instead of using BS4 Dropdown (it was possible) plugin uses popper.js directly because of better performance (no need to manage `toggle-buttons`).
Still plugin utilize `dropdown-menu`, `dropdown-item`, `show` styles.

Also those BS4 styles where used:

* BS4 Custom checkboxes

* BS4 Close buttons.

* Form-control style.

* Badge style.

This plugin doesn't have its own styles. This was a clear goal but unfrtunatly it can be achived only by a trick. Not all bootstrap styles varibales can be accessed from a plugin as classes, therefore we need javascript help. Those variables are:

* form control's min-height; default value is "calc(2.25rem + 2px)",

* readonly control background color; default value is "#e9ecef"

* input color; default value is "#495057"

If your theme changes those variables, you need to update them on the plugin initialization (setting options).



Alternatives:
Chosen.js: https://harvesthq.github.io/chosen/ - (ver 1.8.5) strange "Consider marking event handler as 'passive' to make the page more responsive" warnings to console, heavy integrating to bootstrap theme (30KB+10KB js+css minified)

Select2: https://select2.org/appearance - (ver 3.5.3) strange or broken backspace handling (at least in Chrome 66), heavy integrating to bootstrap theme (66KB+14KB js+css minified)

Bootstrap multiselect: http://davidstutz.de/bootstrap-multiselect/  -  (ver. 0.9.15) BS 4 not supported, selected options looks as plain text (not as badges), no backspace key handling (67KB+1KB js+css NOT minified)

Bootstrap-select: https://silviomoreto.github.io/bootstrap-select/ - (ver. 1.12.4) BS 4 supported, but badges line can't be multiline (33KB+7KB js+css minified)

Other Bootstrap extension ideas:
https://github.com/trumbitta/bootstrap-css-utils 

Used tools:
VS Code https://code.visualstudio.com/
