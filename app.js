async function loadApp() {
  await import("./dist/server/entry.mjs");
}

loadApp();
