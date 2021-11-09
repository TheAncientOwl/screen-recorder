const { writeFile } = require('fs');
const { dialog } = require('@electron/remote');

const saveVideo = async (recordedChunks, mediaRecorderOptions) => {
  const blob = new Blob(recordedChunks, mediaRecorderOptions);

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.wemb`,
  });

  writeFile(filePath, buffer, () => console.log('>> Video saved successfully!'));
};

module.exports = { saveVideo };
