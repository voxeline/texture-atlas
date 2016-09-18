import Atlas from './Atlas';

export function debug(atlas: Atlas) {
  atlas.index().forEach((rect) => {
    atlas.context.lineWidth = 1;
    atlas.context.strokeStyle = 'red';
    atlas.context.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
};
