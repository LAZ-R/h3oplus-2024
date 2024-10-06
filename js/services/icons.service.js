import { ICONS } from "../data/svgIcons.data.js";

const getSvgObjectByIconName = (iconName) => {
  let icons = ICONS.filter((i) => i.name == iconName);
  let icon = '';
  if (icons.length != 0) {
    icon = icons[0];
  } else {
    icon = null;
  }
  return icon;
}

export const getSvgIcon = (iconName, cssClassNames, id) => {
  let str = '';
  let icon = getSvgObjectByIconName(iconName);
  if (icon != null) {
    str = `
      <svg id="${id}" class="app-icon ${cssClassNames}" viewBox="${icon.viewbox}" xmlns="http://www.w3.org/2000/svg">
        <path d="${icon.path_d}" />
      </svg>`;
  } else {
    str = `
      <svg class="app-icon ${cssClassNames}" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }
  return str;
}