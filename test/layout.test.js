import assert from "node:assert/strict";
import { test } from "node:test";
import { layoutPhotos, sortPhotos } from "../index.js";

test("sorts newest first and preserves ties and undated order", () => {
  const photos = Object.freeze([
    { id: "missing" },
    { id: "older", uploadedAt: "2026-11-01T00:00:00Z" },
    { id: "new-first", uploadedAt: "2026-11-17T00:00:00Z" },
    { id: "invalid", uploadedAt: "unknown" },
    { id: "new-second", uploadedAt: Date.UTC(2026, 10, 17) },
  ]);

  assert.deepEqual(sortPhotos(photos).map(({ id }) => id), ["new-first", "new-second", "older", "missing", "invalid"]);
  assert.equal(photos[0].id, "missing");
  assert.deepEqual(sortPhotos([{ deletedAt: 0 }, { deletedAt: 1 }], "deletedAt").map(({ deletedAt }) => deletedAt), [1, 0]);
});

test("lays out mixed photo sizes in the shortest columns without overlap", () => {
  const photos = [
    { aspectRatio: 4 },
    { width: 300, height: 1200 },
    { aspectRatio: 1 },
    { aspectRatio: 2 },
    { aspectRatio: Number.NaN },
  ];
  const layout = layoutPhotos(photos, { width: 990, height: 700 });
  assert.deepEqual(layout.cards.map(({ column }) => column), [0, 1, 2, 0, 0]);
  const columnBottoms = [0, 0, 0];
  const ratios = [4, 0.25, 1, 2, 4 / 3];

  layout.cards.forEach((card, index) => {
    assert.equal(card.photo, photos[index]);
    assert.ok(card.y >= columnBottoms[card.column]);
    assert.ok(card.x >= 0 && card.x + card.width <= layout.width);
    assert.ok(card.y + card.height <= layout.height);
    assert.ok(card.image.width > 0 && card.image.height > 0);
    assert.ok(Math.abs(card.image.width / card.image.height - ratios[index]) < 1e-12);
    columnBottoms[card.column] = card.y + card.height + 30;
  });
});

test("supports narrow and empty layouts and validates dimensions", () => {
  assert.deepEqual(layoutPhotos([], { width: 520, height: 600 }), { cards: [], width: 520, height: 0, columns: 2 });
  assert.equal(layoutPhotos([{}], { width: 520, height: 600, columns: 1 }).cards[0].column, 0);
  assert.throws(() => layoutPhotos([], { width: 0, height: 600 }), RangeError);
  assert.throws(() => layoutPhotos([], { width: 520, height: 600, columns: 0 }), RangeError);
});
