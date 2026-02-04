import { sleep } from "@/core/Utility";

let ptabId = -1;
let curTab = -1;
export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    // temp hack for firefox until:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1463402
    // https://phabricator.services.mozilla.com/D262584
    const tabs = await browser.tabs.query({ active: true });
    const tab = tabs[0];
    if (request === "videoended") {
      if (tab?.id == ptabId) {
        browser?.tabs.remove(ptabId);
        ptabId = -1;
      }
    }
    if (request === "enterpip") {
      if (tab?.id != curTab && curTab != -1) {
        return;
      }
      curTab = tab?.id ?? -1;
      await sleep(200);
      const ntab = await browser?.tabs.create({

      });
      await sleep(1000);
      if (ptabId && ptabId != -1)
        browser?.tabs.remove(ptabId);

      ptabId = ntab?.id ?? -1;
    }
  });
});
