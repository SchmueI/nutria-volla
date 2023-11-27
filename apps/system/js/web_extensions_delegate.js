// WebExtensions delegate implementation.

export class WebExtensionsDelegate {
  constructor() {
    this.log(`constructor`);

    this.queuedBrowserActions = [];

    let container = document.querySelector("quick-settings");
    container.addEventListener("quick-settings-connected", () => {
      this.queuedBrowserActions.forEach(
        ({ extensionId, browsingContextGroupId, tabId, action }) => {
          this.updateBrowserAction(
            extensionId,
            browsingContextGroupId,
            tabId,
            action
          );
        }
      );
      this.queuedBrowserActions = [];
    });
  }

  log(msg) {
    console.log(`WebExtensionsDelegate: ${msg}`);
  }

  error(msg) {
    console.error(`WebExtensionsDelegate: ${msg}`);
  }

  // The extension object looks like:
  // {
  //   "webExtensionId": "uBlock0@raymondhill.net",
  //   "locationURI": "https://addons.mozilla.org/firefox/downloads/file/4141256/ublock_origin-1.51.0.xpi",
  //   "isBuiltIn": false,
  //   "metaData": {
  //     "origins": [
  //       "<all_urls>",
  //       "http://*/*",
  //       "https://*/*",
  //       "file://*/*",
  //       "https://easylist.to/*",
  //       "https://*.fanboy.co.nz/*",
  //       "https://filterlists.com/*",
  //       "https://forums.lanik.us/*",
  //       "https://github.com/*",
  //       "https://*.github.io/*",
  //       "https://*.letsblock.it/*"
  //     ],
  //     "promptPermissions": [
  //       "privacy",
  //       "tabs",
  //       "webNavigation"
  //     ],
  //     "description": "Finally, an efficient blocker. Easy on CPU and memory.",
  //     "enabled": false,
  //     "temporary": false,
  //     "disabledFlags": [],
  //     "version": "1.51.0",
  //     "creatorName": "Raymond Hill & contributors",
  //     "name": "uBlock Origin",
  //     "optionsPageURL": null,
  //     "openOptionsPageInTab": false,
  //     "isRecommended": true,
  //     "blocklistState": 0,
  //     "signedState": 2,
  //     "icons": {
  //       "16": "jar:file:///tmp/tmp-f27.xpi!/img/ublock.svg",
  //       "32": "jar:file:///tmp/tmp-f27.xpi!/img/ublock.svg",
  //       "48": "jar:file:///tmp/tmp-f27.xpi!/img/ublock.svg",
  //       "64": "jar:file:///tmp/tmp-f27.xpi!/img/ublock.svg",
  //       "96": "jar:file:///tmp/tmp-f27.xpi!/img/ublock.svg"
  //     },
  //     "baseURL": "",
  //     "privateBrowsingAllowed": false
  //   }
  // }
  permissionPrompt(extension) {
    this.log(`permissionPrompt`);
    console.log(extension);
    // TODO: Install prompt UI.
    return Promise.resolve();
  }

  setProvider(provider) {
    this.log(`setProvider`);
    this.provider = provider;
  }

  // BrowserAction support.
  updateBrowserAction(extensionId, browsingContextGroupId, tabId, action) {
    this.log(`updateBrowserAction ${extensionId}`);

    let container = document.querySelector("quick-settings");
    if (!container?.getBrowserAction) {
      this.error(`browserAction panel not ready yet!`);
      this.queuedBrowserActions.push({
        extensionId,
        browsingContextGroupId,
        tabId,
        action,
      });
      return;
    }

    // If that update is not targetted to the currently active web-view, ignore it.
    if (wm.currentWebExtensionTabId && wm.currentWebExtensionTabId() != tabId) {
      return;
    }

    let baNode = container.getBrowserAction(extensionId);
    if (baNode) {
      // Update existing node.
      baNode.setAction(action);
    } else {
      this.log(`Creating new browser action, badgeText=${action?.badgeText}`);
      let node = new BrowserAction(extensionId, tabId, action);
      container.addBrowserAction(extensionId, node);
      node.addEventListener("click", () => {
        if (!node.action.enabled) {
          return;
        }
        this.log(`click on ${extensionId}`);
        if (action.popup) {
          // Close the quick settings if needed.
          actionsDispatcher.dispatch("hide-quick-settings");

          // Open the modal browser action popup.
          let popup = document.querySelector("webext-browser-action");
          popup.setAction(node.action, browsingContextGroupId);
          popup.show();
        } else {
          // Dispatch a click event.
          this.provider?.browserActionClick(extensionId);
        }
      });
    }
  }

  // Tabs support.

  // Create a new tab with a url. Parameters are:
  // extensionId,
  // createProperties: {
  //   active,
  //   cookieStoreId,
  //   discarded,
  //   index,
  //   openInReaderMode,
  //   pinned,
  //   url,
  // },
  async createNewTab({
    /*extensionId, browsingContextGroupId,*/ createProperties,
  } = {}) {
    this.log(`createNewTab ${createProperties.url}`);
    try {
      let { url, active } = createProperties;
      // TODO: Deal with more parameters.
      let webView = window.wm.openFrame(url, {
        activate: active,
      });
      return webView;
    } catch (e) {
      console.error(`Failed to create frame: ${e}`);
    }
  }

  // nativeTab is the <web-view> element.
  // updateProperties is:
  // {
  //   active,
  //   autoDiscardable,
  //   highlighted,
  //   muted,
  //   pinned,
  //   url,
  // }
  async updateTab({ nativeTab, extensionId, updateProperties } = {}) {
    this.log(`updateTab`);
    // Supported actions are:
    // - setting `active` to `true`.
    // Note: changing the url is handled by the calling code already.
    if (updateProperties.active === true) {
      window.wm.switchToWebView(nativeTab);
    }
  }
}
