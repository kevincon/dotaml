/*!
 Prototype based implementation of of a Tag Cloud
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
(function(){
  var REQUIRED_PROTOTYPE = '1.6.1';
  var REQUIRED_SCRIPTY2 = '2.0.0_a5';
  var REQUIRED_SCRIPTY1 = '1.8.1';
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
    var s2CheckFailed = (typeof S2 == 'undefined' || typeof S2.Version == 'undefined') ||
    (convertVersionString(S2.Version) <
    convertVersionString(REQUIRED_SCRIPTY2));
    
    var scriptyCheckFailed = (typeof Scriptaculous == 'undefined') ||
    (convertVersionString(Scriptaculous.Version) <
    convertVersionString(REQUIRED_SCRIPTY1));
    if (s2CheckFailed && scriptyCheckFailed && typeof S2 != 'undefined' && typeof S2.CSS != 'undefined') {
      throw ("ProtoCloud requires the script.aculo.us JavaScript framework >= " +
      REQUIRED_SCRIPTY1 +
      " from http://script.aculo.us/");
    }
    if (s2CheckFailed && scriptyCheckFailed) {
      throw ("ProtoCloud requires the script.aculo.us JavaScript framework >= " +
      REQUIRED_SCRIPTY2 +
      " from http://scripty2.com/");
    }
    if (!scriptyCheckFailed && (typeof S2 == 'undefined' || typeof S2.CSS == 'undefined')) {
      throw ("When using script.aculo.us version " + REQUIRED_SCRIPTY1 + " ProtoCloud requires the use of the S1Addons.js file.");
    }
    if (typeof String.prototype.colorScale != 'function'){
      throw ("ProtoCloud requires the String.colorScale function that was distributed in ScaleColor.js with ProtoCloud");
    }
  };
  checkRequirements();
  // TODO: tests
  ProtoCloud = Class.create({
    initialize: function(target, options){
      this.target = $(target);
      this.setupOptions(options);
      this.target.addClassName(this.options.className);
      if (this.options.useEffects) {
        this.targetLayout = this.target.getLayout();
      }
      this.createTags(this.options.data);
      
      this.dropExtra();
      this.addEffects();
    },
    dropExtra: function(){
      if (this.options.fitToTarget) {
        var ul = this.target.down('ul');
        ul.setStyle({
          overflow: 'hidden'
        });
        if (ul.getHeight() < ul.scrollHeight) {
          this.options.dataByCount = this.options.data.sortBy((function(tagData){
            return this.getCount(tagData);
          }).bind(this));
          var tag, tagEl;
          while (ul.getHeight() < ul.scrollHeight) {
            tag = this.options.dataByCount.shift();
            ul.removeChild((tagEl = $(tag.id)).nextSibling);
            tagEl.remove();
            tagEl = tag = null;
          }
        }
      }
    },
    addEffects: function(){
      if (this.options.useEffects) {
        var data;
        if (this.options.dataByCount) {
          data = this.options.dataByCount;
        }
        else {
          data = this.options.data;
        }
        var layout, tempPos;
        var center = {
          left: (this.targetLayout.get('width') / 2),
          top: (this.targetLayout.get('height') / 2)
        };
        var tagEl, tagData;
        var i = data.length;
        if (i === 0) {
          tagEl = this.target.down('li');
          layout = tagEl.getLayout();
          tagData = {};
          tagData.left = layout.get('left');
          tagData.top = layout.get('top');
          tagData.width = layout.get('width');
          tagData.height = layout.get('height');
          tagEl.setStyle({
            left: this.options.effects.position ? ((center.left - tagData.left) - parseInt(tagData.width / 2, 10)) + 'px' : '',
            top: this.options.effects.position ? ((center.top - tagData.top) - parseInt(tagData.height / 2, 10)) + 'px' : '',
            opacity: this.options.effects.opacity ? 0 : 1
          });
        }
        else {
          while (i > 0) {
            i--;
            tagData = data[i];
            tagEl = $(tagData.id);
            layout = tagEl.getLayout();
            tagData.left = layout.get('left');
            tagData.top = layout.get('top');
            tagData.width = layout.get('width');
            tagData.height = layout.get('height');
            tagEl.setStyle({
              left: this.options.effects.position ? ((center.left - tagData.left) - parseInt(tagData.width / 2, 10)) + 'px' : '',
              top: this.options.effects.position ? ((center.top - tagData.top) - parseInt(tagData.height / 2, 10)) + 'px' : '',
              opacity: this.options.effects.opacity ? 0 : 1
            });
            if (this.options.effects.position) {
              tagEl.morph('left:0px;top:0px;', this.options.effectOptions);
            }
            if (this.options.effects.opacity) {
              tagEl.morph('opacity: 1;', this.options.effectOptions);
            }
            if (this.options.effects.color) {
              tagEl.down('a').morph('color:' + tagData.targetColor + ';', this.options.effectOptions);
            }
          }
          tagData = tagEl = data = null;
        }
      }
    },
    getTagData: function(tagData, id){
      return tagData[this.options.dataAttributes[id]];
    },
    getCount: function(tagData){
      return this.getTagData(tagData, 'count');
    },
    getTag: function(tagData, keepSpace){
      // this is so evil, but it was the only way I could come up with to have IE keep multi part items on a single line without expanding the ' ' because of text-align justify
      return this.getTagData(tagData, 'tag').replace(/\s/g, keepSpace ? ' ' : '<span style="visibility: hidden;">_</span>');
    },
    getSlug: function(tagData){
      return this.getTagData(tagData, 'slug');
    },
    getId: function(){
      var id;
      do {
        id = 'anonymous_element_' + Element.idCounter++;
      }
      while ($(id));
      return id;
    },
    createTags: function(data){
      var ul = new Element('ul').setStyle({
        position: 'relative',
        height: '100%',
        padding: 0,
        margin: 0
      });
      var tag, tagOptions;
      if (data.length === 0) {
        tag = new Element('li', {
          id: this.getId()
        }).setStyle({
          display: 'inline',
          position: 'relative'
        }).insert(new Element('span').setStyle({
          fontSize: (this.options.minFontSize+(this.options.maxFontSize-this.options.minFontSize)/2)+'%',
          color: this.options.baseColor
        }).update(this.options.noTagsMessage));
        ul.insert(tag);
        ul.appendChild(document.createTextNode(' ')); // for proper wrapping we need a text node in between
      }
      else {
        data.each((function(tagData){
          if (this.options.tagForSlug) {
            tagData[this.options.dataAttributes.slug] = Object.isUndefined(this.getSlug(tagData)) ? this.getTag(tagData, true) : this.getSlug(tagData);
          }
          tagOptions = {
            'href': this.options.isHref ? this.getSlug(tagData, true) : this.options.hrefTemplate.evaluate(tagData)
          };
          if (this.options.showTooltip) {
            tagOptions.title = this.getTag(tagData, true) + ' (' + this.getCount(tagData) + ')';
          }
          tagData.targetColor = this.options.scaleColor ? this.getFontColor(this.getCount(tagData)) : this.options.baseColor;
          tag = new Element('li', {
            id: (tagData.id = this.getId())
          }).setStyle({
            display: 'inline',
            position: 'relative'
          }).insert(new Element('a', tagOptions).setStyle({
            fontSize: this.getFontSize(this.getCount(tagData)),
            color: this.options.useEffects ? this.options.baseColor : tagData.targetColor
          }).update(this.getTag(tagData) + (this.options.showCount ? ' (' + this.getCount(tagData) + ')' : '')));
          if (typeof(this.options.linkAttributes) == 'function') {
            var attribs = $H(this.options.linkAttributes(tagData));
            attribs.each(function(item){
              tag.down('a').writeAttribute(item.key, item.value);
            });
          }
          ul.insert(tag);
          ul.appendChild(document.createTextNode(' ')); // for proper wrapping we need a text node in between
        }).bind(this));
      }
      this.target.update(ul);
    },
    setupOptions: function(options){
      var defaultOptions = {
        dataAttributes: {
          count: 'count',
          tag: 'name',
          slug: 'slug'
        },
        useEffects: true,
        effects: {
          position: true,
          color: true,
          opacity: false // disabled by default because I don't think it looks good on text in ie
        },
        effectOptions: {
          duration: 1,
          position: 'parallel'
        },
        minFontSize: 100, // minimum font size in percent
        maxFontSize: 300, // maximum font size in percent
        minColorScale: 1, // minimum amount to scaleColor < 1 will actually darken
        maxColorScale: 5, // maximum amount to scaleColor < 1 will actually darken
        scaleColor: true,
        noTagsMessage: 'No Tags Found',
        className: 'ProtoCloud',
        baseColor: S2.CSS.colorFromString(this.target.getStyle('color')),
        tagForSlug: false, // if true and slug is undefined on a tag then tag will be substituted in the hrefTemplate 
        hrefTemplate: new Template('javascript:alert("name: #{name}, count: #{count}, slug: #{slug}, ");'),
        linkAttributes: false, // set to a function that returns the tag attributes required to add a custom tooltip (as an object of key/value pairs) (can also be used to add additional info if it is required)  it will receive the tagData as it's parameter
        showTooltip: true, // add a title attribute to the link containing the tag and count
        showCount: false, // show count with the tag name
        isHref: false, // set to true if the 'slug' property will contain the full contents for the link href
        fitToTarget: false, // will remove the lowest ranked elements that do not fit in the initial dimentions of 'target'
        // ** warning depending on the data set this may cause the smallest item to be larger then minFontSize
        data: [] // array of objects to use for each tag
      };
      this.options = Object.deepExtend(defaultOptions, options);
      
      this.options.data.each((function(tagData){
        var count = this.getCount(tagData);
        if (!this.options.minCount || count < this.options.minCount) {
          this.options.minCount = count;
        }
        if (!this.options.maxCount || count > this.options.maxCount) {
          this.options.maxCount = count;
        }
      }).bind(this));
      this.options.slope = (this.options.maxFontSize - this.options.minFontSize) / (this.options.maxCount - this.options.minCount);
      this.options.yIntercept = (this.options.minFontSize - ((this.options.slope) * this.options.minCount));
      
      this.options.cslope = (this.options.maxColorScale - this.options.minColorScale) / (this.options.maxCount - this.options.minCount);
      this.options.cyIntercept = (this.options.minColorScale - ((this.options.cslope) * this.options.minCount));
    },
    getFontColor: function(count){
      var val = ((this.options.cslope * count) + this.options.cyIntercept).toFixed(3);
      val = this.options.maxColorScale - val + this.options.minColorScale;
      return this.options.baseColor.colorScale(val);
    },
    getFontSize: function(count){
      var x = ((this.options.slope * count) + this.options.yIntercept);
      return (isNaN(x) ? this.options.maxFontSize : x) + '%';
    }
  });
  Element.addMethods('div', {
      cloudify: function(div, options){
          var ul = div.down('ul');
          var defaultOptions = {
              dataAttributes: {
                  'count': 'count',
                  'tag': 'name',
                  'slug': 'href'
              },
              data: []
          };
          options = Object.deepExtend(defaultOptions, options);
          if (!options.data.size()) {
              options.isHref = true;
              var tagData = {};
              options.data = ul.select('li a').collect(function(link){
                  tagData = {};
                  tagData[options.dataAttributes.tag] = link.innerHTML;
                  tagData[options.dataAttributes.slug] = link.href;
                  tagData[options.dataAttributes.count] = parseFloat(link.readAttribute(options.dataAttributes.count));
                  return tagData;
              });
          }
          ul = null;
          return new ProtoCloud(div, options);
      }
  });
})();
