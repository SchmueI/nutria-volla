// Search engines panel management module.

class SearchPanel {
  constructor() {
    this.log("constructor");
    this.panel = document.getElementById("search-panel");
    this.ready = false;
    this.panel.addEventListener("panel-ready", this);
    this.enabled = 0;
  }

  log(msg) {
    console.log(`SearchPanel: ${msg}`);
  }

  error(msg) {
    console.error(`SearchPanel: ${msg}`);
  }

  handleEvent(event) {
    if (event.type === "panel-ready") {
      this.init();
    } else if (event.type === "sl-select") {
      this.updateChoice(event.detail.item);
    } else {
      this.error(`Unexpected event: ${event.type}`);
    }
  }

  async updateChoice(item) {
    this.log(`updateChoice ${item.value.meta.name}`);
    if (item.checked) {
      item.value.addTag("enabled");
      this.enabled += 1;
    } else {
      item.value.removeTag("enabled");
      this.enabled -= 1;
    }

    this.okBtn.disabled = this.alert.open = this.enabled === 0;
  }

  async init() {
    this.log(`init ready=${this.ready}`);
    if (this.ready) {
      return;
    }

    this.alert = this.panel.querySelector("sl-alert");
    this.okBtn = this.panel.querySelector(".panel-ok");

    let menu = this.panel.querySelector("sl-menu");

    await contentManager.as_superuser();

    let rendered = new Set();
    this.openSearch = contentManager.getOpenSearchManager((items) => {
      for (let item of items) {
        let meta = item.meta;
        if (rendered.has(meta.name)) {
          continue;
        }
        rendered.add(meta.name);

        this.log(`Adding ${meta.name} ${meta.tags}`);
        let json = item.variant("default").OpenSearchDescription;
        let menuItem = document.createElement("sl-menu-item");
        menuItem.setAttribute("type", "checkbox");
        menuItem.checked = meta.tags.includes("enabled");
        if (menuItem.checked) {
          this.enabled += 1;
        }
        menuItem.value = item;
        menuItem.innerHTML = `<div class="name"></div><div class="desc"></div>
        <img src="${item.variantUrl("icon")}" slot="prefix"/>`;

        menuItem.querySelector(".name").textContent =
          json.LongName?._text || json.ShortName?._text;
        menuItem.querySelector(".desc").textContent = json.Description?._text;

        menu.append(menuItem);
      }

      this.okBtn.disabled = this.alert.open = this.enabled === 0;
    });
    await this.openSearch.init();

    menu.addEventListener("sl-select", this);

    this.ready = true;
  }
}

const searchPanel = new SearchPanel();
