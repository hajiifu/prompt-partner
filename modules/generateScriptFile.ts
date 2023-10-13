import { defineNuxtModule } from "@nuxt/kit";
import scrape from "../scripts/scrape";

/**
 *
 * 本文まるごとgitに載せるわけにはいかないので、ビルド時にスクレイピングして、
 * ホスティング用アセットにjsonファイルを生成する
 *
 */
export default defineNuxtModule((_, nuxt) => {
  nuxt.hook("build:before", async () => {
    // do something
    console.log("build:before");
    console.log("fetch and generate script file");
    await scrape();
    console.log("done!!");
  });
});
