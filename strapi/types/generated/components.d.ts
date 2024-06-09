import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedContactBanner extends Schema.Component {
  collectionName: 'components_shared_contact_banners';
  info: {
    displayName: 'ContactBanner';
    icon: 'message';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
  };
}

export interface SharedMetaOpenGraph extends Schema.Component {
  collectionName: 'components_shared_meta_open_graphs';
  info: {
    displayName: 'metaOpenGraph';
    icon: 'link';
    description: '';
  };
  attributes: {
    openGraphTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    openGraphDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    openGraphImage: Attribute.Media<'images'>;
  };
}

export interface SharedMetaTwitter extends Schema.Component {
  collectionName: 'components_shared_meta_twitters';
  info: {
    displayName: 'MetaTwitter';
    icon: 'twitter';
    description: '';
  };
  attributes: {
    twitterTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    twitterDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    twitterImage: Attribute.Media<'images'>;
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
    content: Attribute.Blocks & Attribute.Required;
    banner: Attribute.Media<'images'> & Attribute.Required;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'Seo';
    icon: 'search';
    description: '';
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
        maxLength: 300;
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
      'shared.contact-banner': SharedContactBanner;
      'shared.meta-open-graph': SharedMetaOpenGraph;
      'shared.meta-twitter': SharedMetaTwitter;
      'shared.page-content': SharedPageContent;
      'shared.seo': SharedSeo;
    }
  }
}
