"use client";

import html2canvas from "html2canvas";

export type ShareImageVariant = "portrait" | "square" | "landscape";

const SIZE_MAP: Record<ShareImageVariant, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1600, height: 900 },
};

async function waitForFonts() {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }
}

export async function generateImage(
  element: HTMLElement,
  variant: ShareImageVariant = "portrait",
) {
  await waitForFonts();

  const { width, height } = SIZE_MAP[variant];

  return html2canvas(element, {
    useCORS: true,
    backgroundColor: "#0A0A0B",
    width,
    height,
    scale: 2,
    logging: false,
    imageTimeout: 12000,
    onclone: async (documentClone) => {
      if ("fonts" in documentClone) {
        await documentClone.fonts.ready;
      }
    },
  });
}

export async function downloadElementAsPng(
  element: HTMLElement,
  variant: ShareImageVariant,
  filename = `verdict-${Date.now()}.png`,
) {
  const canvas = await generateImage(element, variant);
  const url = canvas.toDataURL("image/png");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}
