/** @type {import('tailwindcss').Config} */
export const content = ['./index.html', './src/**/*.{js,ts,jsx,tsx}'];
export const theme = {
  extend: {
    colors: {
      primary: '#02122B',
      secondary: '#33E6BF',
      tertiary: '#33E6BF',
      btn: {
        primary: '#061B3A',
        secondary: '#BDBDBD',
        tertiary: '#33E6BF'
      },
      switchBtn: {
        primary: '#11284A',
        secondary: '#1B3F73',
      },
      warning: '#F7961B',

      // Colors from SwiftUI
      gray: {
        500: '#F5F5F5', // Equivalent to Color(red: 0.96, green: 0.96, blue: 0.96)
        400: '#EBEBEC', // Equivalent to Color(red: 0.92, green: 0.92, blue: 0.93)
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
  },
};
export const plugins = [];
