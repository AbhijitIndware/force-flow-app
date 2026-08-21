module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      isProduction && ['transform-remove-console', {exclude: ['error']}],
      'react-native-reanimated/plugin',
    ].filter(Boolean),
  };
};
