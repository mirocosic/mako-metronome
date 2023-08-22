export const bpmToMs = (bpm: number) => {
  return 1000 / (bpm / 60)
}

export const msToBpm = (ms: number) => {
  return Math.round((1000 / ms ) * 60)
}