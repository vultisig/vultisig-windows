import { createGlobalStyle } from 'styled-components'

import { getColor } from '../theme/getters'
import { themedScrollbars } from './themedScrollbars'

export const GlobalStyle = createGlobalStyle`
   @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-Regular.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-Bold.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-Medium.otf') format('opentype');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-SemiBold.otf') format('opentype');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-RegularItalic.otf') format('opentype');
    font-weight: 400;
    font-style: italic;
  }

  @font-face {
    font-family: 'Brockmann';
    src: url('/fonts/Brockmann-BoldItalic.otf') format('opentype');
    font-weight: 700;
    font-style: italic;
  }


  *, *::before, *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
    padding: 0;
  }

  html, body, #root, #__next {
    height: 100%;
  }

  body {
    font-family: 'Brockmann', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  
  img, picture, video, canvas, svg {
    max-width: 100%;
  }
  
  input {
    border: none;
  }

  svg {
    display: inline;
  }

  input, button, textarea, select {
    font: inherit;
  }

  a {
    color: inherit;
    cursor: pointer;
    text-decoration: none;
  }

  #root {
    isolation: isolate;
  }

  body {
    background: ${getColor('background')};
    color: ${getColor('text')};
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }

  ${themedScrollbars}
`
