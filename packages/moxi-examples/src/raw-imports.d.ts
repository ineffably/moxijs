/**
 * TypeScript declarations for ?raw imports
 * Webpack with asset/source type returns the file content as a string
 */
declare module '*.ts?raw' {
  const content: string;
  export default content;
}

declare module '*.tsx?raw' {
  const content: string;
  export default content;
}

declare module '*.js?raw' {
  const content: string;
  export default content;
}
