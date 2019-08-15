(function() {
  'use strict';
  var WavDecoder, WavEncoder, fs, main;

  fs = require('fs-extra');

  WavDecoder = require('wav-decoder');

  WavEncoder = require('wav-encoder');

  main = async function() {
    var buffer, c, channel, decoded, file, i, j, k, l, lastSignificant, len, len1, len2, length, outArr, outburst, outbursts, ref, ref1, sample, start;
    file = (await fs.readFile('wavs/1.wav'));
    decoded = (await WavDecoder.decode(file));
    lastSignificant = -1;
    start = -1;
    await fs.emptyDir('output');
    outbursts = [];
    ref = decoded.channelData;
    for (c = j = 0, len = ref.length; j < len; c = ++j) {
      channel = ref[c];
      ref1 = decoded.channelData[c];
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        sample = ref1[i];
        if (Math.abs(sample) > 0.04) {
          if (i - lastSignificant > 4000) {
            if (start !== -1) {
              console.log(i - lastSignificant, start, lastSignificant);
              length = lastSignificant - start;
              if (length > 2000) {
                outbursts.push({
                  channel: c,
                  start: (start / 8000).toFixed(4),
                  end: ((start + length) / 8000).toFixed(4),
                  length: (length / 8000).toFixed(4)
                });
                outArr = new Float32Array(length).map(function(e, index) {
                  return decoded.channelData[c][start + index];
                });
                console.log(outArr.length);
                buffer = (await WavEncoder.encode({
                  sampleRate: 8000,
                  channelData: [outArr]
                }));
                await fs.writeFile('output/' + c + '_out_' + i + '.wav', new Buffer(buffer));
              }
            }
            start = i;
          }
          lastSignificant = i;
        }
      }
    }
    outbursts.sort(function(a, b) {
      if (a.start > b.start) {
        return 1;
      } else {
        return -1;
      }
    });
    for (i = l = 0, len2 = outbursts.length; l < len2; i = ++l) {
      outburst = outbursts[i];
      if (i > 0) {
        outburst.fromLast = (outburst.start - outbursts[i - 1].end).toFixed(4);
      }
    }
    return console.log(outbursts);
  };

  main();

}).call(this);

//# sourceMappingURL=index.js.map
