import React from 'react';
import { Box, Divider, IconButton, ListItemText, Menu, MenuItem, MenuList } from '@mui/material';
import { TreeItem, TreeView } from '@mui/lab';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { EnumInputAction, IEditingNode, INode } from '../../../types';

interface CustomTreeItemProps {
  key: string | number;
  node: INode;
  color: string;
  fontWeight: string;
  renderNodes: (nodes: INode[]) => JSX.Element[];
}

const CustomTreeItem = ({ key, node, color, fontWeight, renderNodes }: CustomTreeItemProps) => {
  const { id, label, children } = node;

  const baseSX = {
    border: '1px solid #eaeaec',
    margin: '3px 0px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '12px 0px 13px 25px',
  };

  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleClose = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  return (
    <TreeItem
      key={key}
      nodeId={id.toString()}
      label={
        <Box className="flex items-center">
          <Box className="flex-1">{label}</Box>
          <IconButton sx={{ float: 'right', mr: 1 }} size="small" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuList>
              <MenuItem onClick={handleClose}>
                <ListItemText>{t('menu.preview.actions.insertChild')}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <ListItemText>{t('menu.preview.actions.editTemplate')}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>{t('buttons.delete')}</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      }
      sx={{
        '& > .MuiTreeItem-content': {
          ...baseSX,
          color,
          fontWeight,
        },
      }}
    >
      {children?.length > 0 && renderNodes(children)}
    </TreeItem>
  );
};

const ArrowDownwardIcon = () => <ArrowForwardIosIcon sx={{ transform: 'rotate(90deg)' }} />;

interface Props {
  nodes: INode[];
  editingNode: IEditingNode;
  expanded: string[];
  setExpanded: (expanded: string[]) => void;
  selected: string;
  setSelected: (selected: string) => void;
  preview: (nodes: INode[], editingNode: IEditingNode) => INode[];
}

export const NodeTreeView = ({
  nodes,
  editingNode,
  expanded,
  setExpanded,
  selected,
  setSelected,
  preview,
}: Props) => {
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(nodeId);
  };

  const renderNodes = React.useCallback(
    (nodes: INode[]) =>
      nodes.map(node => {
        let color = 'black';
        const fontWeight = node.id === editingNode.id ? 'bold' : 'normal';
        switch (node.action) {
          case EnumInputAction.CREATE:
            color = 'green';
            break;
          case EnumInputAction.UPDATE:
            color = 'orange';
            break;
          case EnumInputAction.DELETE:
            color = 'red';
            break;
        }
        return (
          <CustomTreeItem
            key={node.id}
            node={node}
            color={color}
            fontWeight={fontWeight}
            renderNodes={renderNodes}
          />
        );
      }),
    [editingNode.id],
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f4f5f7',
        p: '1rem',
        overflowY: 'auto',
      }}
    >
      <TreeView
        defaultExpandIcon={<ArrowForwardIosIcon />}
        defaultCollapseIcon={<ArrowDownwardIcon />}
        defaultExpanded={['0']}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
      >
        {renderNodes(preview(nodes, editingNode))}
      </TreeView>
    </Box>
  );
};
