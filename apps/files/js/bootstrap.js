const kDeps = [
  {
    name: "main",
    kind: "virtual",
    deps: [
      "main screen",
      "activity manager",
      "shoelace-light-theme",
      "shoelace-setup",
    ],
  },
  {
    name: "lit element",
    kind: "sharedModule",
    param: ["components/lit.js", ["LitElement", "html", "css"]],
  },
  {
    name: "main screen",
    kind: "module",
    param: ["./components/main_screen.js"],
    deps: [
      "lit element",
      "content manager",
      "shoelace-icon",
      "shoelace-icon-button",
      "shoelace-button",
      "shoelace-breadcrumb",
      "shoelace-breadcrumb-item",
      "shoelace-dropdown",
      "shoelace-menu",
      "shoelace-menu-item",
    ],
  },
  {
    name: "api daemon core",
    kind: "sharedWindowModule",
    param: ["js/api_daemon.js", "apiDaemon", "ApiDaemon"],
  },
  {
    name: "content manager",
    kind: "sharedWindowModule",
    param: ["js/content_manager.js", "contentManager", "ContentManager"],
    deps: ["api daemon core"],
  },
  {
    name: "activity manager",
    kind: "sharedModule",
    param: ["js/activity_manager.js", ["ActivityManager"]],
  },
  {
    name: "directory picker",
    kind: "module",
    param: ["./components/directory_picker.js"],
    deps: [
      "shoelace-drawer",
      "shoelace-button",
      "shoelace-tree",
      "shoelace-tree-item",
    ],
  },
];

function log(msg) {
  console.log(`Files: ${msg}`);
}

let ready;
let _p = new Promise((resolve) => {
  ready = resolve;
});

var graph;

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    log(`DOMContentLoaded`);
    await depGraphLoaded;

    graph = new ParallelGraphLoader(addSharedDeps(addShoelaceDeps(kDeps)));
    await Promise.all(
      ["shared-fluent", "shared-api-daemon", "main"].map((dep) =>
        graph.waitForDeps(dep)
      )
    );

    // Configure activity handlers.
    let activities = new ActivityManager({
      "view-resource": activityViewResource,
      pick: activityPick,
    });

    await contentManager.as_superuser();

    log(`Starting at ${document.location}`);

    if (document.location.hash == "") {
      document.querySelector("main-screen").openRoot();
    }

    ready();
  },
  { once: true }
);

async function ensureReady() {
  await ready;
  await contentManager.as_superuser();
}

async function activityViewResource(data) {
  await ensureReady();
  log(`activityViewResource ${data.id}`);
  history.replaceState(data, "");
  document.querySelector("main-screen").switchTo(data, true);
}

async function activityPick(data) {
  await ensureReady();
  let mainScreen = document.querySelector("main-screen");
  let defered = {};
  let p = new Promise((resolve, reject) => {
    defered = { resolve, reject };
  });
  mainScreen.enterFilePickerMode(data, defered);
  mainScreen.openRoot();
  return p;
}
