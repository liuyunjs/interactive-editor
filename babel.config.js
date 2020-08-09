module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        // root: ['./'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.ts',
          '.android.ts',
          '.ios.tsx',
          '.android.tsx',
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.png',
          '.jpg',
        ],
        alias: {
          '@liuyunjs': './packages',
        },
      },
    ],
  ],
};
