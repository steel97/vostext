export const waitForElement = (selector: string, base = document): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = base.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutationsList, observer) => {
      const foundElement = base.querySelector(selector);
      if (foundElement) {
        observer.disconnect();
        resolve(foundElement);
      }
    });

    observer.observe(base.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element with selector: ${selector}`));
    }, 10000);
  });
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const enterPip = async (videoElement: HTMLVideoElement, fromLoop = false) => {
  try {
    if (!fromLoop)
      videoElement.focus();

    if (videoElement.requestPictureInPicture) {
      videoElement.requestPictureInPicture();
      return;
    }

    if (fromLoop) {
      return;
    }

    browser.runtime.sendMessage("enterpip");
  }
  catch (e) {
    console.error(e);
  }
};
