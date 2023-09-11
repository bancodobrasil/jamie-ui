import React from 'react';
import { Box, Divider, IconButton, ListItemText, Menu, MenuItem, MenuList } from '@mui/material';
import { TreeItem, TreeView } from '@mui/lab';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { EnumInputAction, IEditingNode, INode } from '../../../types';

interface CustomTreeItemProps {
  node: INode;
  color: string;
  fontWeight: string;
  renderNodes: (nodes: INode[]) => JSX.Element[];
  setSelected: (selected: string) => void;
  emptyEditingNode: IEditingNode;
  setEditingNode: (editingNode: IEditingNode) => void;
  handleUpdate: () => Promise<void>;
}

const CustomTreeItem = ({
  node,
  color,
  fontWeight,
  renderNodes,
  setSelected,
  emptyEditingNode,
  setEditingNode,
  handleUpdate,
}: CustomTreeItemProps) => {
  const { id, label, children } = node;

  const baseSX = {
    border: '1px solid #eaeaec',
    margin: '3px 0px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '12px 0px 13px 25px',
  };

  const { id: menuId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [confirmedDelete, setConfirmedDelete] = React.useState(false);

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

  const handleDelete = async (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (id === 0) {
      setSelected('');
      return;
    }
    setEditingNode({
      ...node,
      action: EnumInputAction.DELETE,
      original: node,
    });
    setAnchorEl(null);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, 100));
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(t('menu.preview.alerts.deleteItem.message'));
    if (!confirmed) {
      setEditingNode(emptyEditingNode);
      // TODO: not working setSelected after cancel delete
      setSelected(id.toString());
    }
    setConfirmedDelete(confirmed);
  };

  React.useEffect(() => {
    if (confirmedDelete) {
      handleUpdate();
    }
  }, [confirmedDelete, handleUpdate]);

  const handleEditTemplate = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    navigate(`/menus/${menuId}/items/${id}`);
    setAnchorEl(null);
  };

  return (
    <TreeItem
      nodeId={id.toString()}
      label={
        <Box className="flex items-center">
          <Box className="flex-1" sx={{ color, fontWeight }}>
            {label}
          </Box>
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
              <MenuItem onClick={handleEditTemplate}>
                <ListItemText>{t('menu.preview.actions.editTemplate')}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleDelete}>{t('buttons.delete')}</MenuItem>
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
  emptyEditingNode: IEditingNode;
  editingNode: IEditingNode;
  setEditingNode: (editingNode: IEditingNode) => void;
  expanded: string[];
  setExpanded: (expanded: string[]) => void;
  selected: string;
  setSelected: (selected: string) => void;
  preview: (nodes: INode[], editingNode: IEditingNode) => INode[];
  handleUpdate: () => Promise<void>;
}

export const NodeTreeView = ({
  nodes,
  emptyEditingNode,
  editingNode,
  setEditingNode,
  expanded,
  setExpanded,
  selected,
  setSelected,
  preview,
  handleUpdate,
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
            setSelected={setSelected}
            emptyEditingNode={emptyEditingNode}
            setEditingNode={setEditingNode}
            handleUpdate={handleUpdate}
          />
        );
      }),
    [editingNode.id, emptyEditingNode, handleUpdate, setEditingNode, setSelected],
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
