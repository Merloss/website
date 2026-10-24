const nodes = document.querySelectorAll('pre.mermaid:not([data-processed])');
if (nodes.length) {
  import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: 'var(--font-sans), sans-serif',
      flowchart: { curve: 'basis', padding: 12 },
      themeVariables: {
        darkMode: true,
        fontSize: '12px',
        background: '#0a0a0a',
        primaryColor: '#141414',
        primaryBorderColor: '#ffffff2e',
        primaryTextColor: '#e6edf3',
        secondaryColor: '#141414',
        tertiaryColor: '#141414',
        lineColor: '#ff6a3d',
        edgeLabelBackground: '#0a0a0a',
      },
    });
    mermaid.run({ nodes });
  });
}
