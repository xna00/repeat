const player = new Audio();
export const play = () => {
  return player.play();
};

export const pause = () => {
  return player.pause();
};

export const setSource = (src: string) => {
  player.src = src;
};
