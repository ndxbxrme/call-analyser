'use strict'

analyser = require '../index'
main = ->
  result = await analyser
    triggerValue: 0.04
    filePath: 'wavs/test.wav'
    outputFileFolder: 'output' #where to save items
    outputFilePrefix: 'test'
  console.log result
main()