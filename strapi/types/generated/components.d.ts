import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedMetaOpenGraph extends Schema.Component {
  collectionName: 'components_shared_meta_open_graphs';
  info: {
    displayName: 'metaOpenGraph';
    icon: 'link';
  };
  attributes: {
    openGraphTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    openGraphDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    openGraphImage: Attribute.Media;
  };
}

export interface SharedMetaTwitter extends Schema.Component {
  collectionName: 'components_shared_meta_twitters';
  info: {
    displayName: 'MetaTwitter';
    icon: 'twitter';
  };
  attributes: {
    twitterTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    twitterDescription: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    twitterImage: Attribute.Media;
  };
}

export interface SharedPageContent extends Schema.Component {
  collectionName: 'components_shared_page_contents';
  info: {
    displayName: 'PageContent';
    icon: 'write';
    description: '';
  };
  attributes: {
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    subtitle: Attribute.String;
    content: Attribute.Blocks & Attribute.Required;
    banner: Attribute.Media & Attribute.Required;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'Seo';
    icon: 'search';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    metaDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaAuthor: Attribute.String;
    metaKeywords: Attribute.String;
    openGraph: Attribute.Component<'shared.meta-open-graph'>;
    twitter: Attribute.Component<'shared.meta-twitter'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.meta-open-graph': SharedMetaOpenGraph;
      'shared.meta-twitter': SharedMetaTwitter;
      'shared.page-content': SharedPageContent;
      'shared.seo': SharedSeo;
    }
  }
}
