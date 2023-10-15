// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // head要素の設定
  app: {
    head: {
      htmlAttrs: {
        lang: "ja",
      },
      meta: [
        // noindexの設定
        { name: "robots", content: "noindex" },
      ],
    },
  },
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxtjs/tailwindcss"],
});
