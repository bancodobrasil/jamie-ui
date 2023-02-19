import { TreeItemProps } from '@mui/lab';
import { EnumInputAction } from './common';
import { IMenuItem } from './model';

export interface INode
  extends Omit<TreeItemProps, 'id' | 'nodeId' | 'children' | 'label'>,
    Omit<IMenuItem, 'id' | 'children'> {
  id: number;
  children: INode[];
  action?: EnumInputAction;
  original?: INode;
}

export interface IEditingNode extends INode {
  action: EnumInputAction;
  original: INode;
}
