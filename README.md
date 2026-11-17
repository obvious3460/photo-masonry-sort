# Photo Masonry Sort

按时间排序，再根据照片的宽高比安排瀑布流位置。适合相册或照片墙。无运行时依赖，可在 Node.js 或浏览器的 ES 模块中使用。

## 示例

把仓库中的 `index.js` 放到项目中，通过 ES 模块导入。

```js
import { sortPhotos, layoutPhotos } from "./index.js";

const photos = [
  { id: "portrait", width: 800, height: 1200, uploadedAt: "2026-11-14T10:00:00Z" },
  { id: "panorama", width: 2400, height: 800, uploadedAt: "2026-11-15T10:00:00Z" },
  { id: "square", width: 900, height: 900, uploadedAt: "2026-11-13T10:00:00Z" },
];

const sorted = sortPhotos(photos);
const layout = layoutPhotos(sorted, { width: 960, height: 680 });

for (const { photo, x, y, width, height } of layout.cards) {
  console.log(photo.id, { x, y, width, height });
}
```

## API

| 函数 | 行为 |
| --- | --- |
| `sortPhotos(photos, timeKey = "uploadedAt")` | 按指定时间字段倒序，支持 ISO 日期字符串和毫秒时间戳。相同时间保持输入顺序，缺失或无效的日期排在末尾。 |
| `layoutPhotos(photos, { width, height, columns, gap })` | 按传入顺序，把每张照片放进当前最短的一列。`width`、`height` 是可用视口尺寸。宽度小于 660 默认两列，否则三列，`gap` 默认 30。可以直接传入已经手动排序的数组。 |

优先使用 `aspectRatio`，也可传入图片的 `width` 和 `height`。无有效比例时按 4∶3 预留空间。超长竖图按可用高度等比缩小。两列等高时优先选左侧。

`layout.cards` 中的 `x`、`y`、`width` 和 `height` 描述带白边的照片卡片，`image` 描述卡片内图片的区域，坐标均相对布局原点。`layout.height` 是整个内容区的高度。算法保留原始照片对象，渲染由调用方完成。

## 测试

在仓库目录运行 `npm test`，需要 Node.js 18 或更新版本。
