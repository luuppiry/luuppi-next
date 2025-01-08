/* eslint-disable no-unused-vars */
/**
 * Snippet from https://gist.github.com/Convly/6cf1e6d143bb0a90c8de2242fdedda8e
 * Ref: https://docs.strapi.io/dev-docs/typescript/development#generate-typings-for-content-types-schemas
 */

import type { Schema, UID, Utils } from '@strapi/types';

type IDProperty = { id: number };

type InvalidKeys<TSchemaUID extends UID.Schema> = Utils.Object.KeysBy<
  Schema.Schema<TSchemaUID>,
  Schema.Attribute.Private | Schema.Attribute.Password
>;

export type GetValues<TSchemaUID extends UID.Schema> = {
  [TKey in Schema.OptionalAttributeNames<TSchemaUID>]?: Schema.AttributeByName<
    TSchemaUID,
    TKey
  > extends infer TAttribute extends Schema.Attribute.Attribute
    ? GetValue<TAttribute>
    : never;
} & {
  [TKey in Schema.RequiredAttributeNames<TSchemaUID>]-?: Schema.AttributeByName<
    TSchemaUID,
    TKey
  > extends infer TAttribute extends Schema.Attribute.Attribute
    ? GetValue<TAttribute>
    : never;
} extends infer TValues
  ? // Remove invalid keys (private, password)
    Omit<TValues, InvalidKeys<TSchemaUID>>
  : never;

type RelationValue<TAttribute extends Schema.Attribute.Attribute> =
  TAttribute extends Schema.Attribute.RelationWithTarget<
    infer TRelationKind,
    infer TTarget
  >
    ? Utils.MatchFirst<
        [
          [
            Utils.Extends<
              TRelationKind,
              Schema.Attribute.RelationKind.WithTarget
            >,
            TRelationKind extends `${string}ToMany`
              ? Omit<APIResponseCollection<TTarget>, 'meta'>
              : APIResponse<TTarget>,
          ],
        ],
        `TODO: handle other relation kind (${TRelationKind})`
      >
    : never;

type ComponentValue<TAttribute extends Schema.Attribute.Attribute> =
  TAttribute extends Schema.Attribute.Component<
    infer TComponentUID,
    infer TRepeatable
  >
    ? Utils.If<
        TRepeatable,
        (IDProperty & GetValues<TComponentUID>)[],
        IDProperty & GetValues<TComponentUID>
      >
    : never;

type DynamicZoneValue<TAttribute extends Schema.Attribute.Attribute> =
  TAttribute extends Schema.Attribute.DynamicZone<infer TComponentUIDs>
    ? Array<
        Utils.Array.Values<TComponentUIDs> extends infer TComponentUID
          ? TComponentUID extends UID.Component
            ? { __component: TComponentUID } & IDProperty &
                GetValues<TComponentUID>
            : never
          : never
      >
    : never;

type MediaValue<TAttribute extends Schema.Attribute.Attribute> =
  TAttribute extends Schema.Attribute.Media<infer _TKind, infer TMultiple>
    ? Utils.If<
        TMultiple,
        APIResponseData<'plugin::upload.file'>[],
        APIResponseData<'plugin::upload.file'>
      >
    : never;

export type GetValue<TAttribute extends Schema.Attribute.Attribute> = Utils.If<
  Utils.IsNotNever<TAttribute>,
  Utils.MatchFirst<
    [
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'relation'>>,
        RelationValue<TAttribute>,
      ],

      // DynamicZone
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'dynamiczone'>>,
        DynamicZoneValue<TAttribute>,
      ],

      // Component
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'component'>>,
        ComponentValue<TAttribute>,
      ],

      // Media
      [
        Utils.Extends<TAttribute, Schema.Attribute.OfType<'media'>>,
        MediaValue<TAttribute>,
      ],

      // Fallback
      // If none of the above attribute type, fallback to the original Schema.Attribute.Value (while making sure it's an attribute)
      [Utils.Constants.True, Schema.Attribute.Value<TAttribute, unknown>],
    ],
    unknown
  >,
  unknown
>;

export type APIResponseData<TContentTypeUID extends UID.ContentType> =
  IDProperty & GetValues<TContentTypeUID>;

export interface APIResponseCollectionMetadata {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
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

export type OperatorValue = string | number;

// generated via Claude from docs in https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#filtering -- don't trust it blindly
export interface FilterOperators<Field extends string> {
  $eq?: OperatorValue;
  $eqi?: OperatorValue;
  $ne?: OperatorValue;
  $nei?: OperatorValue;
  $lt?: OperatorValue;
  $lte?: OperatorValue;
  $gt?: OperatorValue;
  $gte?: OperatorValue;
  $in?: OperatorValue[];
  $notIn?: OperatorValue[];
  $contains?: OperatorValue;
  $notContains?: OperatorValue;
  $containsi?: OperatorValue;
  $notContainsi?: OperatorValue;
  $null?: boolean;
  $notNull?: boolean;
  $between?: [OperatorValue, OperatorValue];
  $startsWith?: OperatorValue;
  $startsWithi?: OperatorValue;
  $endsWith?: OperatorValue;
  $endsWithi?: OperatorValue;
  $or?: QueryFilter<Field>['filters'][];
  $and?: QueryFilter<Field>['filters'][];
  $not?: QueryFilter<Field>['filters'];
}

export interface QueryFilter<Field extends string = string> {
  status?: 'published' | 'draft';
  sort?: Field | Field[];
  pagination?: {
    limit: number;
    start: number;
  };
  populate?:
    | {
        [key in Field]?: {
          fields: string[];
        };
      }
    | '*';
  filters?: {
    [key in Field]?: FilterOperators<Field>;
  };
}

export interface GetOptions {
  preview?: boolean;
}
