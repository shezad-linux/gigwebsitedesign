let tailwindPlugin = "tailwindcss";
try {
  require.resolve("@tailwindcss/postcss");
  tailwindPlugin = "@tailwindcss/postcss";
} catch {
  tailwindPlugin = "tailwindcss";
}

module.exports = {
  plugins: {
    [tailwindPlugin]: {},
    autoprefixer: {},
  },
};
