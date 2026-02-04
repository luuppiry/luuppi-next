import type { Attribute, Schema } from '@strapi/strapi';

export interface EventsQuestionsCheckbox extends Schema.Component {
  collectionName: 'components_events_questions_checkboxes';
  info: {
    description: '';
    displayName: 'QuestionsCheckbox';
  };
  attributes: {
    QuestionEn: Attribute.String & Attribute.Required;
    QuestionFi: Attribute.String & Attribute.Required;
  };
}

export interface EventsQuestionsSelect extends Schema.Component {
  collectionName: 'components_events_questions_selects';
  info: {
    description: '';
    displayName: 'QuestionsSelect';
  };
  attributes: {
    ChoicesEn: Attribute.String & Attribute.Required;
    ChoicesFi: Attribute.String & Attribute.Required;
    QuestionEn: Attribute.String & Attribute.Required;
    QuestionFi: Attribute.String & Attribute.Required;
  };
}

export interface EventsQuestionsText extends Schema.Component {
  collectionName: 'components_events_questions_texts';
  info: {
    description: '';
    displayName: 'QuestionsText';
  };
  attributes: {
    MaxLength: Attribute.Integer &
      Attribute.Required &
      Attribute.DefaultTo<500>;
    MinLength: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<3>;
    QuestionEn: Attribute.String & Attribute.Required;
    QuestionFi: Attribute.String & Attribute.Required;
    Required: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
  };
}

export interface EventsQuotas extends Schema.Component {
  collectionName: 'components_events_quotas';
  info: {
    description: '';
    displayName: 'TicketTypes';
    icon: 'television';
  };
  attributes: {
    NameEn: Attribute.String & Attribute.Required;
    NameFi: Attribute.String & Attribute.Required;
    Price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    RegistrationEndsAt: Attribute.DateTime & Attribute.Required;
    RegistrationStartsAt: Attribute.DateTime & Attribute.Required;
    Role: Attribute.Relation<
      'events.quotas',
      'oneToOne',
      'api::event-role.event-role'
    >;
    TicketsAllowedToBuy: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<1>;
    TicketsTotal: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<10>;
    Weight: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<1>;
  };
}

export interface EventsRegistration extends Schema.Component {
  collectionName: 'components_events_registrations';
  info: {
    description: '';
    displayName: 'Registration';
    icon: 'key';
  };
  attributes: {
    AllowQuestionEditUntil: Attribute.DateTime;
    QuestionsCheckbox: Attribute.Component<'events.questions-checkbox', true>;
    QuestionsSelect: Attribute.Component<'events.questions-select', true>;
    QuestionsText: Attribute.Component<'events.questions-text', true>;
    RequiresPickup: Attribute.Boolean & Attribute.DefaultTo<false>;
    RoleToGive: Attribute.Relation<
      'events.registration',
      'oneToOne',
      'api::event-role.event-role'
    >;
    TicketTypes: Attribute.Component<'events.quotas', true> &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SharedContactBanner extends Schema.Component {
  collectionName: 'components_shared_contact_banners';
  info: {
    displayName: 'ContactBanner';
    icon: 'message';
  };
  attributes: {
    description: Attribute.Text & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
    title: Attribute.String & Attribute.Required;
  };
}

export interface SharedMetaOpenGraph extends Schema.Component {
  collectionName: 'components_shared_meta_open_graphs';
  info: {
    description: '';
    displayName: 'metaOpenGraph';
    icon: 'link';
  };
  attributes: {
    openGraphDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    openGraphImage: Attribute.Media<'images'>;
    openGraphTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface SharedMetaTwitter extends Schema.Component {
  collectionName: 'components_shared_meta_twitters';
  info: {
    description: '';
    displayName: 'MetaTwitter';
    icon: 'twitter';
  };
  attributes: {
    twitterDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    twitterImage: Attribute.Media<'images'>;
    twitterTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface SharedPageContent extends Schema.Component {
  collectionName: 'components_shared_page_contents';
  info: {
    description: '';
    displayName: 'PageContent';
    icon: 'write';
  };
  attributes: {
    banner: Attribute.Media<'images'> & Attribute.Required;
    content: Attribute.Blocks & Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'search';
  };
  attributes: {
    metaAuthor: Attribute.String;
    metaDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    metaKeywords: Attribute.String;
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    openGraph: Attribute.Component<'shared.meta-open-graph'> &
      Attribute.Required;
    twitter: Attribute.Component<'shared.meta-twitter'> & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'events.questions-checkbox': EventsQuestionsCheckbox;
      'events.questions-select': EventsQuestionsSelect;
      'events.questions-text': EventsQuestionsText;
      'events.quotas': EventsQuotas;
      'events.registration': EventsRegistration;
      'shared.contact-banner': SharedContactBanner;
      'shared.meta-open-graph': SharedMetaOpenGraph;
      'shared.meta-twitter': SharedMetaTwitter;
      'shared.page-content': SharedPageContent;
      'shared.seo': SharedSeo;
    }
  }
}
