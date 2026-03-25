import QRCode from 'qrcode';
import { encodeGainMap, writeJpegGainMap } from 'hdrify';
import sharp from 'sharp';

/**
 * Generates a HDR qrcode. Why? Bright.
 *
 * @todo use https://togithub.com/lovell/sharp/issues/4314 when it lands in \sharp@0.35
 *
 * @returns the jpeg encoded image as data url
 */
export const createQrCode = async (pickupCode: string) => {
  const SIZE = 400;

  const pngBuffer: Buffer = await QRCode.toBuffer(pickupCode, {
    type: 'png',
    width: SIZE,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  const { data: sdrPixels, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  const HDR_WHITE = 4.0;
  const hdrData = new Float32Array(width * height * 4);

  for (let i = 0; i < sdrPixels.length; i += 4) {
    const isWhite = sdrPixels[i] > 128;
    const val = isWhite ? HDR_WHITE : 0.0;
    hdrData[i] = val;
    hdrData[i + 1] = val;
    hdrData[i + 2] = val;
    hdrData[i + 3] = 1.0;
  }

  const encoding = encodeGainMap({
    width,
    height,
    data: hdrData,
    linearColorSpace: 'linear-rec2020',
  });

  const jpegBytes = writeJpegGainMap(encoding);
  const base64 = Buffer.from(jpegBytes).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
};
