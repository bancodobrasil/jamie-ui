export interface IMenu {
  id: number;
  name: string;
  items?: IMenuItem[];
  meta?: IMenuMeta[];
}

export interface IMenuItem {
  id: number;
  label: string;
  order: number;
  meta?: IMenuItemMeta[];
  children?: IMenuItem[];
  parent?: Omit<IMenuItem, 'children'>;
  menu?: IMenu;
}

export interface IMenuMeta {
  name: string;
  required: boolean;
  type: string;
}

export interface IMenuItemMeta extends IMenuMeta {
  value: unknown;
}
