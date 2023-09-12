import React from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import { TreeItem, TreeView } from '@mui/lab';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { EnumInputAction, IEditingNode, INode, MenuMetaType } from '../../../types';
import { EnumInputActionScreen } from '../../../pages/Menu/Items';
import { IconPlus } from '../../Icons/IconPlus';

interface CustomTreeItemProps {
  node: INode;
  color: string;
  fontWeight: string;
  renderNodes: (nodes: INode[]) => JSX.Element[];
  setSelected: (selected: string) => void;
  emptyEditingNode: IEditingNode;
  editingNode: IEditingNode;
  setEditingNode: (editingNode: IEditingNode) => void;
  handleUpdate: () => Promise<void>;
  data: any;
  setOperationScreen: (operationScreen: EnumInputActionScreen) => void;
}

const CustomTreeItem = ({
  node,
  color,
  fontWeight,
  renderNodes,
  setSelected,
  emptyEditingNode,
  editingNode,
  setEditingNode,
  handleUpdate,
  data,
  setOperationScreen,
}: CustomTreeItemProps) => {
  const { id, label, children, meta } = node;

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

  const handleInsert = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
    const itemMeta = { ...meta };
    data?.menu.meta?.forEach(m => {
      const defaultValue = (meta || {})[m.id] || m.defaultValue;
      switch (m.type) {
        case MenuMetaType.TEXT:
        case MenuMetaType.NUMBER:
        case MenuMetaType.DATE:
          itemMeta[m.name] = defaultValue || '';
          break;
        case MenuMetaType.BOOLEAN:
          itemMeta[m.name] = defaultValue || false;
          break;
      }
    });
    const itemNode = {
      id: -1,
      label: t('menu.preview.newItem', {
        order: children?.length ? children.length + 1 : 1,
      }),
      order: children?.length ? children.length + 1 : 1,
      parentId: id,
      meta: itemMeta,
      enabled: true,
      children: [],
      startPublication: null,
      endPublication: null,
    };
    setEditingNode({ ...itemNode, action: EnumInputAction.CREATE, original: itemNode });
    setSelected('-1');
    setOperationScreen(EnumInputActionScreen.INSERT);
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

  const onNodeClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (id === 0) {
      setSelected('');
      return;
    }
    if (editingNode.id === -1 || id === -1) {
      setSelected('-1');
      return;
    }
    const itemMeta = { ...meta };
    data?.menu.meta?.forEach(m => {
      const defaultValue = (meta || {})[m.id] || m.defaultValue;
      switch (m.type) {
        case MenuMetaType.TEXT:
        case MenuMetaType.NUMBER:
        case MenuMetaType.DATE:
          itemMeta[m.name] = defaultValue || '';
          break;
        case MenuMetaType.BOOLEAN:
          itemMeta[m.name] = defaultValue || false;
          break;
      }
    });
    setEditingNode({
      ...node,
      meta: itemMeta,
      action: EnumInputAction.UPDATE,
      original: node,
    });
    setSelected(id.toString());
    setOperationScreen(EnumInputActionScreen.UPDATE);
  };

  return (
    <TreeItem
      nodeId={id.toString()}
      onClick={onNodeClick}
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
              <MenuItem onClick={handleInsert}>
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
          color,
          fontWeight,
          border: '1px solid #eaeaec',
          margin: '3px 0px',
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '12px 0px 13px 25px',
          my: '0.5rem',
        },
        '& > .Mui-selected': {
          border: '2px solid #3354FD',
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        '& > .Mui-selected.Mui-focused': {
          backgroundColor: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        maxWidth: '540px',
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
  data: any;
  setOperationScreen: (operationScreen: EnumInputActionScreen) => void;
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
  data,
  setOperationScreen,
}: Props) => {
  const { t } = useTranslation();

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
            editingNode={editingNode}
            setEditingNode={setEditingNode}
            handleUpdate={handleUpdate}
            data={data}
            setOperationScreen={setOperationScreen}
          />
        );
      }),
    [
      emptyEditingNode,
      editingNode,
      handleUpdate,
      setEditingNode,
      setSelected,
      data,
      setOperationScreen,
    ],
  );

  const handleInsertRoot = (event: React.SyntheticEvent) => {
    const meta = {};
    data?.menu.meta?.forEach(m => {
      switch (m.type) {
        case MenuMetaType.TEXT:
        case MenuMetaType.NUMBER:
        case MenuMetaType.DATE:
          meta[m.name] = m.defaultValue || '';
          break;
        case MenuMetaType.BOOLEAN:
          meta[m.name] = m.defaultValue || false;
          break;
      }
    });
    const node: INode = {
      id: -1,
      label: t('menu.preview.newItem', {
        order: nodes.length ? nodes.length + 1 : 1,
      }),
      order: nodes.length ? nodes.length + 1 : 1,
      parentId: 0,
      meta,
      enabled: true,
      children: [],
      startPublication: null,
      endPublication: null,
    };
    setEditingNode({ ...node, action: EnumInputAction.CREATE, original: node });
    setSelected('-1');
    setOperationScreen(EnumInputActionScreen.INSERT);
  };

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
      <Box
        className="flex items-center bg-white py-2 border-dashed border-[#B4B9C1] border my-2"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
          },
          maxWidth: '540px',
        }}
        onClick={handleInsertRoot}
      >
        <IconPlus fill="#265EFD" className="mx-4" />
        <Typography
          sx={{ flex: 1, position: 'relative', top: '-2px', color: '#265EFD', fontWeight: 'bold' }}
        >
          {t('menu.preview.actions.insertRoot')}
        </Typography>
      </Box>
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
