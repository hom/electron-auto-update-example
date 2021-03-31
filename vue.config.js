module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github']
      },
      preload: 'src/preload.js'
    }
  }
}