import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

export default [
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelParser, // JSX 파서 추가
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      //   'no-console': 'warn',
      'no-console': 'off', // 🔹 console.log 허용
      'react/react-in-jsx-scope': 'off',
    },
  },
];
