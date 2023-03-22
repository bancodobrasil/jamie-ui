import { TreeItemProps } from '@mui/lab';
import { DateTime } from 'luxon';
import { EnumInputAction } from './common';
import { IMenuItem } from './model';

export interface INode
  extends Omit<TreeItemProps, 'id' | 'nodeId' | 'children' | 'label'>,
    Omit<IMenuItem, 'id' | 'children' | 'startPublication' | 'endPublication'> {
  id: number;
  children: INode[];
  startPublication?: DateTime;
  endPublication?: DateTime;
  action?: EnumInputAction;
  original?: INode;
}

export interface IEditingNode extends INode {
  action: EnumInputAction;
  original: INode;
}
