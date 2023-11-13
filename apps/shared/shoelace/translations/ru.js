import "../chunks/chunk.NH3SRVOC.js";
import "../chunks/chunk.QPSNFEB2.js";
import {
  registerTranslation
} from "../chunks/chunk.O27EHOBW.js";
import "../chunks/chunk.YZETUBD6.js";

// src/translations/ru.ts
var translation = {
  $code: "ru",
  $name: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  $dir: "ltr",
  carousel: "\u041A\u0430\u0440\u0443\u0441\u0435\u043B\u044C",
  clearEntry: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C",
  close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
  copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
  copy: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
  currentValue: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435",
  error: "\u041E\u0448\u0438\u0431\u043A\u0430",
  goToSlide: (slide, count) => `\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0441\u043B\u0430\u0439\u0434\u0443 ${slide} \u0438\u0437 ${count}`,
  hidePassword: "\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
  loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430",
  nextSlide: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u0430\u0439\u0434",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "\u0432\u044B\u0431\u0440\u0430\u043D\u043E 0 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432";
    if (num === 1)
      return "\u0412\u044B\u0431\u0440\u0430\u043D 1 \u0432\u0430\u0440\u0438\u0430\u043D\u0442";
    return `\u0432\u044B\u0431\u0440\u0430\u043D\u043E ${num} \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430`;
  },
  previousSlide: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0441\u043B\u0430\u0439\u0434",
  progress: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441",
  remove: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
  resize: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u0430\u0437\u043C\u0435\u0440",
  scrollToEnd: "\u041F\u0440\u043E\u043B\u0438\u0441\u0442\u0430\u0442\u044C \u0434\u043E \u043A\u043E\u043D\u0446\u0430",
  scrollToStart: "\u041F\u0440\u043E\u043B\u0438\u0441\u0442\u0430\u0442\u044C \u043A \u043D\u0430\u0447\u0430\u043B\u0443",
  selectAColorFromTheScreen: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0432\u0435\u0442 \u043D\u0430 \u044D\u043A\u0440\u0430\u043D\u0435",
  showPassword: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
  slideNum: (slide) => `\u0421\u043B\u0430\u0439\u0434 ${slide}`,
  toggleColorFormat: "\u041F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0446\u0432\u0435\u0442\u043E\u0432\u0443\u044E \u043C\u043E\u0434\u0435\u043B\u044C"
};
registerTranslation(translation);
var ru_default = translation;
export {
  ru_default as default
};
