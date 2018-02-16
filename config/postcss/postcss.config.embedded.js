module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-calc': {},
    'postcss-cssnext': {
      browsers: ['last 2 versions', '> 5%'],
    },
    'postcss-flexbugs-fixes': {},
    'postcss-wrap': {
      selector: '#speed-kit-analyzer',
      skip: [ 'speed-kit-analyzer' ]
    },
  },
}
