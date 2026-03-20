const EXIF_HEADER = "Exif\0\0";
const IMAGE_DESCRIPTION_TAG = 0x010e;

function readUInt16(buffer: Buffer, offset: number, littleEndian: boolean): number {
  return littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
}

function readUInt32(buffer: Buffer, offset: number, littleEndian: boolean): number {
  return littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
}

function getTypeSize(type: number): number {
  switch (type) {
    case 1:
    case 2:
    case 7:
      return 1;
    case 3:
      return 2;
    case 4:
    case 9:
      return 4;
    case 5:
    case 10:
      return 8;
    default:
      return 1;
  }
}

function decodeExifString(bytes: Buffer): string {
  const nulIndex = bytes.indexOf(0);
  const textBytes = nulIndex === -1 ? bytes : bytes.subarray(0, nulIndex);
  return new TextDecoder().decode(textBytes);
}

function extractImageDescriptionFromTiff(tiffBuffer: Buffer): string | undefined {
  if (tiffBuffer.length < 8) {
    return undefined;
  }

  const byteOrder = tiffBuffer.toString("ascii", 0, 2);
  const littleEndian = byteOrder === "II";

  if (littleEndian === false && byteOrder !== "MM") {
    return undefined;
  }

  if (readUInt16(tiffBuffer, 2, littleEndian) !== 42) {
    return undefined;
  }

  const firstIfdOffset = readUInt32(tiffBuffer, 4, littleEndian);
  if (firstIfdOffset + 2 > tiffBuffer.length) {
    return undefined;
  }

  const entryCount = readUInt16(tiffBuffer, firstIfdOffset, littleEndian);
  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = firstIfdOffset + 2 + index * 12;
    if (entryOffset + 12 > tiffBuffer.length) {
      break;
    }

    if (readUInt16(tiffBuffer, entryOffset, littleEndian) !== IMAGE_DESCRIPTION_TAG) {
      continue;
    }

    const type = readUInt16(tiffBuffer, entryOffset + 2, littleEndian);
    const count = readUInt32(tiffBuffer, entryOffset + 4, littleEndian);
    const valueSize = getTypeSize(type) * count;

    if (valueSize === 0) {
      return "";
    }

    const dataOffset =
      valueSize <= 4 ? entryOffset + 8 : readUInt32(tiffBuffer, entryOffset + 8, littleEndian);
    if (dataOffset + valueSize > tiffBuffer.length) {
      return undefined;
    }

    return decodeExifString(tiffBuffer.subarray(dataOffset, dataOffset + valueSize));
  }

  return undefined;
}

export function extractAltTextFromJpeg(buffer: Buffer): string | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === undefined) {
      return undefined;
    }
    offset += 2;

    if (marker >= 0xd0 && marker <= 0xd9) {
      continue;
    }

    if (offset + 2 > buffer.length) {
      return undefined;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2) {
      return undefined;
    }

    const segmentStart = offset + 2;
    const segmentEnd = offset + segmentLength;
    if (segmentEnd > buffer.length) {
      return undefined;
    }

    if (marker === 0xe1 && segmentLength >= EXIF_HEADER.length + 2) {
      const header = buffer.toString("ascii", segmentStart, segmentStart + EXIF_HEADER.length);
      if (header === EXIF_HEADER) {
        const altText = extractImageDescriptionFromTiff(
          buffer.subarray(segmentStart + EXIF_HEADER.length, segmentEnd),
        );
        if (altText !== undefined) {
          return altText;
        }
      }
    }

    offset = segmentEnd;
  }

  return undefined;
}
