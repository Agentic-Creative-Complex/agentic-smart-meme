/**
 * Oder the swagger paths to ensure that the routes are in the correct order in the UI.
 */
interface SwaggerSpecPaths { [key: string]: any }

export const orderSwaggerPaths = (paths: SwaggerSpecPaths) => {

// This is a sample order list with prefixes.
  const orderList: string[] = [
    "health",
    // ... add all prefixes, as more come in to order them
  ];

  const orderedSwaggerPaths: { [key: string]: any } = {};

  orderList.forEach((prefix) => {
    for (let path in paths) {
      if (path.startsWith(`/${prefix}`) && !orderedSwaggerPaths[path]) {
        orderedSwaggerPaths[path] = paths[path];
      }
    }
  });

// Now, add paths that might not match any prefix to ensure no paths are missed
  for (let path in paths) {
    if (!orderedSwaggerPaths[path]) {
      orderedSwaggerPaths[path] = paths[path];
    }
  }

  return orderedSwaggerPaths;
}
