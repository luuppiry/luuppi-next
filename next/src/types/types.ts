import type { Schema, UID, Utils } from '@strapi/strapi';

interface IDProperty {
  id: number;
}

type InvalidKeys<TSchemaUID extends UID.Schema> = Utils.Object.KeysBy<
  Schema.Attributes<TSchemaUID>,
  Schema.Attribute.Private | Schema.Attribute.Password
>;

type GetValues<TSchemaUID extends UID.Schema> = {
  [TKey in Schema.OptionalAttributeNames<TSchemaUID>]?: Utils.Get<
    Schema.Schema<TSchemaUID>['attributes'],
    TKey
  > extends infer TAttribute extends Schema.Attribute.Attribute
    ? GetValue<TAttribute>
    : never;
} & {
  [TKey in Schema.RequiredAttributeNames<TSchemaUID>]-?: Utils.Get<
    Schema.Schema<TSchemaUID>['attributes'],
    TKey
  > extends infer TAttribute extends Schema.Attribute.Attribute
    ? GetValue<TAttribute>
    : never;
} extends infer TValues
  ? // Remove invalid keys (private, password)
    Omit<TValues, InvalidKeys<TSchemaUID>>
  : never;

type GetValue<TAttribute extends Schema.Attribute.Attribute> = Utils.If<
  Utils.IsNotNever<TAttribute>,
  Utils.MatchFirst<
    [
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'relation'>>,
        Schema.Attribute.GetRelationValue<TAttribute>,
      ],

      // DynamicZone
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'dynamiczone'>>,
        Schema.Attribute.GetDynamicZoneValue<TAttribute>,
      ],

      // Component
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'component'>>,
        Schema.Attribute.GetComponentValue<TAttribute>,
      ],

      // Media
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'media'>>,
        Schema.Attribute.GetMediaValue<TAttribute>,
      ],

      // Fallback
      // If none of the above attribute type, fallback to the original Attribute.GetValue (while making sure it's an attribute)
      [Utils.Constants.True, Schema.Attribute.Value<TAttribute, unknown>],
    ],
    unknown
  >,
  unknown
>;

export type APIResponseData<TContentTypeUID extends UID.ContentType> =
  IDProperty & GetValues<TContentTypeUID>;

export interface APIResponseCollectionMetadata {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface APIResponse<TContentTypeUID extends UID.ContentType> {
  data: APIResponseData<TContentTypeUID>;
}

export interface APIResponseCollection<
  TContentTypeUID extends UID.ContentType,
> {
  data: APIResponseData<TContentTypeUID>[];
  meta: APIResponseCollectionMetadata;
}
