/* eslint-disable */

import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiBoardMemberBoardMember extends Schema.CollectionType {
  collectionName: 'board_members';
  info: {
    description: '';
    displayName: 'BoardMember';
    pluralName: 'board-members';
    singularName: 'board-member';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    boardRoles: Attribute.Relation<
      'api::board-member.board-member',
      'oneToMany',
      'api::board-role.board-role'
    >;
    boards: Attribute.Relation<
      'api::board-member.board-member',
      'manyToMany',
      'api::board.board'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::board-member.board-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    fullName: Attribute.String & Attribute.Required;
    image: Attribute.Media<'images'>;
    isBoardMember: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<false>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::board-member.board-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    year: Attribute.Integer & Attribute.Required & Attribute.Private;
  };
}

export interface ApiBoardRoleBoardRole extends Schema.CollectionType {
  collectionName: 'board_roles';
  info: {
    description: '';
    displayName: 'BoardRole';
    pluralName: 'board-roles';
    singularName: 'board-role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::board-role.board-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::board-role.board-role',
      'oneToMany',
      'api::board-role.board-role'
    >;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::board-role.board-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBoardBoard extends Schema.CollectionType {
  collectionName: 'boards';
  info: {
    description: '';
    displayName: 'Boards';
    pluralName: 'boards';
    singularName: 'board';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    boardMembers: Attribute.Relation<
      'api::board.board',
      'manyToMany',
      'api::board-member.board-member'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::board.board',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::board.board',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    year: Attribute.Integer & Attribute.Required & Attribute.Unique;
  };
}

export interface ApiCollaborationCompanyCollaborationCompany
  extends Schema.SingleType {
  collectionName: 'collaboration_companies';
  info: {
    description: '';
    displayName: 'CollaborationCompanies';
    pluralName: 'collaboration-companies';
    singularName: 'collaboration-company';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::collaboration-company.collaboration-company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::collaboration-company.collaboration-company',
      'oneToMany',
      'api::collaboration-company.collaboration-company'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::collaboration-company.collaboration-company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCollaborationGeneralCollaborationGeneral
  extends Schema.SingleType {
  collectionName: 'collaboration_generals';
  info: {
    description: '';
    displayName: 'CollaborationGeneral';
    pluralName: 'collaboration-generals';
    singularName: 'collaboration-general';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ContactBanner: Attribute.Component<'shared.contact-banner'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::collaboration-general.collaboration-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::collaboration-general.collaboration-general',
      'oneToMany',
      'api::collaboration-general.collaboration-general'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::collaboration-general.collaboration-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCollaborationJobOpportunityCollaborationJobOpportunity
  extends Schema.SingleType {
  collectionName: 'collaboration_job_opportunities';
  info: {
    description: '';
    displayName: 'CollaborationJobOpportunities';
    pluralName: 'collaboration-job-opportunities';
    singularName: 'collaboration-job-opportunity';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::collaboration-job-opportunity.collaboration-job-opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::collaboration-job-opportunity.collaboration-job-opportunity',
      'oneToMany',
      'api::collaboration-job-opportunity.collaboration-job-opportunity'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::collaboration-job-opportunity.collaboration-job-opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCompanyCompany extends Schema.CollectionType {
  collectionName: 'companies';
  info: {
    description: '';
    displayName: 'Companies';
    pluralName: 'companies';
    singularName: 'company';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    foundedYear: Attribute.Integer &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    homepageUrl: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::company.company',
      'oneToMany',
      'api::company.company'
    >;
    logo: Attribute.Media<'images'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    logoDark: Attribute.Media<'images'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    openJobsUrl: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::company.company',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactContact extends Schema.SingleType {
  collectionName: 'contacts';
  info: {
    description: '';
    displayName: 'Contact';
    pluralName: 'contacts';
    singularName: 'contact';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::contact.contact',
      'oneToMany',
      'api::contact.contact'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::contact.contact',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEventRoleEventRole extends Schema.CollectionType {
  collectionName: 'event_roles';
  info: {
    description: '';
    displayName: 'EventRoles';
    pluralName: 'event-roles';
    singularName: 'event-role';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::event-role.event-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    Description: Attribute.Text & Attribute.Required & Attribute.Private;
    RoleId: Attribute.UID & Attribute.Required;
    Title: Attribute.String & Attribute.Required & Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::event-role.event-role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiEventEvent extends Schema.CollectionType {
  collectionName: 'events';
  info: {
    description: '';
    displayName: 'Events';
    pluralName: 'events';
    singularName: 'event';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    Alcohol: Attribute.Enumeration<
      ['no_alcohol', 'some_alcohol', 'full_alcohol']
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::event.event',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    DescriptionEn: Attribute.Blocks & Attribute.Required;
    DescriptionFi: Attribute.Blocks & Attribute.Required;
    EndDate: Attribute.DateTime & Attribute.Required;
    FuksiPoints: Attribute.Enumeration<
      ['fuksi_points_true', 'fuksi_points_false']
    >;
    Image: Attribute.Media<'images'>;
    ImageEn: Attribute.Media<'images'>;
    LocationEn: Attribute.String & Attribute.Required;
    LocationFi: Attribute.String & Attribute.Required;
    NameEn: Attribute.String & Attribute.Required;
    NameFi: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    Registration: Attribute.Component<'events.registration'>;
    ShowInCalendar: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    StartDate: Attribute.DateTime & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::event.event',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    VisibleOnlyForRoles: Attribute.Relation<
      'api::event.event',
      'oneToMany',
      'api::event-role.event-role'
    >;
  };
}

export interface ApiEventsCalendarEventsCalendar extends Schema.SingleType {
  collectionName: 'events_calendars';
  info: {
    description: '';
    displayName: 'EventsCalendar';
    pluralName: 'events-calendars';
    singularName: 'events-calendar';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::events-calendar.events-calendar',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::events-calendar.events-calendar',
      'oneToMany',
      'api::events-calendar.events-calendar'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::events-calendar.events-calendar',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiJobOpportunityJobOpportunity extends Schema.CollectionType {
  collectionName: 'job_opportunities';
  info: {
    description: '';
    displayName: 'JobOpportunities';
    pluralName: 'job-opportunities';
    singularName: 'job-opportunity';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::job-opportunity.job-opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    homepageUrl: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    jobOpportunityDateEnding: Attribute.Date &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    jobOpportunityDatePublished: Attribute.Date &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    jobOpportunityTargetGroup: Attribute.Enumeration<
      ['everybody', 'computer_science', 'mathematics', 'data_analysis']
    > &
      Attribute.Required;
    jobOpportunityUrl: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    jobTitle: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::job-opportunity.job-opportunity',
      'oneToMany',
      'api::job-opportunity.job-opportunity'
    >;
    logo: Attribute.Media<'images'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::job-opportunity.job-opportunity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLuuppiSanomatLuuppiSanomat extends Schema.CollectionType {
  collectionName: 'luuppi_sanomats';
  info: {
    description: '';
    displayName: 'LuuppiSanomat';
    pluralName: 'luuppi-sanomats';
    singularName: 'luuppi-sanomat';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::luuppi-sanomat.luuppi-sanomat',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    image: Attribute.Media<'images'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::luuppi-sanomat.luuppi-sanomat',
      'oneToMany',
      'api::luuppi-sanomat.luuppi-sanomat'
    >;
    pdf: Attribute.Media<'files'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    publishedAt: Attribute.DateTime;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::luuppi-sanomat.luuppi-sanomat',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMeetingMinuteDocumentMeetingMinuteDocument
  extends Schema.CollectionType {
  collectionName: 'meeting_minute_documents';
  info: {
    description: '';
    displayName: 'MeetingMinuteDocument';
    pluralName: 'meeting-minute-documents';
    singularName: 'meeting-minute-document';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::meeting-minute-document.meeting-minute-document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    image: Attribute.Media<'images'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::meeting-minute-document.meeting-minute-document',
      'oneToMany',
      'api::meeting-minute-document.meeting-minute-document'
    >;
    meetingDate: Attribute.DateTime & Attribute.Required;
    pdf: Attribute.Media<'files'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    publishedAt: Attribute.DateTime;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    shortMeetingName: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::meeting-minute-document.meeting-minute-document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    year: Attribute.Integer & Attribute.Required & Attribute.Private;
  };
}

export interface ApiNewsListNewsList extends Schema.SingleType {
  collectionName: 'news_lists';
  info: {
    description: '';
    displayName: 'NewsList';
    pluralName: 'news-lists';
    singularName: 'news-list';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::news-list.news-list',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::news-list.news-list',
      'oneToMany',
      'api::news-list.news-list'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::news-list.news-list',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNewsSingleNewsSingle extends Schema.CollectionType {
  collectionName: 'news';
  info: {
    description: '';
    displayName: 'News';
    pluralName: 'news';
    singularName: 'news-single';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    authorImage: Attribute.Media<'images'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    authorName: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    authorTitle: Attribute.String &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    banner: Attribute.Media<'images'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: false;
        };
      }>;
    category: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    content: Attribute.Blocks &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::news-single.news-single',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::news-single.news-single',
      'oneToMany',
      'api::news-single.news-single'
    >;
    publishedAt: Attribute.DateTime;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    slug: Attribute.UID<'api::news-single.news-single', 'title'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::news-single.news-single',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiNotificationNotification extends Schema.SingleType {
  collectionName: 'notifications';
  info: {
    description: '';
    displayName: 'Notification';
    pluralName: 'notifications';
    singularName: 'notification';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::notification.notification',
      'oneToMany',
      'api::notification.notification'
    >;
    notification: Attribute.Blocks &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    showUntil: Attribute.DateTime &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::notification.notification',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationAlumniOrganizationAlumni
  extends Schema.SingleType {
  collectionName: 'organization_alumni';
  info: {
    description: '';
    displayName: 'OrganizationAlumni';
    pluralName: 'organization-alumnis';
    singularName: 'organization-alumni';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-alumni.organization-alumni',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-alumni.organization-alumni',
      'oneToMany',
      'api::organization-alumni.organization-alumni'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-alumni.organization-alumni',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationBenefitOrganizationBenefit
  extends Schema.SingleType {
  collectionName: 'organization_benefits';
  info: {
    description: '';
    displayName: 'OrganizationBenefits';
    pluralName: 'organization-benefits';
    singularName: 'organization-benefit';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-benefit.organization-benefit',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-benefit.organization-benefit',
      'oneToMany',
      'api::organization-benefit.organization-benefit'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-benefit.organization-benefit',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationDocumentOrganizationDocument
  extends Schema.SingleType {
  collectionName: 'organization_documents';
  info: {
    description: '';
    displayName: 'OrganizationDocuments';
    pluralName: 'organization-documents';
    singularName: 'organization-document';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-document.organization-document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-document.organization-document',
      'oneToMany',
      'api::organization-document.organization-document'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-document.organization-document',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationGeneralOrganizationGeneral
  extends Schema.SingleType {
  collectionName: 'organization_generals';
  info: {
    description: '';
    displayName: 'OrganizationGeneral';
    pluralName: 'organization-generals';
    singularName: 'organization-general';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-general.organization-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-general.organization-general',
      'oneToMany',
      'api::organization-general.organization-general'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-general.organization-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationHonoraryMemberOrganizationHonoraryMember
  extends Schema.SingleType {
  collectionName: 'organization_honorary_members';
  info: {
    description: '';
    displayName: 'OrganizationHonoraryMembers';
    pluralName: 'organization-honorary-members';
    singularName: 'organization-honorary-member';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-honorary-member.organization-honorary-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-honorary-member.organization-honorary-member',
      'oneToMany',
      'api::organization-honorary-member.organization-honorary-member'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-honorary-member.organization-honorary-member',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationOfficeHervantaOrganizationOfficeHervanta
  extends Schema.SingleType {
  collectionName: 'organization_offices_hervanta';
  info: {
    description: '';
    displayName: 'OrganizationOfficeHervanta';
    pluralName: 'organization-offices-hervanta';
    singularName: 'organization-office-hervanta';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-office-hervanta.organization-office-hervanta',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-office-hervanta.organization-office-hervanta',
      'oneToMany',
      'api::organization-office-hervanta.organization-office-hervanta'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-office-hervanta.organization-office-hervanta',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationOfficeOrganizationOffice
  extends Schema.SingleType {
  collectionName: 'organization_offices';
  info: {
    description: '';
    displayName: 'OrganizationOffice';
    pluralName: 'organization-offices';
    singularName: 'organization-office';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-office.organization-office',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-office.organization-office',
      'oneToMany',
      'api::organization-office.organization-office'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-office.organization-office',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationRuleOrganizationRule extends Schema.SingleType {
  collectionName: 'organization_rules';
  info: {
    description: '';
    displayName: 'OrganizationRules';
    pluralName: 'organization-rules';
    singularName: 'organization-rule';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-rule.organization-rule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-rule.organization-rule',
      'oneToMany',
      'api::organization-rule.organization-rule'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-rule.organization-rule',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrganizationTraditionGuidelineOrganizationTraditionGuideline
  extends Schema.SingleType {
  collectionName: 'organization_tradition_guidelines';
  info: {
    description: '';
    displayName: 'OrganizationTraditionGuidelines';
    pluralName: 'organization-tradition-guidelines';
    singularName: 'organization-tradition-guideline';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::organization-tradition-guideline.organization-tradition-guideline',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::organization-tradition-guideline.organization-tradition-guideline',
      'oneToMany',
      'api::organization-tradition-guideline.organization-tradition-guideline'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::organization-tradition-guideline.organization-tradition-guideline',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPrivacyPolicyPrivacyPolicy extends Schema.SingleType {
  collectionName: 'privacy_policies';
  info: {
    description: '';
    displayName: 'PrivacyPolicy';
    pluralName: 'privacy-policies';
    singularName: 'privacy-policy';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::privacy-policy.privacy-policy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::privacy-policy.privacy-policy',
      'oneToMany',
      'api::privacy-policy.privacy-policy'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::privacy-policy.privacy-policy',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSportSport extends Schema.SingleType {
  collectionName: 'sports';
  info: {
    description: '';
    displayName: 'Sports';
    pluralName: 'sports';
    singularName: 'sport';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ContactBanner: Attribute.Component<'shared.contact-banner'> &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::sport.sport',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::sport.sport',
      'oneToMany',
      'api::sport.sport'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::sport.sport',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStudiesGeneralStudiesGeneral extends Schema.SingleType {
  collectionName: 'studies_generals';
  info: {
    description: '';
    displayName: 'StudiesGeneral';
    pluralName: 'studies-generals';
    singularName: 'studies-general';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ContactBanner: Attribute.Component<'shared.contact-banner'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::studies-general.studies-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::studies-general.studies-general',
      'oneToMany',
      'api::studies-general.studies-general'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::studies-general.studies-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStudiesWorkshopStudiesWorkshop extends Schema.SingleType {
  collectionName: 'studies_workshops';
  info: {
    description: '';
    displayName: 'StudiesWorkshops';
    pluralName: 'studies-workshops';
    singularName: 'studies-workshop';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ContactBanner: Attribute.Component<'shared.contact-banner'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::studies-workshop.studies-workshop',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::studies-workshop.studies-workshop',
      'oneToMany',
      'api::studies-workshop.studies-workshop'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::studies-workshop.studies-workshop',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTutoringFaqTutoringFaq extends Schema.SingleType {
  collectionName: 'tutoring_faqs';
  info: {
    description: '';
    displayName: 'TutoringFaq';
    pluralName: 'tutoring-faqs';
    singularName: 'tutoring-faq';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::tutoring-faq.tutoring-faq',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::tutoring-faq.tutoring-faq',
      'oneToMany',
      'api::tutoring-faq.tutoring-faq'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::tutoring-faq.tutoring-faq',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTutoringGeneralTutoringGeneral extends Schema.SingleType {
  collectionName: 'tutoring_generals';
  info: {
    description: '';
    displayName: 'TutoringGeneral';
    pluralName: 'tutoring-generals';
    singularName: 'tutoring-general';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    ContactBanner: Attribute.Component<'shared.contact-banner'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::tutoring-general.tutoring-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::tutoring-general.tutoring-general',
      'oneToMany',
      'api::tutoring-general.tutoring-general'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::tutoring-general.tutoring-general',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTutoringLarpakeTutoringLarpake extends Schema.SingleType {
  collectionName: 'tutoring_larpakes';
  info: {
    description: '';
    displayName: 'TutoringLarpake';
    pluralName: 'tutoring-larpakes';
    singularName: 'tutoring-larpake';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    i18n: {
      localized: true;
    };
  };
  attributes: {
    Content: Attribute.Component<'shared.page-content'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::tutoring-larpake.tutoring-larpake',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    locale: Attribute.String;
    localizations: Attribute.Relation<
      'api::tutoring-larpake.tutoring-larpake',
      'oneToMany',
      'api::tutoring-larpake.tutoring-larpake'
    >;
    Seo: Attribute.Component<'shared.seo'> &
      Attribute.Required &
      Attribute.SetPluginOptions<{
        i18n: {
          localized: true;
        };
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::tutoring-larpake.tutoring-larpake',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::board-member.board-member': ApiBoardMemberBoardMember;
      'api::board-role.board-role': ApiBoardRoleBoardRole;
      'api::board.board': ApiBoardBoard;
      'api::collaboration-company.collaboration-company': ApiCollaborationCompanyCollaborationCompany;
      'api::collaboration-general.collaboration-general': ApiCollaborationGeneralCollaborationGeneral;
      'api::collaboration-job-opportunity.collaboration-job-opportunity': ApiCollaborationJobOpportunityCollaborationJobOpportunity;
      'api::company.company': ApiCompanyCompany;
      'api::contact.contact': ApiContactContact;
      'api::event-role.event-role': ApiEventRoleEventRole;
      'api::event.event': ApiEventEvent;
      'api::events-calendar.events-calendar': ApiEventsCalendarEventsCalendar;
      'api::job-opportunity.job-opportunity': ApiJobOpportunityJobOpportunity;
      'api::luuppi-sanomat.luuppi-sanomat': ApiLuuppiSanomatLuuppiSanomat;
      'api::meeting-minute-document.meeting-minute-document': ApiMeetingMinuteDocumentMeetingMinuteDocument;
      'api::news-list.news-list': ApiNewsListNewsList;
      'api::news-single.news-single': ApiNewsSingleNewsSingle;
      'api::notification.notification': ApiNotificationNotification;
      'api::organization-alumni.organization-alumni': ApiOrganizationAlumniOrganizationAlumni;
      'api::organization-benefit.organization-benefit': ApiOrganizationBenefitOrganizationBenefit;
      'api::organization-document.organization-document': ApiOrganizationDocumentOrganizationDocument;
      'api::organization-general.organization-general': ApiOrganizationGeneralOrganizationGeneral;
      'api::organization-honorary-member.organization-honorary-member': ApiOrganizationHonoraryMemberOrganizationHonoraryMember;
      'api::organization-office-hervanta.organization-office-hervanta': ApiOrganizationOfficeHervantaOrganizationOfficeHervanta;
      'api::organization-office.organization-office': ApiOrganizationOfficeOrganizationOffice;
      'api::organization-rule.organization-rule': ApiOrganizationRuleOrganizationRule;
      'api::organization-tradition-guideline.organization-tradition-guideline': ApiOrganizationTraditionGuidelineOrganizationTraditionGuideline;
      'api::privacy-policy.privacy-policy': ApiPrivacyPolicyPrivacyPolicy;
      'api::sport.sport': ApiSportSport;
      'api::studies-general.studies-general': ApiStudiesGeneralStudiesGeneral;
      'api::studies-workshop.studies-workshop': ApiStudiesWorkshopStudiesWorkshop;
      'api::tutoring-faq.tutoring-faq': ApiTutoringFaqTutoringFaq;
      'api::tutoring-general.tutoring-general': ApiTutoringGeneralTutoringGeneral;
      'api::tutoring-larpake.tutoring-larpake': ApiTutoringLarpakeTutoringLarpake;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
