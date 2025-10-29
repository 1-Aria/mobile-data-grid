// react-window.d.ts

// This file tells TypeScript that the 'react-window' module 
// exports a component named FixedSizeList, regardless of its internal structure.

declare module 'react-window' {
  export { FixedSizeList } from 'react-window/dist/index';
  // You can add other named exports here if needed (e.g., VariableSizeList)
}