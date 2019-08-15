# call-analyser

### install 
```bash
npm install --save https://github.com/ndxbxrme/call-analyser.git 
```

### usage
```coffeescript
analyser = require 'call-analyser'

main = ->
  output = await analyser
    filePath: 'wavs/1.wav'
  console.log output
main()
```

### with more options
```coffeescript
output = await analyser.analyse
  filePath: 'wavs/1.wav'
  triggerValue: 0.04 #number between 0 and 1
  minLengthSecs: 0.25 #minimum length for an item
  maxSilenceLengthSecs: 0.5 #number of silent samples before triggering the next item
  outputFileFolder: 'output' #where to save items
  outputFilePrefix: '' #filename to use
```
#### files will only be written if outputFileFoder and outputFilePrefix are set
