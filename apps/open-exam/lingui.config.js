module.exports = {
  locales: ["en"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "locales/{locale}/messages",
      include: ["pages", "components"],
    },
  ],
  format: "po",
};
