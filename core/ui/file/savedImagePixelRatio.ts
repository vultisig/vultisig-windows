/**
 * Pixel ratio every saved or shared image is rendered at, whatever the
 * screen's devicePixelRatio. At 1x a dense keysign QR (version 30, 137
 * modules in 240px) gets under 2px per module and no longer decodes on
 * upload; at 3x it gets about 5px.
 */
export const savedImagePixelRatio = 3
