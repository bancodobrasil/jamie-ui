import { DateTime } from 'luxon';
import { EnumInputAction } from './common';
import { EnumTemplateFormat } from './template';

export interface IMenu {
  id: number;
  name: string;
  mustDeferChanges: boolean;
  meta: IMenuMeta[];
  items: IMenuItem[];
  template?: string;
  templateFormat?: EnumTemplateFormat;
  defaultTemplate?: {
    [EnumTemplateFormat.JSON]: string;
    [EnumTemplateFormat.XML]: string;
    [EnumTemplateFormat.PLAIN]: string;
  };
  createdAt?: DateTime;
  updatedAt?: DateTime;
  version?: number;
}

export interface IMenuItem {
  id: number;
  label: string;
  order: number;
  meta: IMenuItemMeta;
  enabled: boolean;
  startPublication?: DateTime;
  endPublication?: DateTime;
  children?: IMenuItem[];
  parent?: Omit<IMenuItem, 'children'>;
  parentId?: number;
  menu?: IMenu;
  template?: string;
  templateFormat?: EnumTemplateFormat;
  defaultTemplate?: {
    [EnumTemplateFormat.JSON]: string;
    [EnumTemplateFormat.XML]: string;
    [EnumTemplateFormat.PLAIN]: string;
  };
  menuId?: number;
  createdAt?: DateTime;
  updatedAt?: DateTime;
  version?: number;
}

export enum MenuMetaType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  // TIME = 'time',
  // DATETIME = 'datetime',
  // SELECT = 'select',
  // RADIO = 'radio',
  // CHECKBOX = 'checkbox',
  // TEXTAREA = 'textarea',
  // IMAGE = 'image',
  // FILE = 'file',
  // COLOR = 'color',
  // RICHTEXT = 'richtext',
  // MARKDOWN = 'markdown',
  // HTML = 'html',
  // JSON = 'json',
  // ARRAY = 'array',
  // OBJECT = 'object',
}

export interface IMenuMeta {
  action?: EnumInputAction;
  id?: number;
  name: string;
  order: number;
  required: boolean;
  enabled: boolean;
  defaultValue?: unknown;
  type: MenuMetaType;
}

export interface IMenuMetaWithErrors extends IMenuMeta {
  errors: {
    [field: string]: string;
  };
}

export interface IMenuItemMeta {
  [key: string]: unknown;
}

export interface IKeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface IMenuPendency {
  id: number;
  menuId: number;
  submittedBy: IKeycloakUser;
  input: any;
  createdAt: string;
}
