"use client";

import type { NSFWJS, PredictionType } from "nsfwjs/core";

let modelPromise: Promise<NSFWJS> | null = null;

const vendorScripts = {
  tensorflow:
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
  model:
    "https://cdn.jsdelivr.net/npm/nsfwjs@4.3.0/dist/models/mobilenet_v2/model.min.js",
  weights:
    "https://cdn.jsdelivr.net/npm/nsfwjs@4.3.0/dist/models/mobilenet_v2/group1-shard1of1.min.js",
  nsfwjs:
    "https://cdn.jsdelivr.net/npm/nsfwjs@4.3.0/dist/browser/nsfwjs.min.js",
};

type TensorflowBrowserApi = {
  enableProdMode: () => void;
  ready: () => Promise<void>;
};

declare global {
  interface Window {
    tf?: TensorflowBrowserApi;
    nsfwjs?: { load: () => Promise<NSFWJS> };
  }
}

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("SCRIPT")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.crossOrigin = "anonymous";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("SCRIPT")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    image.src = url;
  });
}

async function getModel() {
  if (!modelPromise) {
    modelPromise = loadScript("arca-tensorflow", vendorScripts.tensorflow)
      .then(() => Promise.all([
        loadScript("arca-nsfw-model", vendorScripts.model),
        loadScript("arca-nsfw-weights", vendorScripts.weights),
      ]))
      .then(() => loadScript("arca-nsfwjs", vendorScripts.nsfwjs))
      .then(async () => {
        if (!window.tf || !window.nsfwjs) throw new Error("MODEL");
        window.tf.enableProdMode();
        await window.tf.ready();
        return window.nsfwjs.load();
      })
      .catch((error) => {
        modelPromise = null;
        throw error;
      });
  }
  return modelPromise;
}

function probability(predictions: PredictionType[], className: string) {
  return predictions.find((item) => item.className === className)?.probability ?? 0;
}

export async function inspectImageForAdultContent(file: File) {
  const [model, image] = await Promise.all([getModel(), loadImage(file)]);
  const predictions = await model.classify(image);
  const explicit =
    probability(predictions, "Porn") + probability(predictions, "Hentai");
  const suggestive = probability(predictions, "Sexy");
  return {
    blocked: explicit >= 0.55 || suggestive >= 0.82,
    predictions,
  };
}
