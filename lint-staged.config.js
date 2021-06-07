module.exports = {
  "**/*.ts?(x)": (filenames) =>
    filenames.length > 10
      ? "yarn lint"
      : `eslint --format stylish ${filenames.join(" ")}`
};
