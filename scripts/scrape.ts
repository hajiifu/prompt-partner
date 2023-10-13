import jsdom from "jsdom";
import fs from "fs";
import path from "path";

const jsDOM = new jsdom.JSDOM();
const parser = new jsDOM.window.DOMParser();

// TODO: ぐちゃぐちゃなのでリファクタリングする
export default async function () {
  fetch(process.env.SCRIPT_URL || "")
    .then((res) => {
      return res.text();
    })
    .then((text) => {
      const html = parser.parseFromString(text, "text/html");
      const scriptBody = html.querySelector("div#write");

      // scriptBody配下の要素を取得する
      const scriptBodyChildren = Array.from(scriptBody?.children!).slice(3);

      // 見出し2が幕、見出し3が場になっているので、出現するごとにグルーピングする
      let acts = scriptBodyChildren.reduce((acc: any, cur: any) => {
        if (cur.tagName === "H2") {
          acc.push([cur]);
        } else {
          acc[acc.length - 1].push(cur);
        }
        return acc;
      }, []);

      acts = acts.map((act: any) => {
        const scenes = act.reduce((acc: any, cur: any) => {
          if (cur.tagName === "H2") {
            return acc;
          } else if (cur.tagName === "H3") {
            acc.push([cur]);
          } else {
            acc[acc.length - 1].push(cur);
          }
          return acc;
        }, []);
        return scenes;
      });

      const scriptData = acts.map((group: HTMLElement[][], i: number) => {
        const value = group.map((el) => {
          return el
            .map((el) => {
              const type = el.querySelector("strong")
                ? "dialogue"
                : el.querySelector("em")
                ? "direction"
                : "unknown";
              let text: string | string[] =
                el.querySelectorAll("span")[type === "dialogue" ? 1 : 0]
                  .textContent!;
              if (type === "dialogue") {
                text = text.split("。").filter((val: string) => val !== "");
              } else if (type === "direction") {
                text = [text];
              }
              return {
                text,
                type,
                role: el.querySelector("strong")?.textContent,
              };
            })
            .filter((el) => el.type !== "unknown");
        });
        return value;
      });

      // scripts.jsonとしてファイルに書き出す
      const scriptsJson = JSON.stringify(scriptData, null, 2);
      const wpath = path.resolve(__dirname, "../assets/scripts.json");
      console.log("write:", wpath);
      fs.writeFileSync(wpath, scriptsJson);
    });
}
