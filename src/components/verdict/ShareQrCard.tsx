"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

type ShareQrCardProps = {
  url: string;
  label?: string;
};

export function ShareQrCard({
  url,
  label = "SCAN TO ENTER · 扫码进入",
}: ShareQrCardProps) {
  const [svgMarkup, setSvgMarkup] = useState("");

  useEffect(() => {
    let active = true;

    void QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: 164,
      color: {
        dark: "#E8E6E3",
        light: "#0A0A0B",
      },
    }).then((svg) => {
      if (active) {
        setSvgMarkup(svg);
      }
    });

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div className="border border-devil-line bg-devil-bg-soft px-4 py-4 text-center">
      <div className="mx-auto grid size-32 place-items-center overflow-hidden border border-devil-gold/40 bg-devil-bg">
        {svgMarkup ? (
          <div
            aria-label="Share QR code"
            className="h-full w-full"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="h-24 w-24 animate-pulse bg-devil-line/40" />
        )}
      </div>
      <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-devil-gold">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-[0.56rem] text-devil-muted">{url}</p>
    </div>
  );
}
