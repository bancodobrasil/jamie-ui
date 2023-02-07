import { TreeItemProps } from '@mui/lab';
import { IMenuItemMeta } from './model';

export enum EnumAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface INode extends Omit<TreeItemProps, 'id' | 'nodeId' | 'children'> {
  id: number;
  order: number;
  children: INode[];
  meta: IMenuItemMeta;
  parentId?: number;
  action?: EnumAction;
  original?: INode;
}

export interface IEditingNode extends INode {
  action: EnumAction;
  original: INode;
}
