export const streamText = (fullText, onUpdate, onDone, speed = 1) => {
  let index = 0;

  const interval = setInterval(() => {
    index++;
    onUpdate(fullText.slice(0, index));

    if (index >= fullText.length) {
      clearInterval(interval);
      onDone();
    }
  }, speed);
};
