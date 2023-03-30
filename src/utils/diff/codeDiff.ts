export const codeDiff = (oldCode: string, newCode: string): string => {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const max = Math.max(oldLines.length, newLines.length);
  const lineChanged = (newIndex: number, oldIndex: number) => {
    const newLine = newLines[newIndex];
    const oldLine = oldLines[oldIndex];
    if (newLine !== oldLine) {
      return true;
    }
    return false;
  };
  const diff = [];
  let oldIndex = 0;
  let newIndex = 0;
  for (let i = 0; i < max; i++) {
    if (!oldLines.length || i >= oldLines.length) {
      for (let j = newIndex; j < newLines.length; j++) {
        diff.push(`+ ${newLines[j]}`);
      }
      break;
    } else if (i >= newLines.length) {
      for (let j = oldIndex; j < oldLines.length; j++) {
        diff.push(`- ${oldLines[j]}`);
      }
      break;
    }
    if (lineChanged(newIndex, oldIndex)) {
      diff.push(`- ${oldLines[i]}`);
      let k = i + 1;
      for (let j = oldIndex + 1; j < oldLines.length; j++) {
        if (k >= newLines.length) break;
        if (lineChanged(k, j)) {
          diff.push(`- ${oldLines[j]}`);
          oldIndex = j;
          k++;
        } else {
          break;
        }
      }
      diff.push(`+ ${oldLines[i]}`);
      k = i + 1;
      for (let j = newIndex + 1; j < newLines.length; j++) {
        if (k >= oldLines.length) break;
        if (lineChanged(j, k)) {
          diff.push(`+ ${newLines[j]}`);
          oldIndex = j;
          k++;
        } else {
          break;
        }
      }
      i = Math.max(oldIndex, newIndex);
    } else {
      diff.push(`  ${oldLines[i]}`);
    }
    if (oldIndex <= oldLines.length - 1) oldIndex++;
    if (newIndex <= newLines.length - 1) newIndex++;
  }
  return diff.join('\n');
};
