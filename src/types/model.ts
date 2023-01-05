import { IFieldError } from './common';

export interface IMenu {
  id: number;
  name: string;
  meta: IMenuMeta[];
  items: IMenuItem[];
}

export interface IMenuItem {
  id: number;
  label: string;
  order: number;
  meta: IMenuItemMeta[];
  children?: IMenuItem[];
  parent?: Omit<IMenuItem, 'children'>;
  menu?: IMenu;
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
  name: string;
  required: boolean;
  type: MenuMetaType;
}

export interface IMenuMetaWithErrors extends IMenuMeta {
  errors: IFieldError;
}

export interface IMenuItemMeta extends IMenuMeta {
  value: unknown;
}
