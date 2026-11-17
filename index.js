const defaultRatio = 4 / 3;
const widthFactors = [0.97, 1, 0.94, 0.99, 0.96, 0.95, 0.98, 1];

function photoRatio(photo) {
  if (Number.isFinite(photo.aspectRatio) && photo.aspectRatio > 0) {
    return photo.aspectRatio;
  }
  if (Number.isFinite(photo.width) && photo.width > 0 && Number.isFinite(photo.height) && photo.height > 0) {
    const ratio = photo.width / photo.height;
    if (Number.isFinite(ratio) && ratio > 0) return ratio;
  }
  return defaultRatio;
}

/** 按时间从新到旧排序。同一时间与缺少日期的照片各自保持原顺序。 */
export function sortPhotos(photos, timeKey = "uploadedAt") {
  const dated = photos.map((photo, index) => {
    const value = photo[timeKey];
    const time = typeof value === "number" ? value : Date.parse(value);
    return { photo, index, time: Number.isFinite(time) ? time : -Infinity };
  });
  dated.sort((left, right) => {
    if (left.time === right.time) return left.index - right.index;
    return right.time - left.time;
  });
  return dated.map(({ photo }) => photo);
}

/** 按传入顺序把照片放入当前最短的一列，返回纸框和图片的位置、尺寸。 */
export function layoutPhotos(photos, {
  width,
  height,
  columns = width < 660 ? 2 : 3,
  gap = 30,
} = {}) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError("width and height must be positive finite viewport dimensions");
  }
  if (!Number.isSafeInteger(columns) || columns < 1 || columns > Math.ceil(width)) {
    throw new RangeError("columns must be a positive integer that fits the viewport");
  }
  if (!Number.isFinite(gap) || gap < 0) {
    throw new RangeError("gap must be a non-negative finite number");
  }

  const columnWidth = width / columns;
  const baseWidth = columnWidth - Math.min(24, columnWidth * 0.2);
  const border = Math.min(18, baseWidth * 0.3);
  const bottoms = Array.from({ length: columns }, (_, column) => 8 + column * 10);
  let contentHeight = 0;

  const cards = photos.map((photo, index) => {
    let column = 0;
    for (let candidate = 1; candidate < columns; candidate += 1) {
      if (bottoms[candidate] < bottoms[column]) column = candidate;
    }

    const ratio = photoRatio(photo);
    const maxWidth = baseWidth * widthFactors[index % widthFactors.length] - border;
    const imageHeight = Math.min(maxWidth / ratio, maxWidth * 1.3, height * 0.7);
    const imageWidth = Math.min(maxWidth, imageHeight * ratio);
    const cardWidth = imageWidth + border;
    const cardHeight = imageHeight + border;
    const x = column * columnWidth + (columnWidth - cardWidth) / 2;
    const y = bottoms[column];

    bottoms[column] = y + cardHeight + gap;
    contentHeight = Math.max(contentHeight, y + cardHeight);
    return {
      photo,
      column,
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      image: { x: x + border / 2, y: y + border / 2, width: imageWidth, height: imageHeight },
    };
  });

  return { cards, width, height: contentHeight, columns };
}
