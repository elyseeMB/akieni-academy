export function isPointWithinElement(x, y, element) {
  const { left, right, top, bottom } = element.getBoundingClientRect();
  return x >= left && x <= right && y >= top && y <= bottom;
}

export function isClickedOutside(event, element) {
  const isDialog = event.target instanceof HTMLDialogElement;
  if (isDialog || !(event.target instanceof Element)) {
    return !isPointWithinElement(event.clientX, event.clientY, element);
  }

  return !element.contains(event.target);
}
