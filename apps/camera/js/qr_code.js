// QR Decoding support.
// TODO: check if we should move that into a Web Worker.

class ConsoleImpl {
  constructor(name) {
    this.name = name;
  }

  consoleLog(msg) {
    console.log(`${this.name}:`, msg);
  }

  consoleError(msg) {
    console.error(`${this.name}:`, msg);
  }
}

export class QrCodeScanner extends EventTarget {
  constructor(cameraManager) {
    super();
    this.cameraManager = cameraManager;
    this.ready = false;
    this.wasmModule = null;
  }

  async start() {
    log(`QR-CODE start`);
    // hide all the controls since we will be in "automatic" mode.
    window["controls"].classList.add("hide-qr-scan");

    // Wait for some data to be loaded in the video preview.
    window.preview.addEventListener(
      "loadeddata",
      () => {
        this.ready = true;
        this.scheduleFrame();
      },
      { once: true }
    );

    await this.initWasmDecoder();
  }

  async initWasmDecoder() {
    const { QrdecoderModule } = await import(
      `http://camera.localhost:${window.config.port}/qrdecoder/qrdecoder_module.js`
    );
    const { addConsoleToImports } = await import(
      `http://camera.localhost:${window.config.port}/qrdecoder/console.js`
    );

    this.module = new QrdecoderModule();

    // TODO: figure out if we can remove these wasm_bindgen imports properly
    // instead of using wasm-opt --remove-imports
    // __wbindgen_placeholder__
    // __wbindgen_describe_*
    let imports = {};

    addConsoleToImports(imports, new ConsoleImpl("QrdecoderModule"), (what) => {
      if (what == "memory") {
        return this.module._exports.memory;
      } else {
        console.error("Unsupport get_export() parameter: ", what);
      }
    });

    await this.module.instantiate(
      fetch(
        `http://camera.localhost:${window.config.port}/qrdecoder/qrdecoder.wasm`
      ),
      imports
    );
  }

  scheduleFrame() {
    window.requestAnimationFrame(() => {
      this.processFrame();
    });
  }

  async processFrame() {
    // Grab a frame, and check if it contains a QR-code.
    // If not, schedule a new frame capture.
    if (!this.ready || this.cameraManager?.currentCamera == -1) {
      this.scheduleFrame();
      return;
    }

    try {
      let bitmap = await createImageBitmap(window.preview);
      let canvas = document.createElement("canvas");
      let width = bitmap.width;
      let height = bitmap.height;
      canvas.width = width;
      canvas.height = height;
      let ctxt = canvas.getContext("2d");
      ctxt.drawImage(bitmap, 0, 0, width, height);
      let imageData = ctxt.getImageData(0, 0, width, height);
      let result = this.module.decodeQr(imageData.data, width, height);
      if (!result) {
        this.scheduleFrame();
      } else {
        this.dispatchEvent(new CustomEvent("found", { detail: result }));
      }
    } catch (e) {
      // Just in case...
      this.scheduleFrame();
    }
  }

  resume() {
    this.scheduleFrame();
  }
}
