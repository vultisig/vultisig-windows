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
      },
      switchBtn: {
        primary: '#11284A',
        secondary: '#1B3F73',
      },
      warning: '#F7961B',
    },
  },
};
export const plugins = [];
