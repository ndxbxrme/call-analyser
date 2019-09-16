(function() {
  'use strict';
  var analyser, main;

  analyser = require('../index');

  main = async function() {
    var result;
    result = (await analyser({
      triggerValue: 0.04,
      filePath: 'wavs/test.wav',
      outputFileFolder: 'output', //where to save items
      outputFilePrefix: 'test'
    }));
    return console.log(result);
  };

  main();

}).call(this);

//# sourceMappingURL=test.js.map
