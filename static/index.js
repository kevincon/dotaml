var demos = {};
var demoData = null;

/**
 *  * ReplaceAll by Fagner Brack (MIT Licensed)
 *   * Replaces all occurrences of a substring in a string
 *    */
String.prototype.replaceAll = function( token, newToken, ignoreCase ) {
    var _token;
    var str = this + "";
    var i = -1;

    if ( typeof token === "string" ) {

        if ( ignoreCase ) {

            _token = token.toLowerCase();

            while( (
                i = str.toLowerCase().indexOf(
                    token, i >= 0 ? i + newToken.length : 0
                ) ) !== -1
            ) {
                str = str.substring( 0, i ) +
                    newToken +
                    str.substring( i + token.length );
            }

        } else {
            return this.split( token ).join( newToken );
        }

    }
return str;
};

function ourteampicks(){
  demos.ourteampicks = new TextboxList('ourteampicks', {
    opacity: 1,
    startsWith: true,
    callbacks: {
          onAfterUpdateValues: function(values) {
    if (values.length > 4){
      demos.ourteampicks.mainInput.hide();
    } else {
      demos.ourteampicks.mainInput.show();
    }
    requestSuggestions();
  }

        },

  }, demoData);
}

function theirteampicks(){
  demos.theirteampicks = new TextboxList('theirteampicks',
   {opacity: 1,
    startsWith: true,
    callbacks: {
      onAfterUpdateValues: function(values) {
        if (values.length > 4){
          demos.theirteampicks.mainInput.hide();
        } else {
          demos.theirteampicks.mainInput.show();
        }
        requestSuggestions();
      }
    },
  }, demoData);
}

function ourteamsugg(){
  demos.ourteamsugg = new TextboxList('ourteamsugg', {
    opacity: 1}, demoData);
  demos.ourteamsugg.disable();
}

// function theirteamsugg(){
//   demos.theirteamsugg = new TextboxList('theirteamsugg', {
//     opacity: 1}, demoData);
//   demos.theirteamsugg.disable();
// }

// function ourteambans(){
//   demos.ourteambans = new TextboxList('ourteambans',
//    {opacity: 1,
//     startsWith: true,
//     callbacks: {
//           onAfterUpdateValues: requestSuggestions,
//         },

//     },
//   demoData
//     );
// }

// function globalbans(){
//   demos.globalbans = new TextboxList('globalbans',
//    {opacity: 1,
//     startsWith: true,
//     callbacks: {
//           onAfterUpdateValues: requestSuggestions,
//         },

//     },
//   demoData
//     );
// }

function activateDemos(){
  ourteampicks();
  theirteampicks();
  ourteamsugg();
  //theirteamsugg();
  //ourteambans();
  //globalbans();
  requestSuggestions();
}

function processResponse(resp){
  demos.ourteamsugg.removeAllItems();
  Array.from(resp.x).each(function (b){
    var i = parseInt(b);
    if (!demos.ourteampicks.hasItem(i)){
      demos.ourteamsugg.addItemByValue(i);
    }
  } );

  // demos.theirteamsugg.removeAllItems();
  // Array.from(resp.y).each(function (b){
  //   var i = parseInt(b);
  //   if (!demos.theirteampicks.hasItem(i)){
  //     demos.theirteamsugg.addItemByValue(i);
  //   }
  // } );

  document.getElementById("ctw").innerHTML = (100*resp.prob_x).toFixed(0)+"%";
}

function requestSuggestions(){
  var x, y; //, bg, bx, by;
  x = String.interpret(demos.ourteampicks.getValues());
  y = String.interpret(demos.theirteampicks.getValues());
  // bg = String.interpret(demos.globalbans.getValues());
  // bx = String.interpret(demos.ourteambans.getValues());
  // by = [];
  //new Ajax.Request('api/suggest/?'+'x='+x+',&y='+y+',&bx='+bx+',&by='+by + ',&bg='+bg +',', {
  new Ajax.Request('api/suggest/?'+'x='+x+'&y='+y, {
    method: 'get',
    onSuccess: function(response) {
      processResponse(response.responseText.evalJSON(true));
  }});
}

function onDocLoad(){
  new Ajax.Request('static/data/heroes.json', {
    method: 'get',
    onSuccess: function(transport){
      demoData = transport.responseText.evalJSON(true);
      activateDemos.defer();
    }
  });
}
