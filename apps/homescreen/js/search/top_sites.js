// Top sites search module.

class TopSites {
  constructor() {
    if (topSites) {
      topSites.push("about:processes");
    }
  }

  // Returns a Promise that resolves to a result set.
  search(what, count) {
    if (!topSites) {
      return Promise.resolve([]);
    }

    let res = [];
    let i = 0;
    while (res.length < count && i < topSites.length) {
      if (topSites[i].includes(what)) {
        res.push(topSites[i]);
      }
      i += 1;
    }

    // Reverse result order to better fit the UI and display the first
    // results closer to the keyboard.
    return Promise.resolve(res.reverse());
  }
}

class TopSitesSource extends SearchSource {
  constructor(sectionName) {
    super(sectionName, new TopSites());
  }

  domForResult(result) {
    let node = document.createElement("li");
    node.textContent = result;
    return node;
  }

  activate(result) {
    maybeOpenURL(result);
  }
}
