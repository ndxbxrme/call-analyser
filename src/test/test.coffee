'use strict'

analyser = require '../index'
main = ->
  result = await analyser
    triggerValue: 0.04
    filePath: 'wavs/test.wav'
  console.log result
main()