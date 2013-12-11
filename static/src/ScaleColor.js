/*
    inspired/modified/ported from code created by Joseph Myers | http://www.codelib.net/
    
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

Object.extend(String.prototype, (function(){
    function colorScale(scalefactor){
        var hexstr = String(this).toLowerCase();
        var r = scalefactor;
        var a, i;
        if (!(hexstr.length === 4 || hexstr.length === 7) || !hexstr.startsWith('#')) {
            throw "'" + hexstr + "' is not in the proper format. Color must be in the form #abc or #aabbcc";
        }
        else if (hexstr.match(/[^#0-9a-f]/)) {
            throw "'" + hexstr + "' contains an invalid color value. Color must be in the form #abc or #aabbcc";
        }
        else if (typeof(r) === 'undefined' || r < 0){
            throw "'" + scalefactor + "' is invalid.  The Scale Factor must be a number greater than 0.  > 1 Will lighten the color. Between 0 and 1 will darken the color.";
        }
        else if (r === 1){
            return hexstr;
        }
        
        // start color parsing/setup
        hexstr = hexstr.sub("#", '').replace(/[^0-9a-f]+/ig, '');
        if (hexstr.length === 3) {
            a = hexstr.split('');
        }
        else if (hexstr.length === 6) {
            a = hexstr.match(/(\w{2})/g);
        }
        for (i = 0; i < a.length; i++) {
            if (a[i].length == 2) {
                a[i] = parseInt(a[i], 16);
            }
            else {
                a[i] = parseInt(a[i], 16);
                a[i] = a[i] * 16 + a[i];
            }
        }
        // end color parsing/setup
        
        // start color processing
        var maxColor = parseInt('ff', 16);
        var minColor = parseInt('ff', 16);
        function relsize(a){
            if (a == maxColor) {
                return Infinity;
            }
            return a / (maxColor - a);
        }
        
        function relsizeinv(y){
            if (y == Infinity) {
                return maxColor;
            }
            return maxColor * y / (1 + y);
        }
        
        for (i = 0; i < a.length; i++) {
            a[i] = relsizeinv(relsize(a[i]) * r);
            a[i] = Math.floor(a[i]).toString(16);
            if (a[i].length == 1) {
                a[i] = '0' + a[i];
            }
        }
       // end color processing
       return '#' + a.join('');
    }
    return {
        colorScale: colorScale
    };
})());

