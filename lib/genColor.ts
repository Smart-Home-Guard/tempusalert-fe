import { DEVICE_COLOR } from "@/constants/color";

const usedColors = new Set<{ isDashed: boolean; color: string }>();

export function getRandomColorClass(): { isDashed: boolean; color: string } {
  const availableColors = [...DEVICE_COLOR];

  while (availableColors.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const colorClass = availableColors[randomIndex];

    if (!usedColors.has(colorClass)) {
      availableColors.splice(randomIndex, 1);
      usedColors.add(colorClass);
      return colorClass;
    }
  }

  usedColors.clear();
  return DEVICE_COLOR[Math.floor(Math.random() * DEVICE_COLOR.length)];
}
