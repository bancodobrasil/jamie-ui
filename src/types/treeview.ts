import { TreeItemProps } from '@mui/lab';
import { EnumInputAction } from './common';
import { IMenuItemMeta } from './model';

export interface INode extends Omit<TreeItemProps, 'id' | 'nodeId' | 'children'> {
  id: number;
  order: number;
  children: INode[];
  meta: IMenuItemMeta;
  parentId?: number;
  action?: EnumInputAction;
  original?: INode;
}

export interface IEditingNode extends INode {
  action: EnumInputAction;
  original: INode;
}
