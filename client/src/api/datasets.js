const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
};

export const uploadDataset = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = async () => {
      try {
        const payload = await parseResponse({
          ok: xhr.status >= 200 && xhr.status < 300,
          json: async () => JSON.parse(xhr.responseText || '{}'),
        });
        resolve(payload);
      } catch (error) {
        reject(error);
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
    xhr.send(formData);
  });
};

export const fetchDatasets = async () => {
  const response = await fetch('/api/datasets');
  return parseResponse(response);
};

export const fetchDatasetById = async (id) => {
  const response = await fetch(`/api/datasets/${id}`);
  return parseResponse(response);
};

export const deleteDataset = async (id) => {
  const response = await fetch(`/api/datasets/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Delete failed.');
  }
};
