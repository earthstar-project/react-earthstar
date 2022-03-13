import ts from "rollup-plugin-ts";

export default {
  input: "./src/index.ts",
  external: ["earthstar", "react"],
  plugins: [
    ts({}),
  ],
  output: [
    {
      file: "./dist/react-earthstar.cjs",
      format: "cjs",
    },
    {
      file: "./dist/react-earthstar.mjs",
      format: "es",
    },
    {
      file: "./dist/react-earthstar.js",
      format: "es",
    },
  ],
};
