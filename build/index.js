(function() {
  'use strict';
  var WavDecoder, WavEncoder, fs, main;

  fs = require('fs-extra');

  WavDecoder = require('wav-decoder');

  WavEncoder = require('wav-encoder');

  main = async function(filePath, triggerValue, minLengthSecs, maxSilenceLengthSecs, outputFileFolder, outputFilePrefix) {
    var buffer, c, channel, decoded, file, i, j, k, l, lastSignificant, len, len1, len2, length, outArr, outburst, outbursts, ref, ref1, sample, start;
    file = (await fs.readFile(filePath));
    decoded = (await WavDecoder.decode(file));
    outbursts = [];
    if (decoded && decoded.sampleRate) {
      lastSignificant = -1;
      start = -1;
      ref = decoded.channelData;
      for (c = j = 0, len = ref.length; j < len; c = ++j) {
        channel = ref[c];
        ref1 = decoded.channelData[c];
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          sample = ref1[i];
          if (Math.abs(sample) > triggerValue) {
            if (i - lastSignificant > decoded.sampleRate * maxSilenceLengthSecs) {
              if (start !== -1) {
                length = lastSignificant - start;
                if (length > decoded.sampleRate * minLengthSecs) {
                  outbursts.push({
                    channel: c,
                    start: (start / decoded.sampleRate).toFixed(4),
                    end: ((start + length) / decoded.sampleRate).toFixed(4),
                    length: (length / decoded.sampleRate).toFixed(4)
                  });
                }
              }
              start = i;
            }
            lastSignificant = i;
          }
        }
      }
      outbursts.sort(function(a, b) {
        if (+a.start > +b.start) {
          return 1;
        } else {
          return -1;
        }
      });
      for (i = l = 0, len2 = outbursts.length; l < len2; i = ++l) {
        outburst = outbursts[i];
        outburst.index = i;
        if (i > 0) {
          outburst.fromLast = (outburst.start - outbursts[i - 1].end).toFixed(4);
        }
        if (outputFileFolder && outputFilePrefix) {
          outArr = new Float32Array(outburst.length * decoded.sampleRate).map(function(e, index) {
            return decoded.channelData[outburst.channel][(outburst.start * decoded.sampleRate) + index];
          });
          buffer = (await WavEncoder.encode({
            sampleRate: decoded.sampleRate,
            channelData: [outArr]
          }));
          await fs.writeFile(path.join(outputFileFolder, outputFilePrefix + outburst.index + '_' + outburst.channel + '.wav', new Buffer(buffer)));
        }
      }
    }
    return outbursts;
  };

  //main 'wavs/1.wav', 0.04, 0.25, 0.5
  module.exports = async function(args) {
    return (await main(args.filePath, args.triggerValue || 0.04, args.minLengthSecs || 0.25, args.maxSilenceLengthSecs || 0.5, args.outputFileFolder, args.outputFilePrefix));
  };

}).call(this);

//# sourceMappingURL=index.js.map
