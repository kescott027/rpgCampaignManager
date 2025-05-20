import { getCurrentEntry } from "./initiativeUtils";
import { sendSceneToOBS } from "../utils/obsUtils";

export async function advanceTurn(queue, currentIndex) {
  const nextIndex = (currentIndex + 1) % queue.length;
  const nextEntry = getCurrentEntry(queue, nextIndex);
  const scene = nextEntry?.scene || nextEntry?.name;

  await sendSceneToOBS(scene);

  return {
    currentIndex: nextIndex,
    current: nextEntry?.name
  };
}

export async function reverseTurn(queue, currentIndex) {
  const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
  const prevEntry = getCurrentEntry(queue, prevIndex);
  const scene = prevEntry?.scene || prevEntry?.name;

  await sendSceneToOBS(scene);

  return {
    currentIndex: prevIndex,
    current: prevEntry?.name
  };
}
