<template>
  <div class="avext-main-panel dark">
    <UApp>
      <div>
        <div class="flex gap-4 justify-between flex-col">
          <div class="flex gap-2 pt-1 justify-between">
            <USwitch v-model="autoNextEpisode" label="Переключатель серий" />
            <USwitch v-model="secondPlayer" label="Второй плеер" />
            <USwitch v-model="fullscreen" label="Полный экран" />
            <USwitch v-model="pip" label="PiP" />
          </div>
          <div class="flex gap-2 justify-between">
            <div class="text-primary text-sm pt-1 hidden">Скорость</div>
            <UTabs v-model="speed" :valueKey="'value'" size="xs" :items="items"></UTabs>
            <div class="flex gap-2">
              <UButton size="sm" olor="neutral" variant="outline" @click="skip">Промотать 1.5 минуты
              </UButton>
            </div>
          </div>
        </div>
        <div class="text-sm text-primary mt-2">VostExt {{ version }}</div>
      </div>
    </UApp>
  </div>
</template>

<script lang="ts" setup>
import { enterPip, sleep, waitForElement } from "@/core/Utility";

const version = ref(APP_VERSION);

// settings
const autoNextEpisode = ref(false);
const secondPlayer = ref(false);
const pip = ref(false);
const fullscreen = ref(false);
const speed = ref(1.0);
// end

onMounted(() => {
  // load settings
  autoNextEpisode.value = localStorage.getItem("vostext.autoNextEpisode") === "true";
  secondPlayer.value = localStorage.getItem("vostext.secondPlayer") === "true";
  pip.value = localStorage.getItem("vostext.pip") === "true";
  fullscreen.value = localStorage.getItem("vostext.fullscreen") === "true";
  speed.value = parseFloat(localStorage.getItem("vostext.speed") || "1.0");

  // subscribe on episode buttons
  document.querySelectorAll(".epizode")?.forEach(a => {
    (a as HTMLElement).addEventListener("click", async () => {
      await sleep(500);
      await onEpisodeSwitch();
    });
  });

  // initialize extension
  onEpisodeSwitch();
  setTimeout(() => {
    watchPlayerState();
  }, 1000);
});

const checkEventSubscription = async () => {
  const player = getVideoPlayer();

  if (player?.hasAttribute("__vostevt")) {
    return;
  }

  player?.setAttribute("__vostevt", "true");

  // subscribe to events
  player?.addEventListener("enterpictureinpicture", (ev) => {
    player?.setAttribute("__vostpip", "true");
  });

  player?.addEventListener("leavepictureinpicture", (ev) => {
    player?.removeAttribute("__vostpip");
  });

  console.log("subscribing to events");
  player?.addEventListener("play", (ev) => {
    // prepare pip & fullscreen
    if (player != null) {
      if (pip.value) {
        enterPip(player);
      }

      if (fullscreen.value) {
        player.requestFullscreen();
      }
    }
  });

  player?.addEventListener("fullscreenchange", async (ev) => {
    if (!document.fullscreenElement) {
      console.log("manually exited full screen");
      player.setAttribute("__vostnofs", "true");
    }
  });

  player?.addEventListener("ended", async (ev) => {
    browser.runtime.sendMessage("videoended");
    if (!autoNextEpisode.value) {
      return;
    }

    // try next episode
    let foundCurrent = false;
    for (const el of document.querySelectorAll(".epizode")) {
      const current = el.classList.contains("active");
      if (current) {
        foundCurrent = true;
        continue;
      }

      if (foundCurrent) {
        (el as HTMLElement).click();
        await sleep(2000);
        // try to play
        let a = 0;
        while (a < 120) {
          a++;
          await sleep(1000);
          const player = getVideoPlayer();
          if (player != null) {
            if (player.ended) continue;
            player.currentTime = 0; // TO-DO, another config var?
            player.play();
            break;
          }
        }

        break;
      }
    }

  });
};

const onEpisodeSwitch = async () => {
  if (secondPlayer.value) {
    await switchToSecondPlayer();
  }

  await sleep(500);
  const iframe = await waitForElement("#player2 > iframe") as HTMLIFrameElement;
  let iframeDocument: Document | undefined = undefined;
  while (true) {
    iframeDocument = iframe.contentWindow?.document;
    const url = iframeDocument?.URL;
    if (url != "about:blank") {
      break;
    }
    await sleep(500);
  }

  checkEventSubscription();
};

watch(autoNextEpisode, (value) => {
  localStorage.setItem("vostext.autoNextEpisode", value ? "true" : "false");
});

watch(secondPlayer, (value) => {
  localStorage.setItem("vostext.secondPlayer", value ? "true" : "false");

  // save current timing
  const player = getVideoPlayer();
  if (value) {
    const pos = player?.currentTime;
    switchToSecondPlayer(pos ?? -1);
  }
});

watch(pip, (value) => {
  localStorage.setItem("vostext.pip", value ? "true" : "false");
});

watch(fullscreen, (value) => {
  localStorage.setItem("vostext.fullscreen", value ? "true" : "false");
});

watch(speed, (value) => {
  localStorage.setItem("vostext.speed", value.toString());
});

const skip = () => {
  const player = getVideoPlayer();
  if (player == null) return;
  const time = player.currentTime + 90;
  player.currentTime = time;

};

const getVideoPlayer = () => {
  const iframe = document.querySelector("#player2 > iframe") as HTMLIFrameElement | null;
  const iframeDocument = iframe?.contentWindow?.document;

  const videoPre = iframeDocument?.querySelector("video");
  if (videoPre == null || videoPre == undefined) return null;
  const video = videoPre as HTMLVideoElement;
  return video;
};

const watchPlayerState = async () => {
  while (true) {
    try {
      const video = getVideoPlayer();
      if (video != null) {
        checkEventSubscription();

        if (video.playbackRate != speed.value) {
          video.playbackRate = speed.value;
        }

        if (pip.value && !video.hasAttribute("__vostpip")) {
          await enterPip(video, true);
        }

        if (fullscreen.value && !document.fullscreenElement && !video.hasAttribute("__vostnofs")) {
          video.requestFullscreen();
        }
      }
    } catch {

    }
    await sleep(1000);
  }
};

const switchToSecondPlayer = async (seekTo = -1) => {
  console.log("== switching to second player start");
  const iframe = await waitForElement("#player2 > iframe") as HTMLIFrameElement;
  let iframeDocument: Document | undefined = undefined;
  while (true) {
    iframeDocument = iframe.contentWindow?.document;
    const url = iframeDocument?.URL;
    if (url != "about:blank") {
      break;
    }
    await sleep(500);
  }

  const pl2 = await waitForElement("#pl2", iframeDocument) as HTMLElement;
  pl2?.click();

  if (seekTo != -1) {
    // wait for new player to appear
    await sleep(200);
    const iframe = await waitForElement("#player2 > iframe") as HTMLIFrameElement;
    let iframeDocument: Document | undefined = undefined;
    while (true) {
      iframeDocument = iframe.contentWindow?.document;
      const url = iframeDocument?.URL;
      if (url != "about:blank") {
        break;
      }
      await sleep(500);
    }
    const player = getVideoPlayer();
    if (player != null) {
      player.currentTime = seekTo;
    }
  }

  console.log("== switching to second player end");
};

const items = [
  {
    value: 0.5,
    label: "x0.5"
  },
  {
    value: 1.0,
    label: "x1.0"
  },
  {
    value: 2.0,
    label: "x2.0"
  },
  {
    value: 3.0,
    label: "x3.0"
  }
];
</script>

<style scoped>
.avext-main-panel {
  /*background-color: rgb(8, 145, 255);*/
  padding: 1rem;
  padding-left: 1.0rem;
  padding-right: 1.0rem;
  background: rgb(27, 27, 27);
}
</style>
