export default {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 375,
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairlines'],
      minPixelValue: 1,
      mediaQuery: false,
    },
  },
}
