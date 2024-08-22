/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './src/**/*.{js,ts,jsx,tsx}'];
export const theme = {
  extend: {
    colors: {
      primary: '#02122B',
      secondary: '#33E6BF',
      btn: {
        primary: '#061B3A',
        secondary: '#BDBDBD',
        tertiary: '#33E6BF',
      },
      switchBtn: {
        primary: '#11284A',
        secondary: '#1B3F73',
      },
      warning: '#F7961B',

      // Colors from SwiftUI
      gray: {
        500: '#F5F5F5',
        400: '#EBEBEC',
      },
      neutral: {
        0: '#FFFFFF',
        100: '#F3F4F5',
        200: '#EBECED',
        300: '#BDBDBD',
        400: '#A7A7A7',
        500: '#9F9F9F',
        700: '#737373',
        900: '#000000',
      },
      blue: {
        200: '#1B3F73',
        400: '#11284A',
        600: '#061B3A',
        800: '#02122B',
      },
      persianBlue: {
        200: '#4879FD',
        400: '#2155DF',
      },
      turquoise: {
        600: '#33E6BF',
      },
      purple: {
        medium: '#9563FF',
      },
      destructive: '#E45944',
      loading: {
        blue: '#1DA7FA',
        green: '#24D7A6',
      },
      alert: {
        red: '#FF4040',
      },
      logo: {
        blue: '#0D86BB',
      },
      background: {
        blue: '#02122B',
      },
    },
    fontSize: {
      'body-8': ['8px', { lineHeight: '1rem' }],
      'body-10': ['10px', { lineHeight: '1.25rem' }],
      'body-12': ['12px', { lineHeight: '1.5rem' }],
      'body-13': ['13px', { lineHeight: '1.5rem' }],
      'body-14': ['14px', { lineHeight: '1.75rem' }],
      'body-15': ['15px', { lineHeight: '1.75rem' }],
      'body-16': ['16px', { lineHeight: '1.75rem' }],
      'body-18': ['18px', { lineHeight: '2rem' }],
      'body-20': ['20px', { lineHeight: '2.25rem' }],
      'title-30': ['30px', { lineHeight: '1.2' }],
      'title-32': ['32px', { lineHeight: '1.2' }],
      'title-35': ['35px', { lineHeight: '1.2' }],
      'title-36': ['36px', { lineHeight: '1.2' }],
      'title-38': ['38px', { lineHeight: '1.2' }],
      'title-40': ['40px', { lineHeight: '1.2' }],
      'title-60': ['60px', { lineHeight: '1.2' }],
      'title-80': ['80px', { lineHeight: '1.2' }],
      'title-100': ['100px', { lineHeight: '1.2' }],
    },
    fontWeight: {
      light: 300,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
    fontFamily: {
      menlo: ['Menlo', 'monospace'],
      montserrat: ['Montserrat', 'sans-serif'],
      american: ['AmericanTypewriter', 'serif'],
    },
  },
};
export const plugins = [];
