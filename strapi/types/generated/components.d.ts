import type { Schema, Struct } from '@strapi/strapi';

export interface EventsQuestionsCheckbox extends Struct.ComponentSchema {
  collectionName: 'components_events_questions_checkboxes';
  info: {
    description: '';
    displayName: 'QuestionsCheckbox';
  };
  attributes: {
    QuestionEn: Schema.Attribute.String & Schema.Attribute.Required;
    QuestionFi: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface EventsQuestionsSelect extends Struct.ComponentSchema {
  collectionName: 'components_events_questions_selects';
  info: {
    description: '';
    displayName: 'QuestionsSelect';
  };
  attributes: {
    ChoicesEn: Schema.Attribute.String & Schema.Attribute.Required;
    ChoicesFi: Schema.Attribute.String & Schema.Attribute.Required;
    QuestionEn: Schema.Attribute.String & Schema.Attribute.Required;
    QuestionFi: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface EventsQuestionsText extends Struct.ComponentSchema {
  collectionName: 'components_events_questions_texts';
  info: {
    description: '';
    displayName: 'QuestionsText';
  };
  attributes: {
    MaxLength: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<500>;
    MinLength: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<3>;
    QuestionEn: Schema.Attribute.String & Schema.Attribute.Required;
    QuestionFi: Schema.Attribute.String & Schema.Attribute.Required;
    Required: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface EventsQuotas extends Struct.ComponentSchema {
  collectionName: 'components_events_quotas';
  info: {
    description: '';
    displayName: 'TicketTypes';
    icon: 'television';
  };
  attributes: {
    NameEn: Schema.Attribute.String & Schema.Attribute.Required;
    NameFi: Schema.Attribute.String & Schema.Attribute.Required;
    Price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    RegistrationEndsAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    RegistrationStartsAt: Schema.Attribute.DateTime & Schema.Attribute.Required;
    Role: Schema.Attribute.Relation<'oneToOne', 'api::event-role.event-role'> &
      Schema.Attribute.Required;
    TicketsAllowedToBuy: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    TicketsTotal: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    Weight: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
  };
}

export interface EventsRegistration extends Struct.ComponentSchema {
  collectionName: 'components_events_registrations';
  info: {
    description: '';
    displayName: 'Registration';
    icon: 'key';
  };
  attributes: {
    AllowQuestionEditUntil: Schema.Attribute.DateTime;
    QuestionsCheckbox: Schema.Attribute.Component<
      'events.questions-checkbox',
      true
    >;
    QuestionsSelect: Schema.Attribute.Component<
      'events.questions-select',
      true
    >;
    QuestionsText: Schema.Attribute.Component<'events.questions-text', true>;
    RequiresPickup: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    RoleToGive: Schema.Attribute.Relation<
      'oneToOne',
      'api::event-role.event-role'
    >;
    TicketTypes: Schema.Attribute.Component<'events.quotas', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SharedContactBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_banners';
  info: {
    displayName: 'ContactBanner';
    icon: 'message';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMetaOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_open_graphs';
  info: {
    description: '';
    displayName: 'metaOpenGraph';
    icon: 'link';
  };
  attributes: {
    openGraphDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    openGraphImage: Schema.Attribute.Media<'images'>;
    openGraphTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface SharedMetaTwitter extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_twitters';
  info: {
    description: '';
    displayName: 'MetaTwitter';
    icon: 'twitter';
  };
  attributes: {
    twitterDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    twitterImage: Schema.Attribute.Media<'images'>;
    twitterTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface SharedPageContent extends Struct.ComponentSchema {
  collectionName: 'components_shared_page_contents';
  info: {
    description: '';
    displayName: 'PageContent';
    icon: 'write';
  };
  attributes: {
    banner: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'search';
  };
  attributes: {
    metaAuthor: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    metaKeywords: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    openGraph: Schema.Attribute.Component<'shared.meta-open-graph', false> &
      Schema.Attribute.Required;
    twitter: Schema.Attribute.Component<'shared.meta-twitter', false> &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
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
