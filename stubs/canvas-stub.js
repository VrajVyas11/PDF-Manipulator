// Minimal stub for pdfjs-dist's NodeCanvasFactory—returns a dummy canvas object
const config = {
  createCanvas: (width, height) => ({
    width,
    height,
    getContext: () => ({
      // No-op context for server; browser uses native
      drawImage: () => {},
      // Add other methods if pdfjs errors later, but this covers basics
    }),
  }),
  // For completeness, stub other common exports
  createPDF: () => ({}),
};

export default config;