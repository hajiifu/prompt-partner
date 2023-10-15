<script setup lang="ts">
import scriptsData from "./assets/scripts.json";

/*

  戯曲データ

*/
const scripts = ref(scriptsData);
const actIdx = ref(0);
const currentAct = computed(() => scripts.value[actIdx.value]);
const sceneIdx = ref(0);
const currentScene = computed(() => currentAct.value[sceneIdx.value]);
const nodeIdx = ref(0);
const currentNode = computed(() => currentScene.value[nodeIdx.value]);
const lineIdx = ref(0);
const currentLine = computed(() => currentNode.value.text[lineIdx.value]);

const role = ref("ピエール");
const roles = ref(["ピエール", "M.L.H.", "V", "VI", "m.l.h.", "なし"]);

/*

  操作

*/
const next = () => {
  // 自分の役だったら、次のnodeに進む
  // 最後のNodeなら次のシーンに進む
  // 最後のシーンなら次の幕に進む
  if (role.value === currentNode.value.role) {
    if (nodeIdx.value < currentScene.value.length - 1) {
      nodeIdx.value++;
      lineIdx.value = 0;
    } else if (sceneIdx.value < currentAct.value.length - 1) {
      sceneIdx.value++;
      nodeIdx.value = 0;
      lineIdx.value = 0;
    } else if (actIdx.value < scripts.value.length - 1) {
      actIdx.value++;
      sceneIdx.value = 0;
      nodeIdx.value = 0;
      lineIdx.value = 0;
    }
    return;
  }

  // 次の行に進む
  // 行の最後なら次のNodeに進む
  // 最後のNodeの最後の行なら次のシーンに進む
  // 最後のシーンなら次の幕に進む
  if (lineIdx.value < currentNode.value.text.length - 1) {
    lineIdx.value++;
  } else if (nodeIdx.value < currentScene.value.length - 1) {
    nodeIdx.value++;
    lineIdx.value = 0;
  } else if (sceneIdx.value < currentAct.value.length - 1) {
    sceneIdx.value++;
    nodeIdx.value = 0;
    lineIdx.value = 0;
  } else if (actIdx.value < scripts.value.length - 1) {
    actIdx.value++;
    sceneIdx.value = 0;
    nodeIdx.value = 0;
    lineIdx.value = 0;
  }
};
const prev = () => {
  // 自分の役だったら、次のnodeに進む
  // 最後のNodeなら次のシーンに進む
  // 最後のシーンなら次の幕に進む
  if (role.value === currentNode.value.role) {
    if (nodeIdx.value > 0) {
      nodeIdx.value--;
      lineIdx.value = 0;
    } else if (sceneIdx.value > 0) {
      sceneIdx.value--;
      nodeIdx.value = 0;
      lineIdx.value = 0;
    } else if (actIdx.value > 0) {
      actIdx.value--;
      sceneIdx.value = 0;
      nodeIdx.value = 0;
      lineIdx.value = 0;
    }
    return;
  }

  // 次の行に進む
  // 行の最後なら次のNodeに進む
  // 最後のNodeの最後の行なら次のシーンに進む
  // 最後のシーンなら次の幕に進む
  if (lineIdx.value > 0) {
    lineIdx.value--;
  } else if (nodeIdx.value > 0) {
    nodeIdx.value--;
    lineIdx.value = 0;
  } else if (sceneIdx.value > 0) {
    sceneIdx.value--;
    nodeIdx.value = 0;
    lineIdx.value = 0;
  } else if (actIdx.value > 0) {
    actIdx.value--;
    sceneIdx.value = 0;
    nodeIdx.value = 0;
    lineIdx.value = 0;
  }
};

// currentLineが変わったときに音声出力する
const isStarted = ref(false);
const start = () => {
  if (isStarted.value) return;
  isStarted.value = true;

  utrance.text = currentLine.value;
  speechSynthesis.speak(utrance);
};
const stop = () => {
  isStarted.value = false;
  speechSynthesis.cancel();
};

/*

  音声出力

*/
const utrance = new SpeechSynthesisUtterance();
utrance.lang = "ja-JP";
utrance.onend = () => {
  next();
};
// リロード時に再生中の音声キャンセル
speechSynthesis.cancel();

watch(currentLine, (line) => {
  if (isStarted.value === false) return;
  if (role.value === currentNode.value.role) {
    speechSynthesis.cancel();
    return;
  }

  // 発話の途中だったら停止して新しいテキストを読み上げる
  speechSynthesis.cancel();
  setTimeout(() => {
    utrance.text = line;
    speechSynthesis.speak(utrance);
  }, 100);
});

/*

  起動ロックを使って、セリフを聞き続けている間画面がロックされないようにする

*/
let wakeLock: null | WakeLockSentinel = null;
onMounted(() => {
  if ("wakeLock" in navigator) {
    navigator.wakeLock
      .request("screen")
      .then((_wakeLock) => {
        wakeLock = _wakeLock;
        console.log("wakeLock", wakeLock);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // タブの表示切り替えで一度非表示になったあと戻ってきたとき、再度ロックする

  document.addEventListener("visibilitychange", async () => {
    if (wakeLock !== null && document.visibilityState === "visible") {
      wakeLock = await navigator.wakeLock.request("screen");
    }
  });
});
</script>
<template>
  <main class="h-screen bg-slate-800 text-white flex flex-col">
    <div class="min-h-24 xs:flex-col md:flex justify-between p-4">
      <div class="flex items-center gap-x-4">
        <button
          type="button"
          class="bg-teal-400 text-lg p-4 w-48"
          @click="start"
        >
          start
        </button>
        <button
          type="button"
          class="outline border-white text-lg p-4 w-48"
          @click="stop"
        >
          stop
        </button>

        <!-- 再生中はアニメーションしている -->
        <div
          class="ml-8 w-12 h-12 text-lg rounded-full bg-teal-400 flex justify-center items-center"
          v-if="isStarted"
        >
          playing
        </div>
      </div>

      <div class="flex-col gap-x-4">
        <label class="flex flex-col">
          配役
          <select
            v-model="role"
            name="roles"
            id="role-selector"
            class="text-black w-48 px-4 grow"
          >
            <option v-for="role in roles" :key="role">{{ role }}</option>
          </select>
        </label>
        <label class="flex flex-col">
          Act
          <select
            v-model="actIdx"
            name="acts"
            id="act-selector"
            class="text-black w-48 px-4 grow"
            @change="
              nodeIdx = 0;
              lineIdx = 0;
            "
          >
            <option v-for="(_, i) in scripts" :value="i">
              {{ `Act ${i + 1}` }}
            </option>
          </select>
        </label>
        <label class="flex flex-col">
          Scene
          <select
            v-model="sceneIdx"
            name="scenes"
            id="scene-selector"
            class="text-black w-48 px-4 grow"
            @change="
              nodeIdx = 0;
              lineIdx = 0;
            "
          >
            <option v-for="(_, i) in currentAct" :value="i">
              {{ `Scene ${i + 1}` }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <div
      class="grow overflow-y-scroll flex justify-center items-center relative"
    >
      <div class="w-3/4 text-center text-2xl">
        <p>
          <template v-if="currentNode.type === 'dialogue'">
            <b class="mr-8">
              {{ currentNode.role }}
            </b>
            <span v-if="role !== currentNode.role">
              {{ currentLine }}
            </span>
            <span v-else> &lt;&lt; YOUR TURN!!! &gt;&gt; </span>
          </template>
          <!-- ト書き -->
          <i v-else>
            {{ currentLine }}
          </i>
        </p>
      </div>

      <div class="absolute top-0 left-0 h-full w-full grid grid-cols-2">
        <button
          aria-label="前へ"
          type="button"
          class="h-full"
          @click="prev"
        ></button>
        <button
          aria-label="次へ"
          type="button"
          class="h-full"
          @click="next"
        ></button>
      </div>
    </div>
  </main>
</template>
