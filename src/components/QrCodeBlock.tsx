import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeBlockProps {
  value: string;
  size?: number;
}

export default function QrCodeBlock({ value, size = 280 }: QrCodeBlockProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 2,
      color: {
        dark: '#121418',
        light: '#f3efe6',
      },
      errorCorrectionLevel: 'M',
    })
      .then((svg) => {
        if (active) setSvgMarkup(svg);
      })
      .catch(() => {
        if (active) setSvgMarkup('');
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!svgMarkup) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl bg-[#f3efe6] text-sm font-medium text-[#121418]"
      >
        Generando código QR...
      </div>
    );
  }

  return (
    <div
      className="inline-block overflow-hidden rounded-xl bg-[#f3efe6] p-3 shadow-lg"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
