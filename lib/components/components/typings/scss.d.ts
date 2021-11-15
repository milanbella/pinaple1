// Add module types for css modules (see 'typeRoots' in 'tsconfig-lib.json').

declare module '*.css' {
  const content: { [className: string]: string; };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string; };
  export default content;
}
