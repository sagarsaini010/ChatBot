export const streamText = (fullText, onUpdate, onDone) => {
  let index = 0;
  
  // Is number ko badhane se speed aur tez ho jayegi
  // 20-30 characters per frame matlab "Super Sonic" speed
  const chunkSize = 25; 

  const step = () => {
    // Har frame mein chunkSize ke barabar text add hoga
    index += chunkSize;

    if (index >= fullText.length) {
      // Last mein poora text bhej do
      onUpdate(fullText);
      if (onDone) onDone();
    } else {
      // Partial text update
      onUpdate(fullText.slice(0, index));
      
      // Agla frame request karo
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};