// Represents a <lock-screen> element.

// Manages the display of the lock value,
// hiding the characters after a delay like
// for a password field.
class LockValue {
  constructor(node) {
    this.node = node;
    this.value = "";
    this.display = "";
    this.updateDom();
  }

  updateDom() {
    this.node.textContent = this.display;

    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.display = "\u2022".repeat(this.display.length);
      this.node.textContent = this.display;
    }, 500);
  }

  reset() {
    this.value = "";
    this.display = "";
    this.updateDom();
  }

  add(val) {
    if (this.value.length >= 8) {
      return;
    }

    this.value += val;
    this.display += val;
    this.updateDom();
  }

  delete() {
    // Remove the last digit.
    let currentLength = this.value.length;
    if (currentLength === 0) {
      return;
    }

    this.value = this.value.substr(0, currentLength - 1);
    this.display = this.display.substr(0, currentLength - 1);
    this.updateDom();
  }

  get() {
    return this.value;
  }
}

class LockScreen extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
    <link rel="stylesheet" href="components/lock_screen.css">
    <div class="container">
      <div class="left">
        <sl-icon name="flashlight-off" class="flashlight"></sl-icon>
      </div>
      <div class="center">
        <div class="clock">
          <div class="time"></div>
          <div class="date"></div>
        </div>
        <div class="slider">
          <div class="slider-fill">
            <sl-icon name="chevron-up"></sl-icon>
          </div>
          <div class="lockpad">
            <div class="code-display">
              <div class="value"></div>
              <div class="wrong-pin" data-l10n-id="lockscreen-wrong-pin"></div>
              <sl-icon name="delete" class="delete-key"></sl-icon>
            </div>
            <div class="digit" data-digit="1">1</div>
            <div class="digit" data-digit="2">2<div class="letters">abc</div></div>
            <div class="digit" data-digit="3">3<div class="letters">def</div></div>
            <div class="digit" data-digit="4">4<div class="letters">ghi</div></div>
            <div class="digit" data-digit="5">5<div class="letters">jkl</div></div>
            <div class="digit" data-digit="6">6<div class="letters">mno</div></div>
            <div class="digit" data-digit="7">7<div class="letters">pqrs</div></div>
            <div class="digit" data-digit="8">8<div class="letters">tuv</div></div>
            <div class="digit" data-digit="9">9<div class="letters">wxyz</div></div>
            <div class="digit"></div>
            <div class="digit" data-digit="0">0<div class="letters">+</div></div>
            <div class="digit"><sl-icon name="check"></sl-icon></div>
            <div class="emergency-display" data-l10n-id="lockscreen-emergency-call"></div>
          </div>
        </div>
      </div>
      <div class="right">
        <sl-icon name="battery" class="battery-icon"></sl-icon>
        <div class="battery-level"></div>
        <div class="flex-fill"></div>
        <sl-icon name="camera" class="camera"></sl-icon>
      </div>
        
    </div>
    `;

    document.l10n.translateFragment(shadow);

    shadow.querySelector("sl-icon[name=delete]").onclick = () => {
      this.onDelete();
    };

    shadow.querySelector("sl-icon[name=check]").onclick = () => {
      this.onCheck();
    };

    let onDigit = this.onDigit.bind(this);
    shadow.querySelectorAll(".digit").forEach((node) => {
      node.onclick = onDigit;
    });

    // Setup haptic feedback
    shadow
      .querySelectorAll(".digit,.delete-key,.emergency-display")
      .forEach((node) => {
        node.onpointerdown = () => {
          navigator.vibrate(10);
        };
      });

    this.time = shadow.querySelector(".time");
    this.date = shadow.querySelector(".date");

    this.value = new LockValue(shadow.querySelector(".value"));

    this.lockpad = shadow.querySelector(".lockpad");
    let options = {
      root: this.lockpad.parentNode,
      threshold: [0, 0.9],
    };
    let callback = (entries, observer) => {
      entries.forEach(async (entry) => {
        if (!this.enabled && entry.intersectionRatio > 0.9) {
          this.unlock();
        }
      });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(this.lockpad);

    this.initFlashlight();
    window.batteryHelper.addListener(
      "lockscreen",
      shadow.querySelector(".battery-icon"),
      shadow.querySelector(".battery-level")
    );

    shadow.querySelector(".camera").onclick = () => {
      this.launch(`http://camera.localhost:${config.port}/index.html`);
    };

    this.clockTimer = new MinuteTimer();
    this.clockTimer.addEventListener("tick", () => {
      this.updateTimeAndDate();
    });
  }

  // Launches an app in a lockscreen controlled way.
  // Returns a promise that resolves when the app is closed.
  launch(url, options = {}) {
    return new Promise((resolve) => {
      this.temporaryUnlock();

      // Call into the window manager to launch an app in lockscreen mode.
      window.wm.openFrame(url, {
        activate: true,
        fromLockscreen: true,
        isFtu: options.ftu,
        details: { display: options.ftu ? "fullscreen" : "browser" },
        whenClosed: async () => {
          window.wm.unlockSwipe();
          await this.lock();
          resolve();
        },
      });
      window.wm.lockSwipe();
    });
  }

  initFlashlight() {
    let flIcon = this.shadowRoot.querySelector(".flashlight");
    if (!navigator.b2g?.getFlashlightManager) {
      flIcon.remove();
      return;
    }

    flIcon.addEventListener("click", (event) => {
      event.stopPropagation();
      flashlightManager.toggle();
    });

    actionsDispatcher.addListener(
      "flashlight-state-change",
      (_name, enabled) => {
        if (enabled) {
          flIcon.classList.add("active");
        } else {
          flIcon.classList.remove("active");
        }
        flIcon.setAttribute("kind", enabled ? "flashlight" : "flashlight-off");
      }
    );
  }

  onDelete() {
    this.value.delete();
  }

  onCheck() {
    // TODO: check the lock code.
    console.log(`Unlocking with ${this.value.get()}`);
    this.unlock();
  }

  onDigit(event) {
    let node = event.currentTarget;
    if (!node.hasAttribute("data-digit")) {
      return;
    }

    this.value.add(node.getAttribute("data-digit"));
  }

  updateTimeAndDate() {
    // Manually apply offset to UTC since we have no guarantee that
    // anything else but `UTC` will work in DateTimeFormat.
    let now = Date.now() - new Date().getTimezoneOffset() * 60 * 1000;

    if (!this.timeFormat) {
      this.timeFormat = new Intl.DateTimeFormat("default", {
        hour: "numeric",
        minute: "numeric",
        timeZone: "UTC",
        hour12: false,
      });
    }
    this.time.textContent = this.timeFormat.format(now);

    if (!this.dateFormat) {
      this.dateFormat = new Intl.DateTimeFormat("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    }
    this.date.textContent = this.dateFormat.format(now);
  }

  reset() {
    // Reset the UI state.
    this.value.reset();
    this.shadowRoot.querySelector(".slider").scrollTo(0, 0);
  }

  // Unlock temporarily, when opening a "lockscreen app"
  temporaryUnlock() {
    this.reset();

    this.classList.add("unlocked");
    actionsDispatcher.dispatch("lockscreen-unlocked");
    this.clockTimer.suspend();
  }

  async unlock() {
    let service = await apiDaemon.getSettings();
    let expected = "0000";
    try {
      let settingInfo = await service.get("lockscreen.code");
      expected = settingInfo.value;
    } catch (e) {}

    if (this.enabled && this.value.get() !== expected) {
      let node = this.shadowRoot.querySelector(".code-display");
      node.classList.add("error");
      this.value.reset();
      window.setTimeout(() => {
        node.classList.remove("error");
      }, 1000);
      return;
    }

    this.reset();

    this.classList.add("unlocked");
    actionsDispatcher.dispatch("lockscreen-unlocked");
    this.clockTimer.suspend();
  }

  async lock() {
    // Force closing the virtual keyboard if it was opened.
    try {
      inputMethod.close();
    } catch (e) {}

    actionsDispatcher.dispatch("lockscreen-locked");
    this.reset();

    let service = await apiDaemon.getSettings();
    // Default to disabled, since we can't expect users to know
    // a default lock code.
    this.enabled = false;
    try {
      let settingInfo = await service.get("lockscreen.enabled");
      this.enabled = settingInfo.value;
    } catch (e) {}
    if (!this.enabled) {
      this.lockpad.classList.add("disabled");
    } else {
      this.lockpad.classList.remove("disabled");
    }

    this.updateTimeAndDate();
    this.clockTimer.resume();

    this.classList.remove("unlocked");
  }

  isLocked() {
    return !this.classList.contains("unlocked");
  }

  setBackground(background) {
    if (background.startsWith("url(")) {
      this.style.backgroundImage = background;
    } else {
      this.style.background = background;
    }
  }
}

customElements.define("lock-screen", LockScreen);
