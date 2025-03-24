
export const requireIntercept = (userRequireMap = {}) => (moduleName) => {
  if (moduleName.endsWith('.css')) {
    // TODO: handle CSS and other modules
    return '';
  }

  const reference = (({ ...userRequireMap })[moduleName]);
  if (!reference) {
    console.error(`module for ${moduleName} was not found`);
    return null;
  }

  return reference;
};
