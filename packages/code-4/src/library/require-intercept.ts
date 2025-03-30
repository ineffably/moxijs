
export const requireIntercept = (userRequireMap = {}) => (moduleName) => {
  if (moduleName.endsWith('.css')) {
    // TODO: handle CSS and other modules
    return '';
  }
  console.log('moduleName', moduleName);
  const reference = (({ ...userRequireMap })[moduleName]);
  if (!reference) {
    console.error(`module for ${moduleName} was not found`);
    console.log(userRequireMap)
    return null;
  }

  return reference;
};
