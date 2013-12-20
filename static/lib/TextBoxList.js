/*!
 Prototype based Text Box List
 http://tfluehr.com

 Copyright (c) 2010 Timothy Fluehr tim@tfluehr.com

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

 If you do choose to use this,
 please drop me an email at tim@tfluehr.com
 I would like to see where this ends up :)
 */
/*
 *  Credits:
 *  - Idea: Facebook + Apple Mail
 *  - Caret position method: Diego Perini <http://javascript.nwbox.com/cursor_position/cursor.js>
 *  - Guillermo Rauch: Original MooTools script <http://devthought.com/projects/mootools/textboxlist/>
 *  - Ran Grushkowsky/InteRiders Inc. : Porting into Prototype and further development <http://interiders.com/>
 *  - Tim Fluehr: Rewrite/modifications <http://www.tfluehr.com>
 */
(function(){
  var REQUIRED_PROTOTYPE = '1.6.1';
  var checkRequirements = function(){
    function convertVersionString(versionString){ // taken from script.aculo.us
      var v = versionString.replace(/_.*|\./g, '');
      v = parseInt(v + '0'.times(4 - v.length), 10);
      return versionString.indexOf('_') > -1 ? v - 1 : v;
    }
    if ((typeof Prototype == 'undefined') ||
    (typeof Element == 'undefined') ||
    (typeof Element.Methods == 'undefined') ||
    (convertVersionString(Prototype.Version) <
    convertVersionString(REQUIRED_PROTOTYPE))) {
      throw ("ProtoCloud requires the Prototype JavaScript framework >= " +
      REQUIRED_PROTOTYPE +
      " from http://prototypejs.org/");
    }
  };
  checkRequirements();

  var ResizableTextbox = Class.create({
    // I think this is for the invisible text box you type into for auto complete
    initialize: function(element, options){
      this.options = Object.extend({
        min: 5,
        max: 500,
        step: 7
      }, options);
      this.el = $(element);
      this.width = this.el.offsetWidth;
      this.el.observe('keyup', (function(ev){
        var newsize = this.options.step * $F(this.el).length;
        if (newsize <= this.options.min) {
          newsize = this.width;
        }
        if (!($F(this.el).length == this.el.retrieve('rt-value') || newsize <= this.options.min || newsize >= this.options.max)) {
          this.el.setStyle({
            'width': newsize
          });
        }
      }).bind(this));
      this.el.observe('keydown', (function(ev){
        this.el.store('rt-value', $F(this.el).length);
      }).bind(this));
    }
  });
  var TextboxLists = $H(); // for caching instances so we only need to add one set of observers for keypress and click
  document.observe('dom:loaded', function(ev){
    var nonChar = false;
    // from http://santrajan.blogspot.com/2007/03/cross-browser-keyboard-handler.html
    var handleKeys = function(ev){
      var ch;
      var list = ev.findElement('.TextboxList');
      if (ev.type == "keydown") {
        ch = ev.keyCode;
        if (ch < 16 || // non printables
        (ch > 16 && ch < 32) || // avoid shift
        (ch > 32 && ch < 41) || // navigation keys
        ch == 46) // Delete Key
        {
          if (list) {
            TextboxLists.get(list.identify()).handleNonChar(ev);
          }
          nonChar = true;
        }
        else {
          nonChar = false;
        }
      }
      else { // This is keypress
        if (nonChar) {
          nonChar = false;
          //ev.stop();
          return false; // Already Handled on keydown
        }
        ch = ev.charCode || ev.keyCode;
        if (ch > 31 && ch < 256 // printable character
            && (typeof(ev.charCode) !== 'undefined' ? ev.charCode : -1) !== 0) {// no function key (Firefox)
          if (list) {
            TextboxLists.get(list.identify()).handleChar(ev, ch);
          }
        }
      }
    };
    document.observe('keypress', handleKeys);
    document.observe('keydown', handleKeys);
    document.observe('click', function(ev){
      if (!ev.isRightClick() && !ev.isMiddleClick()) {
        var el = ev.findElement('.TextboxList, .TextboxListAutoComplete');
        if (el && el.match('.TextboxListAutoComplete')){
          el = $(el.retrieve('parentTextboxList'));
        }
        if (el) {
          var tbl = TextboxLists.get(el.identify());
          tbl.click(ev);
        }
        else { // not in TextBoxList so hide all
          TextboxLists.each(function(item){
            item.value.blur();
          });
        }
      }
    });
  });
  TextboxList = Class.create({
    initialize: function(element, options, data){
      var callbacks = options.callbacks;
      options.callbacks = {};
      this.options = Object.deepExtend({
        autoCompleteActive: true, // set to false to disable autocomple (for use with free typing or to display a list of items)
        hideInput: false, // hide the main input box.  helpful for using the control for just displaying info.
        url: null, // url for ajax request to retrieve data.  use this or pass an array with the data as the thrird param to the constructor.
        ajaxParamName: 'SearchValue', // name of the parameter to send to the server in ajax requests
        opacity: 0.8, // opacity of drop down
        maxresults: Infinity, // max results to display in drop down
        minchars: 1, // min characters to show dropdown
        noResultsMessage: 'No values found',
        hintMessage: null, // message to be displayed
        requestDelay: 0.3, // delay (in seconds) after last keypress before sending request.
        parent: document.body, // parent element for autocomplete dropdown.
        startsWith: false, // limit match to starts with
        regExp: options.startsWith ? '^{0}' : '{0}', // regular expression to use for matching/highlighting items.
        secondaryRegExp: null, // regular expression to use for matching/highlighting items.
        selectKeys: options.selectKeys ? options.selectKeys : [{
              keyCode: Event.KEY_RETURN
            },
            {
              keyCode: Event.KEY_TAB
            }], // array of keys to use for selecting an item.
        customTagKeys: options.customTagKeys ? options.customTagKeys : [],//, // set to a key(s) to allow adding a selected item with the currently selected text
        callbacks: {
          onMainFocus: Prototype.emptyFunction,
          onMainBlur: Prototype.emptyFunction,
          onBeforeAddItem: Prototype.emptyFunction,
          onAfterAddItem: Prototype.emptyFunction,
          onBeforeUpdateValues: Prototype.emptyFunction,
          onAfterUpdateValues: Prototype.emptyFunction,
          onControlLoaded: Prototype.emptyFunction,
          onBeforeAjaxRequest: Prototype.emptyFunction,
          onBeforeRemoveElement: Prototype.emptyFunction
        },
        disabledColor: 'silver', // color of shim to put on top when the control is disabled
        disabledOpacity: 0.3,  // opacity of shim to put on top when the control is disabled
        className: 'bit', // common className to pre-pend to created elements.
        uniqueValues: true // enforce uniqueness in selected items.
      }, options);

      this.input = $(element).hide();

      this.bits = new Hash();
      this.events = new Hash();
      this.current = false;
      this.setupMainElements();
      this.makeResizable(this.mainInput);
      this.setupAutoComplete();
      this.setupEvents();
      this.data = data || [];
      var tempItems = (this.input.getValue().empty() ? [] : this.input.getValue().evalJSON());
      // create initial items
      tempItems.each(this.addItem, this);
      this.isDisabled();
      this.options.callbacks = Object.deepExtend(this.options.callbacks, callbacks);
      this.options.callbacks.onControlLoaded();
    },
    setupEvents: function(){
      this.setupContainerEvents();
      this.setupMainInputEvents();
      this.setupAutoCompleteEvents();
    },
    disable: function(){
      this.isDisabled(true);
    },
    enable: function(){
      this.isDisabled(false);
    },
    isDisabled: function(disable){
      if (typeof disable == 'boolean'){
        this.input.disabled = disable;
      }
      if (this.input.disabled){
        if (!this.disabled){
          // disable control
          this.disabled = true;
          this.mainInput.hide();
          this.holder.select('.closebutton').invoke('hide');
          this.container.addClassName('Disabled');
          //this.showCover();
        }
        return true;
      }
      else if (this.disabled){
        // enable control
        this.disabled = false;
        this.mainInput.show();
        this.holder.select('.closebutton').invoke('show');
        this.container.removeClassName('Disabled');
        this.hideCover();
      }
      return false;
    },

    showCover: function(){
      if (!this.coverDiv){
        this.coverDiv = new Element('div').setStyle({
          opacity: this.options.disabledOpacity,
          backgroundColor: this.options.disabledColor,
          position: 'absolute',
          top: '0px',
          left: '0px',
          height: '100%',
          width: '100%'
        });
        this.container.insert(this.coverDiv);
      }
      this.coverDiv.show();
    },
    hideCover: function(){
      if (this.coverDiv) {
        this.coverDiv.hide();
      }
    },
    handleNonChar: function(ev){
      if (this.isDisabled()){
        return;
      }
      if (this.options.customTagKeys.find(function(item){
            var singleMatch = !this.doubleKey && !item.isPair && item.keyCode === ev.keyCode && !item.printable;
            var doubleMatch = item.isPair && !item.printable && item.keyCode === ev.keyCode;
            if (!this.doubleKey && doubleMatch){
              if (this.mainInput.value.length == 1){
                this.doubleKey = ev.keyCode;
                doubleMatch = false;
              }
            }
            return singleMatch || doubleMatch;
          }, this)) {
        // customSelectorActive && non printable && key matches
        if (!this.mainInput.value.empty()) { // value is non-empty
          this.addItem({ //add it
            caption: this.mainInput.value,
            value: this.mainInput.value
          });
          this.autoHide(); // hide autocomplete
          this.lastRequestValue = null;
          this.mainInput.clear().focus();
        }
      }
      else if (this.options.autoCompleteActive && this.options.selectKeys.find(function(item){
            return item.keyCode === ev.keyCode && !item.printable;
          })) {
        if (this.autoresults.visible()) {
          ev.stop();// auto complete visible select highlited item
          this.autoAdd(this.autocurrent);
          this.autocurrent = false;
        }
      }
      else {
        switch (ev.keyCode) {
          case Event.KEY_LEFT:
            if (!this.autoresults.visible()) { // auto complete not visible - highlite selected item to left if it exists
              return this.move('left');
            }
            break;
          case Event.KEY_RIGHT:
            if (!this.autoresults.visible()) {
              return this.move('right');// auto complete not visible - highlite selected item to right (or input box) if it exists
            }
            break;
          case Event.KEY_DELETE:
          case Event.KEY_BACKSPACE:
            if (!this.autoresults.visible() && this.mainInput.value.length <= 1) {
              return this.moveDispose();// auto complete not visible - delete highlited item if exists
            }
            else if (this.mainInput.value.length <= 1) {
              this.lastRequestValue = null;
              this.autoHide();// auto complete visible and input empty so hide auto complete
            }
            else {
              this.handleChar(ev); // remove char so go through search
            }
            break;
          case Event.KEY_UP:
            if (this.autoresults.visible()) {
              ev.stop();
              return this.autoMove('up');// auto complete visible move highlite up.
            }
            break;
          case Event.KEY_DOWN:
            if (this.autoresults.visible()) {
              ev.stop();
              return this.autoMove('down');// auto complete visible move highlite down.
            }
            break;
          case Event.KEY_ESC:
            if (this.autoresults.visible()) {
              this.autoHide();// auto complete visible - hide it and clear the input.
              if (this.current) {
                this.lastRequestValue = null;
                this.mainInput.clear();
              }
            }
            break;
        }
      }
    },
    handleChar: function(ev, ch){
      if (this.isDisabled()){
        return;
      }
      var forceSearch = false;
      if (ch) {
        ch = String.fromCharCode(ch);
      }
      else {
        // from backspace/delete
        forceSearch = true;
        ch = '';
      }
      var key;
      if (this.mainInput.value.length === 0 && this.doubleKey) {
        this.doubleKey = false;
        this.doubleEnd = false;
      }
      if (this.doubleKey && !this.mainInput.value.startsWith(this.doubleKey)){
        this.doubleKey = false;
        this.doubleEnd = false;
      }
      if ((key = this.options.customTagKeys.find(function(item){
            var singleMatch = !this.doubleKey && !item.isPair && item.character === ch && item.printable;
            var doubleMatch = item.isPair && item.printable && item.character === ch;
            if (doubleMatch){
              if (!this.doubleKey && this.mainInput.getCaretPosition() === 0){
                this.doubleKey = ch;
                doubleMatch = false;
              }
              else if (this.doubleKey && this.mainInput.value.startsWith(this.doubleKey)){
                this.doubleEnd = true;
              }
              else{
                doubleMatch = false;
              }
            }
            return singleMatch || doubleMatch;
          }, this))){
            if (!this.doubleKey || this.doubleEnd) {
              ev.stop(); // stop key from being added to value
              if (!this.mainInput.value.empty()) { // value is non-empty
                if (this.doubleKey) {
                  this.mainInput.value = this.mainInput.value.replace(new RegExp("^" + this.encodeSearch(this.doubleKey)), '').replace(new RegExp(this.encodeSearch(this.doubleKey) + "$"), '');
                }
                this.addItem({ //add it
                  caption: this.mainInput.value,
                  value: this.mainInput.value
                });
                this.autoHide(); // hide autocomplete
                this.lastRequestValue = null;
                this.mainInput.clear().focus();
                return;
              }
            }
        //this.mainInput.value = this.mainInput.value.replace(new RegExp(key.character+'$'), ''); // remove the character from the end of the input string.
      }
      var sVal = this.mainInput.value+ch;
      if (this.doubleKey){
        sVal = sVal.replace(new RegExp("^"+this.encodeSearch(this.doubleKey)), '');
      }
      if (this.checkSearch(sVal)) {
        this.autoholder.descendants().each(function(ev){
          ev.hide();
        });
        if (this.options.hintMessage) {
          this.autoMessage.show();
        }
        this.autoresults.update('').hide();
        this.autoPosition.bind(this, true).defer();
      }
      else {
        this.focus(this.mainInput);// make sure input has focus
        if (this.options.url !== null)// ajax auto complete
        {
          clearTimeout(this.fetchRequest);
          this.fetchRequest = (function(){
            if (!this.mainInput.value.empty() && (this.mainInput.value != this.lastRequestValue || forceSearch)) { // only send request if value has changed since last request
              this.lastRequestValue = this.mainInput.value;
              if (!sVal.empty()) {
                var options = {
                  parameters: {},
                  method: 'get',
                  onSuccess: (function(transport){
                    this.data = transport.responseText.evalJSON(true);
                    this.autoShow(this.mainInput.value);
                  }).bind(this)
                };
                options.parameters[this.options.ajaxParamName] = this.mainInput.value;
                this.options.callbacks.onBeforeAjaxRequest(options);
                new Ajax.Request(this.options.url, options);
              }
            }
          }).bind(this).delay(this.options.requestDelay); // delay request by "options.requestDelay" seconds to wait for user to finish typing
        }
        else {
          this.autoShow.bind(this).defer(); // non ajax so use local data for auto complete
        }
      }
    },
    click: function(ev){
      if (this.isDisabled()){
        return;
      }
      var el;
      if ((el = ev.findElement('.auto-item'))) { // click on auto complete item
        ev.stop();
        this.autoAdd(el);
        this.curOn = false;
      }
      else if ((el = ev.findElement('.closebutton'))) { // x for removing a selected item
        ev.stop();
        if (!this.current) {
          this.focus(this.mainInput);
        }
        this.removeElement(el.up('li'));
        this.focus(this.mainInput);
        return;
      }
      else if ((el = ev.findElement('.' + this.options.className + '-box'))) { // clicked on a selected item (not the x)
        ev.stop();
        this.focus(el);
      }
      else if (this.mainInput.up('li') != this.current) { // clicked anywhere else so focus the text box for typing
        this.focus(this.mainInput);
      }
    },
    setupContainerEvents: function(){
      this.holder.observe('mouseover', (function(ev){
        var el; // add classname on hover-in (not using :hover because of keyboard support)
        if ((el = ev.findElement('.' + this.options.className + '-box'))) {
          el.addClassName('bit-hover');
        }
      }).bind(this));
      this.holder.observe('mouseout', (function(ev){
        var el;// remove classname on hover-out (not using :hover because of keyboard support)
        if ((el = ev.findElement('.' + this.options.className + '-box'))) {
          el.removeClassName('bit-hover');
        }
      }).bind(this));
    },
    setupMainInputEvents: function(){
      if (!this.options.hideInput) {
        this.mainInput.observe('keydown', (function(ev){
          if (this.options.autoCompleteActive && this.autoresults.childElements().size() > 0 &&
          this.options.selectKeys.find(function(item){
            return item === ev.keyCode;
          })) {
            ev.stop(); // auto complete visible so stop on Return to prevent form submit
          }
        }).bind(this));
        this.mainInput.observe('blur', this.mainBlur.bindAsEventListener(this, false));
        this.mainInput.observe('focus', this.mainFocus.bindAsEventListener(this));
        this.mainInput.observe('keydown', (function(ev){
          if (this.isDisabled()) {
            return;
          }
          ev.element().store('lastvalue', ev.element().value).store('lastcaret', ev.element().getCaretPosition());
        }).bind(this));
      }
    },
    setupAutoCompleteEvents: function(){
      if (this.options.autoCompleteActive) {
        this.autoresults.observe('mouseover', (function(ev){
          var el = ev.findElement('.auto-item');
          if (el) {
            this.autoFocus(el);
          }
          this.curOn = true;
        }).bind(this));
        this.autoresults.observe('mouseout', (function(){
          this.curOn = false;
        }).bind(this));
      }
    },
    /*
     * Create/rearrage required elements for the text input box
     */
    setupMainElements: function(){
      this.container = new Element('div', { // container to hold all controls
        'class': 'TextboxList'
      });
      TextboxLists.set(this.container.identify(), this);

      this.holder = new Element('ul', { // hold the input and all selected items
        'class': 'holder'
      }).insert(this.createInput({ // input to type into
        'class': 'maininput'
      })[this.options.hideInput ? 'hide' : 'show']());
      this.input.insert({
        'before': this.container
      });
      this.container.insert(this.holder);
      this.container.insert(this.input);
    },
    /*
     * Create required elements for the autocomplete
     */
    setupAutoComplete: function(){
      var autoholder = new Element('div', {
        'class': 'TextboxListAutoComplete'
      }).hide().store('parentTextboxList', this.container.identify());
      this.autoMessage = new Element('div', { // message to display before user types anything
        'class': 'ACMessage'
      }).update(this.options.hintMessage).hide();
      this.autoNoResults = new Element('div', { // message to display when no autocomplete results
        'class': 'ACMessage'
      }).update(this.options.noResultsMessage).hide();
      autoholder.insert(this.autoMessage);
      autoholder.insert(this.autoNoResults);
      this.autoresults = new Element('ul').hide();

      autoholder.insert(this.autoresults);
      $(this.options.parent).insert(autoholder);

      this.autoholder = autoholder.setOpacity(this.options.opacity);
    },
    getId: function(){
      var id;
      do {
        id = 'anonymous_element_' + Element.idCounter++;
      }
      while ($(id));
      return id;
    },

    /*
     * Add a single item to the text list
     * val: Object { content: '', val: ''}
     */
    addItem: function(val){
      var id = this.getId();
      var el = this.createBox(val, {
        'id': id
      });
      if (!this.options.callbacks.onBeforeAddItem(this.bits.values(), val, el)) {
        this.mainInput.up('li').insert({
          'before': el
        });
        this.bits.set(id, val);
        this.updateInputValue();
        this.options.callbacks.onAfterAddItem(this.bits.values(), val, el);
        return el;
      }
      else {
        return null;
      }
    },
    addItemByValue: function(val){
	for (index = 0; index < this.data.length; ++index) {
      if (this.data[index].value == val){break;}
  }
	this.addItem(this.data[index]);
    },
    /*
     * update the source input box with current values
     * Set as a JSON string
     */
    updateInputValue: function(){
      var values = this.bits.values();
      this.options.callbacks.onBeforeUpdateValues(values, this.input);
      this.input.setValue(Object.toJSON(values));
      this.options.callbacks.onAfterUpdateValues(values, this.input);
    },
    /*
     * Remove a single item from the text list
     * el: Element - the element to remove
     */
    removeElement: function(el){
      if (!this.options.callbacks.onBeforeRemoveElement(this.bits.values(), el)) {
        this.bits.unset(el.id);
        if (this.current == el) {
          this.focus(el.next('.bit-box, .bit-input'));
        }
        this.autoFeed(el.retrieve('value'));
        el.down('a').stopObserving();
        el.stopObserving().remove();
        this.updateInputValue();
      }
//      return this;
    },
    removeItem: function(obj, all){
      var id, foundObj;
      if (typeof(obj.value) != 'undefined' &&
      typeof(obj.caption) != 'undefined') {
        foundObj = this.bits.findAll(function(item){
          return item.value.value === obj.value && item.value.caption === obj.caption;
        });
      }
      else if (typeof(obj.caption) != 'undefined') {
        foundObj = this.bits.findAll(function(item){
          return item.value.caption === obj.caption;
        });
      }
      else if (typeof(obj.value) != 'undefined') {
        foundObj = this.bits.findAll(function(item){
          return item.value.value === obj.value;
        });
      }
      if (foundObj && foundObj.length > 0) {
        if (all) {
          foundObj.each(function(item){
            this.removeElement($(item.key));
          }, this);
          return foundObj;
        }
        else {
          this.removeElement($(foundObj.first().key));
          return foundObj.first();
        }
      }
    },

    hasItem: function(value){
      var foundObj;
      foundObj = this.bits.find(function(item){
          return item.value.value === value;
        });
      if (typeof(foundObj) != 'undefined'){
	return true;};
      return false;

    },

    getValues: function(){
	return this.bits.collect(function(it){return it.value.value});
    },


    removeAllItems: function(){
      var id, foundObj;
      foundObj = this.bits.findAll(function(item){
          return 1==1;
        });


      if (foundObj && foundObj.length > 0) {
          foundObj.each(function(item){
            this.removeElement($(item.key));
          }, this);
          return foundObj;
      }
    },

    mainFocus: function(ev){
      this.focus(ev.element(), false, true);
      this.options.callbacks.onMainFocus(ev);
    },
    focus: function(el, nofocus, onFocus){
      if (this.isDisabled()){
        return;
      }
      if (el == this.mainInput){
        el = el.up('li');
        this.mainInput.setStyle({
          width: ''
        });
      }
      if (el != this.container) {
        if (this.current == el) {
          return this;
        }
        this.blur(null, onFocus);
        if (el == this.mainInput.up('li')) {
          this.autoShow(this.mainInput.value);
        }
        el.addClassName(this.options.className + '-' + el.retrieve('type') + '-focus');
        if (!nofocus) {
          this.callEvent(el, 'focus', onFocus);
        }
        this.current = el;
        return this;
      }
      else {
        this.callEvent(this.mainInput, 'focus', onFocus);
      }
    },
    mainBlur: function(ev){
      this.blur(false);
      //this.mainInput.setStyle({
      //  width: '0px'
      //});
      this.options.callbacks.onMainBlur(ev);
    },
    blur: function(noblur, onFocus){
      if (this.isDisabled()){
        return;
      }
      if (!this.current) {
        return this;
      }
      if (this.current == this.mainInput.up('li') || this.current.match('.bit-box')) {
        if (!noblur) {
          this.callEvent(this.mainInput, 'blur', onFocus);
        }
        this.inputBlur(this.mainInput);
      }
      this.current.removeClassName(this.options.className + '-' + this.current.retrieve('type') + '-focus');
      this.current = false;
      return this;
    },
    inputBlur: function(el){
      if (this.options.hideInput && el == this.mainInput){
        return;
      }
      if (!this.curOn) {
        this.blurhide = this.autoHide.bind(this).delay(0.1);
      }
    },

    createBox: function(val, options){
      var li = new Element('li', Object.extend(options, {
        'class': this.options.className + '-box'
      })).update(val.caption.escapeHTML()).store('type', 'box');
      var a = new Element('a', {
        'href': '#',
        'class': 'closebutton'
      }).observe('focus', function(ev){
        this.focus(ev.findElement('li'), true, true);
      }.bind(this)).observe('blur', this.blur.bind(this, true));
      li.insert(a).store('value', val);
      return li;
    },

    createInput: function(options){
      return this.createInputLI(options);
    },

    createInputLI: function(options){
      var li = new Element('li', {
        'class': this.options.className + '-input'
      });
      this.mainInput = new Element('input', Object.extend(options, {
        'type': 'text'
      }));
      li.store('type', 'input').insert(this.mainInput);
      return li;
    },

    callEvent: function(el, type, onFocus){
      if (this.options.hideInput){
        return;
      }
      if (!onFocus) {
        if (type == 'focus') {
          this.mainInput.focus();
        }
      }
    },

    makeResizable: function(li){
      this.mainInput.store('resizable', new ResizableTextbox(this.mainInput, {
        min: this.mainInput.offsetWidth,
        max: (this.input.getWidth() ? this.input.getWidth() : 0)
      }));
      return this;
    },

    checkInput: function(){
      return (!this.mainInput.retrieve('lastvalue') || (this.mainInput.getCaretPosition() === 0 && this.mainInput.retrieve('lastcaret') === 0));
    },

    move: function(direction){
      var el = this.current[(direction == 'left' ? 'previous' : 'next')]('.bit-box, .bit-input');
      if (el && (this.checkInput() || direction == 'right')) {
        this.focus(el);
      }
      return this;
    },

    moveDispose: function(){
      if (this.current.retrieve('type') == 'box') {
        this.removeElement(this.current);
      }
      else if (this.checkInput() && this.bits.keys().length && this.current.previous('.bit-box, .bit-input')) {
        this.focus(this.current.previous('.bit-box, .bit-input'));
      }
      this.autoPosition(true);
    },
    checkSearch: function(search){
      return typeof search != 'string' || search.strip().empty() || search.length < this.options.minchars;
    },
    encodeSearch: function(search){
      return search.replace(/([\^\$\.\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}])/g, '\\$1');
    },
    autoShow: function(search){
      if (typeof search != 'string'){
        search = this.mainInput.value;
      }
      this.autoPosition();
      this.autoholder.show();
      this.autoholder.descendants().each(function(ev){
        ev.hide();
      });
      if (this.checkSearch(search)) {
        if (this.options.hintMessage && !this.blurhide) {
          this.autoMessage.show();
        }
        this.autoresults.update('').hide();
        this.autoPosition.bind(this, true).defer();
      }
      else {
        if (this.options.autoCompleteActive) {
          this.autoresults.show().update('');
          var count = 0, matchCount = 0;
          var regExp = new RegExp(this.options.regExp.replace('{0}', this.encodeSearch(search)), 'i');
          var results = this.data.filter(function(obj){
            if (matchCount === this.options.maxresults) {
              throw $break;
            }
            var returnVal = obj ? regExp.test(obj.caption) : false;
            if (returnVal && this.options.uniqueValues) {
              returnVal = !this.bits.find(function(item){
                return item.value.caption === obj.caption;
              });
            }
            if (returnVal) {
              matchCount++;
            }
            return returnVal;
          }, this);
          var secondaryRegExp;
          if (this.options.secondaryRegExp) {
            secondaryRegExp = new RegExp(this.options.secondaryRegExp.replace('{0}', this.encodeSearch(search)), 'i');
            var secondaryResults = this.data.filter(function(obj){
              if (matchCount === this.options.maxresults) {
                throw $break;
              }
              var returnVal = obj ? secondaryRegExp.test(obj.caption) &&
              !results.find(function(item){
                return item.caption === obj.caption;
              }) : false;
              if (returnVal && this.options.uniqueValues) {
                returnVal = !this.bits.find(function(item){
                  return item.value.caption === obj.caption;
                });
              }
              if (returnVal) {
                matchCount++;
              }
              return returnVal;
            }, this);
            results = results.concat(secondaryResults);
          }

          results.each(function(result, ti){
            count++;
            if (ti >= this.options.maxresults) {
              throw $break;
            }
            var el = new Element('li', {
              'class': 'auto-item'
            });
            el.update(this.autoCompleteItemHTML(result, regExp, secondaryRegExp));
            this.autoresults.insert(el);
            el.store('result', result);
            if (ti === 0) {
              this.autoFocus(el);
            }
          }, this);
          if (count === 0) {
            this.autoNoResults.show();
            this.autoresults.hide();
          }
        }
      }
      return this;
    },

    autoCompleteItemHTML: function(result, highlight, secondaryHighlight){
      var retVal = result.caption.gsub(highlight, function(match){
        return '\t\t\t' + match[0] + '\f\f\f';
      });
      if (secondaryHighlight) {
        retVal = retVal.gsub(secondaryHighlight, function(match){
          return '\t\t\t' + match[0] + '\f\f\f';
        });
      }
      return retVal.replace(/\t\t\t/g, '<em>').replace(/\f\f\f/g, '</em>');
    },

    autoHide: function(){
      this.autoMessage.hide();
      this.autoresults.update('').hide();
      this.autoholder.hide();
      this.blurhide = null;
      this.doubleKey = false;
      this.doubleEnd = false;
      return this;
    },

    autoFocus: function(el){
      if (!el) {
        return;
      }
      if (this.autocurrent) {
        this.autocurrent.removeClassName('auto-focus');
      }
      this.autocurrent = el.addClassName('auto-focus');
    },

    autoMove: function(direction){
      if (this.autoresults.childElements().size() === 0) {
        return;
      }
      this.autoFocus(this.autocurrent[(direction == 'up' ? 'previous' : 'next')]('.auto-item'));
      this.autoresults.scrollTop = this.autocurrent.positionedOffset()[1] - this.autocurrent.getHeight();
      return this;
    },

    autoFeed: function(val){
      if (!this.data.find(function(item){
        return item.caption === val.caption;
      })) {
        this.data.push(val);
      }
      return this;
    },

    autoAdd: function(el){
      if (!el || !el.retrieve('result')) {
        return;
      }
      if (this.addItem(el.retrieve('result'))) {
        delete this.data[this.data.indexOf(Object.toJSON(el.retrieve('result')))];
      }
      this.autoHide();
      this.lastRequestValue = null;
      this.mainInput.clear().focus();
      return this;
    },
    autoPosition: function(force){
      if (force || !this.autoholder.visible()) {
        var contOffset = this.holder.viewportOffset();
        var parentOffset = this.options.parent.viewportOffset();
        contOffset.top = contOffset.top - parentOffset.top;
        contOffset.left = contOffset.left - parentOffset.left;
        this.autoholder.setStyle({
          left: contOffset.left + 'px',
          top: (contOffset.top + this.container.getHeight()) + 'px',
          width: this.holder.getWidth() + 'px'
        });
      }
    }
  });

  //helper functions
  Element.addMethods({
    getCaretPosition: function(el){
      var pos = 0;
      if (el.selectionStart || el.selectionStart == '0') {
        pos = el.selectionStart;
      }
      else {
        var r = document.selection.createRange().duplicate();
        r.moveEnd('character', el.value.length);
        if (r.text === '') {
          pos = el.value.length;
        }
        else {
          pos = el.value.lastIndexOf(r.text);
        }
      }
      return pos;
    }
  });
  if (typeof(Object.deepExtend) == 'undefined') {
    Object.deepExtend = function(destination, source){
      for (var property in source) {
        if (source[property] && source[property].constructor &&
        source[property].constructor === Object) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
        }
        else {
          destination[property] = source[property];
        }
      }
      return destination;
    };
  }

})();
