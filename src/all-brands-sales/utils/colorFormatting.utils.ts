export interface Color {
  red: number;
  green: number;
  blue: number;
}

const minColor: Color = {
  red: 255,
  blue: 0,
  green: 0,
};

const maxColor: Color = {
  red: 0,
  blue: 0,
  green: 255,
};

export function computeColor(minData: number, maxData: number, currentData: number) {
  const x = (currentData - minData) / (maxData - minData);
  const y: Color = {
    red: maxColor.red - minColor.red,
    green: maxColor.green - minColor.green,
    blue: maxColor.blue - minColor.blue,
  };
  const finalColor: Color = {
    red: Math.round(minColor.red + x * y.red),
    green: Math.round(minColor.green + x * y.green),
    blue: Math.round(minColor.blue + x * y.blue),
  };
  return finalColor;
}
