const db = {
  collection: (collectionName) => {
    return {
      bulkWrite: (data) => {
        localStorage.setItem(collectionName, JSON.stringify(data));
        window.dispatchEvent(new Event("storage"));
      },

      insertOne: (data) => {
        const existingData = JSON.parse(localStorage.getItem(collectionName) || "[]");
        localStorage.setItem(collectionName, JSON.stringify([...existingData, data]));
        window.dispatchEvent(new Event("storage"));
      },

      updateOne: (id, newData) => {
        const existingData = JSON.parse(localStorage.getItem(collectionName) || "[]");
        const updatedData = existingData.map(item =>
          item.id === id ? { ...item, ...newData } : item
        );
        localStorage.setItem(collectionName, JSON.stringify(updatedData));
        window.dispatchEvent(new Event("storage"));
      },

      deleteOne: (id) => {
        const existingData = JSON.parse(localStorage.getItem(collectionName) || "[]");
        const updatedData = existingData.filter(item => item.id !== id);
        localStorage.setItem(collectionName, JSON.stringify(updatedData));
        window.dispatchEvent(new Event("storage"));
      }
    };
  },
};

function createAction(client, action, service) {
  return (...params) => {
    window.dispatchEvent(
      new CustomEvent(`lf:${action}:start`, { detail: { action } }),
    );
    return client[action](...params)
      .then((result) => {
        service.onSuccess({ action, payload: result, params, db });
        window.dispatchEvent(
          new CustomEvent(`lf:${action}:success`, { detail: { action } }),
        );
        return result;
      })
      .catch((error) => {
        service.onError({ action, error, params, db });
        window.dispatchEvent(
          new CustomEvent(`lf:${action}:error`, { detail: { action } }),
        );
        throw error;
      });
  };
}

export function createService(client, serviceDefinition) {
  let result = {
    onSuccess: serviceDefinition.onSuccess,
    collection: serviceDefinition.collection
  };

  Object.keys(client).forEach((key) => {
    result[key] = createAction(client, key, serviceDefinition);
  });

  return result;
}