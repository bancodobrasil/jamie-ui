import { EnumInputAction } from './common';
import { IMenuMeta } from './model';
import { EnumTemplateFormat } from './template';

export interface IUpdateMenuMetaInput extends Partial<IMenuMeta> {
  action: EnumInputAction;
}

export interface IUpdateMenuItemInput {
  action: EnumInputAction;
  id?: number;
  label?: string;
  order?: number;
  meta?: Record<string, unknown>;
  enabled?: boolean;
  startPublication?: string;
  endPublication?: string;
  template?: string;
  templateFormat?: EnumTemplateFormat;
  children?: IUpdateMenuItemInput[];
}

export interface IUpdateMenuInput {
  id: number;
  name?: string;
  mustDeferChanges?: boolean;
  meta?: IUpdateMenuMetaInput[];
  items?: IUpdateMenuItemInput[];
  template?: string;
  templateFormat?: EnumTemplateFormat;
}
