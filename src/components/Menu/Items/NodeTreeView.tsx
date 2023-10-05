import React, { useState } from 'react';
import {
  Box,
  Button,
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
  insertingNodeRef?: (node: HTMLElement) => void;
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
  insertingNodeRef,
}: CustomTreeItemProps) => {
  const { id, label, children, meta } = node;

  const { id: menuId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [contextMenuRef, setContextMenuRef] = React.useState<null | HTMLElement>(null);

  const [confirmedDelete, setConfirmedDelete] = React.useState(false);

  const handleClickContextMenu = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuRef(event.currentTarget as HTMLElement);
  };
  const handleCloseContextMenu = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuRef(null);
  };

  // Insert child item
  const handleInsert = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuRef(null);
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

  // Insert item in the same level (insert a sibling above)
  const handleInsertAbove = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuRef(null);
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
        order: node.order ? node.order + 1 : 1,
      }),
      order: node.order ? node.order + 1 : 1,
      parentId: node.parentId,
      meta: itemMeta,
      enabled: true,
      children: [],
      startPublication: null,
      endPublication: null,
    };
    setEditingNode({ ...itemNode, action: EnumInputAction.CREATE, original: itemNode });
    // setEditingNode({
    //   ...reorderNode,
    //   meta: reorderNode,
    //   action: EnumInputAction.UPDATE,
    //   original: node,
    // });
    setSelected('-1');
    setOperationScreen(EnumInputActionScreen.INSERT);

    // reorderChildren(node.parentId, itemNode);
  };

  // Insert item in the same level (insert a sibling above)
  const handleInsertBelow = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuRef(null);
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
        order: node.order ? node.order : 1,
      }),
      order: node.order ? node.order : 1,
      parentId: node.parentId,
      meta: itemMeta,
      enabled: true,
      children: [],
      startPublication: null,
      endPublication: null,
    };
    setEditingNode({ ...itemNode, action: EnumInputAction.CREATE, original: itemNode });
    // setEditingNode({
    //   ...reorderNode,
    //   meta: reorderNode,
    //   action: EnumInputAction.UPDATE,
    //   original: node,
    // });
    setSelected('-1');
    setOperationScreen(EnumInputActionScreen.INSERT);
  };

  function reorderChildren(parentNode, newChild) {
    // Get the list of existing children.
    const children = parentNode.childNodes;

    // Find the index of the new child.
    const newChildIndex = children.indexOf(newChild);

    for (let i = newChildIndex; i < children.length; i++) {
      children[i].order++;
    }

    // Insert the new child at the end of the list.
    parentNode.appendChild(newChild);

    // Reorder the remaining children.
    for (let i = newChildIndex - 1; i < children.length; i++) {
      parentNode.insertBefore(children[i], children[i - 1]);
    }

    setOperationScreen(EnumInputActionScreen.UPDATE);
  }

  const handleDelete = async (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setEditingNode({
      ...node,
      action: EnumInputAction.DELETE,
      original: node,
    });
    setContextMenuRef(null);
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
    setContextMenuRef(null);
  };

  const onNodeClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (editingNode.id === -1) {
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
    <Box
      sx={
        {
          // borderBottom: '3px solid green',
          // marginBottom: '10px',
          // borderLeft: '3px solid orange',
          // marginLeft: '10px',
        }
      }
    >
      <Box>
        <TreeItem
          ref={id === -1 ? insertingNodeRef : null}
          nodeId={id.toString()}
          onClick={onNodeClick}
          label={
            <Box className="flex items-center">
              {/* Top Button */}
              <Box sx={{ position: 'column', py: '1rem' }}>
                {node.id === editingNode.id && (
                  <Box
                    sx={{
                      flex: 1,
                      marginLeft: '-3rem',
                      marginTop: '-2rem',
                      // maxWidth: '34rem',
                      marginRight: '-8rem',
                    }}
                  >
                    <Box
                      className="flex items-center bg-white py-2 border-dashed border-[#B4B9C1] border"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer',
                        },
                        width: '33.5rem',
                        margin: '0 auto',
                        marginTop: '-5rem',
                      }}
                      onClick={handleInsertAbove}
                    >
                      <IconPlus fill="#265EFD" className="mx-4" />
                      <Typography
                        sx={{
                          flex: 1,
                          position: 'relative',
                          top: '-2px',
                          color: '#265EFD',
                          fontWeight: 'bold',
                        }}
                      >
                        {t('menu.preview.actions.insertRootAbove')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              {/* Bottom Button */}
              <Box sx={{ py: '1rem' }}>
                {node.id === editingNode.id && (
                  <Box
                    sx={{
                      marginTop: '3rem',
                      flex: 1,
                      marginBottom: '-10rem',
                      marginLeft: '-25.6rem',
                      // maxWidth: '34rem',
                      marginRight: '-8rem',
                    }}
                  >
                    <Box
                      className="flex items-center bg-white py-2 border-dashed border-[#B4B9C1] border"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer',
                        },
                        width: '33.5rem',
                        marginTop: '3rem',
                        margin: '0 auto',
                      }}
                      onClick={handleInsertBelow}
                    >
                      <IconPlus fill="#265EFD" className="mx-4" />
                      <Typography
                        sx={{
                          flex: 1,
                          position: 'relative',
                          top: '-2px',
                          color: '#265EFD',
                          fontWeight: 'bold',
                        }}
                      >
                        {t('menu.preview.actions.insertRootBelow')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box>
                {node.id === editingNode.id && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      className="flex-1"
                      sx={{ color, fontWeight, margin: 0, marginLeft: '-23rem' }}
                    >
                      {label}
                    </Box>
                    <IconButton
                      sx={{ float: 'right', mr: 1, position: 'sticky', marginRight: '-8rem' }}
                      size="small"
                      onClick={handleClickContextMenu}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {node.id !== editingNode.id && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box className="flex-1" sx={{ color, fontWeight, margin: 0 }}>
                      {label}
                    </Box>
                    <IconButton
                      sx={{ float: 'right', mr: 1, position: 'sticky', marginRight: '-29rem' }}
                      size="small"
                      onClick={handleClickContextMenu}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
              {/* Bottom Button to add New Subitem */}
              {/* <Box sx={{ py: '1rem' }}>
                {node.id === editingNode.id && (
                  <Box
                    sx={{
                      marginTop: '6rem',
                      flex: 1,
                      marginBottom: '-25rem',
                      marginLeft: '-25.6rem',
                      // maxWidth: '34rem',
                      marginRight: '-8rem',
                    }}
                  >
                    <Box
                      className="flex items-center bg-white py-2 border-dashed border-[#B4B9C1] border"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          cursor: 'pointer',
                        },
                        width: '33.5rem',
                        marginTop: '3rem',
                        margin: '0 auto',
                      }}
                      onClick={handleInsert} // add a child item
                    >
                      <IconPlus fill="#265EFD" className="mx-4" />
                      <Typography
                        sx={{
                          flex: 1,
                          position: 'relative',
                          top: '-2px',
                          color: '#265EFD',
                          fontWeight: 'bold',
                        }}
                      >
                        teste
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box> */}
              {/* <Box className="flex-1" sx={{ color, fontWeight, margin: 0 }}>
                {label}
              </Box>
              <IconButton
                sx={{ float: 'right', mr: 1, position: 'sticky' }}
                size="small"
                onClick={handleClickContextMenu}
              >
                <MoreVertIcon />
              </IconButton> */}
              {/* More vert icon menu with options (add item, edit template, delete) */}
              <Menu
                id="simple-menu"
                anchorEl={contextMenuRef}
                open={Boolean(contextMenuRef)}
                onClose={handleCloseContextMenu}
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
          /* card border style */
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
              zIndex: '100',
              // borderBottom: '3px solid green',
              // marginBottom: '10px',
              // borderLeft: '3px solid orange',
              // marginLeft: '10px',
            },
            '& > .Mui-selected': {
              border: '2px solid #3354FD',
              my: '4rem',
              backgroundColor: '#fff',
              maxWidth: '540px',
              position: 'relative',
              zIndex: '1000',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& > .MuiCollapse-wrapperInner': {
                color,
                fontWeight,
                marginLeft: '3.5rem',
                zIndex: '10000',
              },
            },
            '& > .Mui-expanded': {
              // '&::before': {
              //   content: '" "',
              //   marginTop: '12rem',
              //   position: 'absolute',
              //   width: '1px',
              //   height: '12rem',
              //   border: '1px solid transparent',
              //   borderColor: 'red',
              //   zIndex: '0',
              // },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& > .MuiCollapse-wrapperInner': {
                color,
                fontWeight,
                backgroundColor: 'pink',
                // margin: '3px 0px',
                // padding: '12px 0px 13px 25px', // cima/esq/baixo/direita
                marginLeft: '3.5rem',
                zIndex: '10000',
                // borderBottom: '3px solid green',
                // marginBottom: '10px',
                // borderLeft: '3px solid orange',
                // marginLeft: '10px',
              },
            },
            '& > .Mui-selected.Mui-focused': {
              backgroundColor: '#fff',
              zIndex: '100',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& > .MuiCollapse-wrapperInner': {
                color,
                fontWeight,
                marginLeft: '3.5rem',
                zIndex: '10000',
                backgroundColor: 'blue',
              },
            },
            width: '540px',
          }}
        >
          {children?.length > 0 && renderNodes(children)}
        </TreeItem>
      </Box>
    </Box>
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

  const insertingNodeRef = React.useCallback(node => {
    if (node) {
      node.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

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
            insertingNodeRef={insertingNodeRef}
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
      insertingNodeRef,
    ],
  );

  // Insert item in root menu
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
