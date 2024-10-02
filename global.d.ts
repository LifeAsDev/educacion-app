declare global {
  interface Window {
    jQuery: any;
    $: any;
    mathquill4quill: any;
  }
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      >;
    }
  }
}

export {};
