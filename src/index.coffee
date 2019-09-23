'use strict'

fs = require 'fs-extra'
WavDecoder = require 'wav-decoder'
WavEncoder = require 'wav-encoder'
path = require 'path'

main = (filePath, triggerValue, minLengthSecs, maxSilenceLengthSecs, outputFileFolder, outputFilePrefix, combine) ->
  file = await fs.readFile filePath
  decoded = await WavDecoder.decode file
  outbursts = []
  if decoded and decoded.sampleRate
    for channel, c in decoded.channelData
      lastSignificant = -1
      start = -1
      for sample, i in decoded.channelData[c]
        if Math.abs(sample) > triggerValue
          if i - lastSignificant > decoded.sampleRate * maxSilenceLengthSecs or i < decoded.sampleRate * maxSilenceLengthSecs
            if start isnt -1
              length = lastSignificant - start
              if length > decoded.sampleRate * minLengthSecs
                outbursts.push 
                  channel: c
                  start: +(start / decoded.sampleRate).toFixed(4)
                  end: +((start + length) / decoded.sampleRate).toFixed(4)
                  length: +(length / decoded.sampleRate).toFixed(4)
            start = i
          lastSignificant = i
    outbursts.sort (a, b) ->
      if a.start > b.start then 1 else -1
    if combine
      outitems = []
      for outburst in outbursts
        myitem = outitems[outitems.length - 1]
        if myitem and myitem.channel is outburst.channel
          myitem.end = outburst.end
          myitem.length = +(myitem.end - myitem.start).toFixed(4)
        else
          outitems.push outburst
      outbursts = outitems
    for outburst, i in outbursts
      outburst.index = i
      if i > 0
        outburst.fromLast = +(outburst.start - outbursts[i - 1].end).toFixed(4)
      if outputFileFolder and outputFilePrefix
        outArr = new Float32Array(outburst.length * decoded.sampleRate).map (e, index) ->
          decoded.channelData[outburst.channel][(outburst.start * decoded.sampleRate) + index]
        buffer = await WavEncoder.encode
          sampleRate: decoded.sampleRate,
          channelData: [ outArr ]
        await fs.writeFile path.join(outputFileFolder, outputFilePrefix + outburst.index + '_' + outburst.channel + '.wav'), new Buffer(buffer)
  outbursts
#main 'wavs/1.wav', 0.04, 0.25, 0.5
module.exports = (args) ->
    await main args.filePath, args.triggerValue or 0.04, args.minLengthSecs or 0.25, args.maxSilenceLengthSecs or 0.5, args.outputFileFolder, args.outputFilePrefix, args.combine