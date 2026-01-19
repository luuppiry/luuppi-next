import type { Attribute, Schema } from '@strapi/strapi';

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
    openGraph: Attribute.Component<'shared.meta-open-graph'> &
      Attribute.Required;
    twitter: Attribute.Component<'shared.meta-twitter'> & Attribute.Required;
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

export interface EventsRegistration extends Schema.Component {
  collectionName: 'components_events_registrations';
  info: {
    displayName: 'Registration';
    icon: 'key';
    description: '';
  };
  attributes: {
    TicketTypes: Attribute.Component<'events.quotas', true> &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    RoleToGive: Attribute.Relation<
      'events.registration',
      'oneToOne',
      'api::event-role.event-role'
    >;
    QuestionsText: Attribute.Component<'events.questions-text', true>;
    QuestionsSelect: Attribute.Component<'events.questions-select', true>;
    QuestionsCheckbox: Attribute.Component<'events.questions-checkbox', true>;
    AllowQuestionEditUntil: Attribute.DateTime;
    RequiresPickup: Attribute.Boolean & Attribute.Required;
  };
}

export interface EventsQuotas extends Schema.Component {
  collectionName: 'components_events_quotas';
  info: {
    displayName: 'TicketTypes';
    icon: 'television';
    description: '';
  };
  attributes: {
    RegistrationStartsAt: Attribute.DateTime & Attribute.Required;
    RegistrationEndsAt: Attribute.DateTime & Attribute.Required;
    TicketsTotal: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<10>;
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
    Price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    NameFi: Attribute.String & Attribute.Required;
    NameEn: Attribute.String & Attribute.Required;
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

export interface EventsQuestionsText extends Schema.Component {
  collectionName: 'components_events_questions_texts';
  info: {
    displayName: 'QuestionsText';
    description: '';
  };
  attributes: {
    QuestionFi: Attribute.String & Attribute.Required;
    QuestionEn: Attribute.String & Attribute.Required;
    MinLength: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<3>;
    MaxLength: Attribute.Integer &
      Attribute.Required &
      Attribute.DefaultTo<500>;
    Required: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
  };
}

export interface EventsQuestionsSelect extends Schema.Component {
  collectionName: 'components_events_questions_selects';
  info: {
    displayName: 'QuestionsSelect';
    description: '';
  };
  attributes: {
    QuestionEn: Attribute.String & Attribute.Required;
    QuestionFi: Attribute.String & Attribute.Required;
    ChoicesFi: Attribute.String & Attribute.Required;
    ChoicesEn: Attribute.String & Attribute.Required;
  };
}

export interface EventsQuestionsCheckbox extends Schema.Component {
  collectionName: 'components_events_questions_checkboxes';
  info: {
    displayName: 'QuestionsCheckbox';
    description: '';
  };
  attributes: {
    QuestionFi: Attribute.String & Attribute.Required;
    QuestionEn: Attribute.String & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export namespace Shared {
    export interface Components {
      'shared.seo': SharedSeo;
      'shared.page-content': SharedPageContent;
      'shared.meta-twitter': SharedMetaTwitter;
      'shared.meta-open-graph': SharedMetaOpenGraph;
      'shared.contact-banner': SharedContactBanner;
      'events.registration': EventsRegistration;
      'events.quotas': EventsQuotas;
      'events.questions-text': EventsQuestionsText;
      'events.questions-select': EventsQuestionsSelect;
      'events.questions-checkbox': EventsQuestionsCheckbox;
    }
  }
}
