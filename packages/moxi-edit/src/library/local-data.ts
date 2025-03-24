export const clearData = (namespace = 'no-namespace') => {
  localStorage.removeItem(namespace);
  localStorage.clear();
};

export const getLocalData = (namespace = 'no-namespace') => {
  const fromDB = localStorage.getItem(namespace);
  const result = fromDB && JSON.parse(fromDB);
  return result;
};

export const putLocalData = (namespace = 'no-namespace', jsonPayload) => {
  const update = { ...getLocalData(namespace), ...jsonPayload };
  localStorage.setItem(namespace, JSON.stringify(update));
  return update;
};

export const getHashCode = (str = '') => {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};
