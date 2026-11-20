export default (plugin: any) => {
  const { attributes } = plugin.contentTypes.file.schema;

  attributes.exif = { type: "json" };
  attributes.blurDataUrl = { type: "text" };

  return plugin;
};
