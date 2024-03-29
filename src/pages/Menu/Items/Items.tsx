import { Box } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { DateTime } from 'luxon';
import Loading from '../../../components/Loading';
import MenuService from '../../../api/services/MenuService';
import {
  EnumInputAction,
  GraphQLData,
  IEditingNode,
  IMenu,
  IMenuItem,
  INode,
} from '../../../types';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import { NodeTreeView, OperationScreen } from '../../../components/Menu/Items';
import {
  ActionTypes,
  NotificationContext,
  openDefaultErrorNotification,
} from '../../../contexts/NotificationContext';

const emptyEditingNode: IEditingNode = {
  id: 0,
  label: '',
  order: 0,
  enabled: true,
  action: EnumInputAction.CREATE,
  parentId: 0,
  children: [],
  meta: {},
  original: {
    id: 0,
    label: '',
    order: 0,
    enabled: true,
    action: EnumInputAction.CREATE,
    parentId: 0,
    children: [],
    meta: {},
  },
};

export enum EnumInputActionScreen {
  NONE,
  INSERT,
  UPDATE,
}

export const ItemsPreview = () => {
  const { dispatch } = React.useContext(NotificationContext);

  const { t } = useTranslation();

  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });
  const [updateMenu] = useMutation(MenuService.UPDATE_MENU);

  const [updatedMenu, setUpdatedMenu] = useState<IMenu>();

  const [expanded, setExpanded] = useState<string[]>(['0']);
  const [selected, setSelected] = useState<string>('0');

  const [operationScreen, setOperationScreen] = React.useState<EnumInputActionScreen>(
    EnumInputActionScreen.NONE,
  );

  const nodes = useMemo<INode[]>(() => {
    const items: GraphQLData<IMenuItem>[] = updatedMenu?.items || data?.menu.items || [];
    const getChildren = (parent: IMenuItem): INode[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map(item => {
          const { __typename, ...rest } = item;
          const startPublication = rest.startPublication
            ? DateTime.fromISO(rest.startPublication)
            : null;
          const endPublication = rest.endPublication ? DateTime.fromISO(rest.endPublication) : null;
          const children = getChildren(item);
          const node = {
            ...rest,
            startPublication,
            endPublication,
            children,
          };
          return {
            ...node,
            original: node,
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    const root: INode[] =
      items
        .map(item => {
          const { __typename, ...rest } = item;
          const startPublication = rest.startPublication
            ? DateTime.fromISO(rest.startPublication)
            : null;
          const endPublication = rest.endPublication ? DateTime.fromISO(rest.endPublication) : null;
          const parentId = item.parentId || 0;
          const children = getChildren(item);
          const node = {
            ...rest,
            startPublication,
            endPublication,
            parentId,
            children,
          };
          return {
            ...node,
            original: node,
          };
        })
        .filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    return root;
  }, [updatedMenu, data?.menu]);

  const [editingNode, setEditingNode] = useState<IEditingNode>(emptyEditingNode);

  const findNodeById = useCallback((nodes: INode[], id: number): INode | undefined => {
    const node = nodes.find(node => node.id === id);
    if (node) return node;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children?.length > 0) {
        const node = findNodeById(nodes[i].children, id);
        if (node) return node;
      }
    }
    return undefined;
  }, []);

  const handleUpdate = async (): Promise<void> => {
    const formatNodes = (nodes: INode[]) =>
      nodes
        .map(node => {
          const {
            id,
            children,
            original,
            parentId,
            createdAt,
            updatedAt,
            version,
            menuId,
            defaultTemplate,
            action,
            rules,
            ...rest
          } = node;
          let meta;
          if (rest.meta) {
            meta = Object.keys(rest.meta).reduce((acc, key) => {
              const name = data.menu.meta.find(meta => meta.id === Number(key))?.name || key;
              const meta = rest.meta[key];
              const originalMetaMap = original?.meta || {};
              const originalMeta = originalMetaMap[key] || originalMetaMap[name];
              if (meta == null || meta === '' || meta === originalMeta) {
                return acc;
              }
              return {
                ...acc,
                [name]: meta,
              };
            }, {});
            if (Object.keys(meta).length === 0) meta = undefined;
          }
          let startPublication;
          if (rest.startPublication) {
            if (
              (original?.startPublication !== rest.startPublication ||
                !original?.startPublication) &&
              rest.startPublication.isValid
            )
              startPublication = rest.startPublication.toISO();
          } else {
            startPublication = null;
          }
          let endPublication;
          if (rest.endPublication) {
            if (
              (original?.endPublication !== rest.endPublication || !original?.endPublication) &&
              rest.endPublication.isValid
            )
              endPublication = rest.endPublication.toISO();
          } else {
            endPublication = null;
          }
          let label;
          if (action === EnumInputAction.CREATE) label = rest.label;
          else if (rest.label && (original?.label !== rest.label || !original?.label))
            label = rest.label;
          let order;
          if (action === EnumInputAction.CREATE) order = rest.order;
          else if (rest.order && (original?.order !== rest.order || !original?.order))
            order = rest.order;
          let enabled = action === EnumInputAction.CREATE ? true : undefined;
          if (rest.enabled && (original?.enabled !== rest.enabled || !original?.enabled))
            enabled = rest.enabled;
          return {
            action,
            label,
            order,
            enabled,
            startPublication,
            endPublication,
            meta,
            rules,
            children: children && formatNodes(children),
            id: id === -1 ? undefined : id,
          };
        })
        .filter(node => !!node.action);

    const items = formatNodes(preview(nodes, editingNode)).map(node => {
      const id = node.id === -1 ? undefined : node.id;
      return {
        ...node,
        id,
      };
    });

    await updateMenu({
      variables: { menu: { id: Number(id), items } },
      onCompleted: data => {
        dispatch({
          type: ActionTypes.OPEN_NOTIFICATION,
          message: `${t('notification.editSuccess', {
            resource: t('menu.title', { count: 1 }),
            context: 'male',
          })}!`,
        });
        switch (editingNode.action) {
          case EnumInputAction.CREATE:
          case EnumInputAction.DELETE:
            setEditingNode(emptyEditingNode);
            setSelected('');
            break;
          case EnumInputAction.UPDATE:
            setSelected(editingNode.id.toString());
            break;
        }
        setUpdatedMenu(data.updateMenu);
        setOperationScreen(EnumInputActionScreen.NONE);
        setEditingNode(emptyEditingNode);
        return Promise.resolve();
      },
      onError: error => {
        openDefaultErrorNotification(error, dispatch);
        return Promise.reject();
      },
    });
    return Promise.resolve();
  };

  const preview = useCallback((nodes: INode[], editingNode: IEditingNode): INode[] => {
    if (!editingNode.id) return nodes;
    if (nodes.length === 0) return [editingNode];
    // console.log('nodes', nodes);
    // console.log('editing node', editingNode);
    const nodesPreview: INode[] = [];
    const deleteChildren = (node: INode): INode[] | undefined => {
      if (!node.children) return undefined;
      return node.children.map(child => {
        const children = deleteChildren(child);
        if (children) return { ...child, children, action: EnumInputAction.DELETE };
        return { ...child, action: EnumInputAction.DELETE };
      });
    };
    const reorder = (nodes: INode[]): INode[] => {
      const siblings = nodes.map(sibling => {
        if (sibling.id === editingNode.id) {
          // sibling is editing node
          // console.log('child is editing node', child);
          if (sibling.order === editingNode.order) {
            // sibling is in same position
            // console.log('sibling is in same position');
            if (editingNode.action === EnumInputAction.DELETE) {
              // editing node is DELETE
              // console.log('editing node is DELETE');
              // set sibling as DELETE
              return {
                ...sibling,
                action: EnumInputAction.DELETE,
                children: deleteChildren(sibling),
              };
            }
            // editing node is UPDATE
            // console.log('editing node is UPDATE');
            // set sibling as UPDATE
            return {
              ...sibling,
              ...editingNode,
              action: EnumInputAction.UPDATE,
            };
          }
          // sibling is in different position
          // console.log('sibling is in different position');
          // set sibling as UPDATE and set order as editing node order
          return {
            ...sibling,
            ...editingNode,
            action: EnumInputAction.UPDATE,
          };
        }
        // sibling is not editing node
        if (sibling.order === editingNode.order) {
          // sibling is in same position as editing node
          // console.log('sibling is in same position as editing node', sibling);
          // set order based on existing node order diff (moving up or down)
          const diff = editingNode.order - editingNode.original.order;
          let order = diff >= 0 ? sibling.order - 1 : sibling.order + 1;
          if (editingNode.action === EnumInputAction.DELETE) {
            // editing node is DELETE
            // console.log('editing node is DELETE');
            // decrease order
            order = sibling.order - 1;
          }
          // set sibling as UPDATE and decrease order
          return { ...sibling, action: EnumInputAction.UPDATE, order };
        }
        if (sibling.order > editingNode.order) {
          // sibling is after editing node
          // console.log('sibling is after editing node', sibling);
          // set sibling as UPDATE
          let action = EnumInputAction.UPDATE;
          let { order } = sibling;
          if (editingNode.action === EnumInputAction.UPDATE) {
            if (sibling.order < editingNode.original.order) {
              // sibling order is less than editing node original order
              // increase sibling order
              order += 1;
            } else {
              // sibling order is greater than editing node original order
              // keep sibling order as is and set action as undefined
              action = undefined;
            }
          } else if (editingNode.action === EnumInputAction.DELETE) {
            order -= 1;
          } else if (editingNode.action === EnumInputAction.CREATE) {
            order += 1;
          }
          return { ...sibling, order, action };
        }
        // sibling is before editing node
        // console.log('sibling is before editing node', sibling);
        if (
          editingNode.action === EnumInputAction.UPDATE &&
          sibling.order > editingNode.original.order
        ) {
          // sibling order is greater than editing node original order
          // decrease sibling order
          return { ...sibling, action: EnumInputAction.UPDATE, order: sibling.order - 1 };
        }
        return sibling;
      });
      return siblings;
    };
    if (editingNode.parentId === 0) {
      // editing node is root
      // console.log('editing node is root');
      // reordering root
      let root = reorder(nodes);
      if (editingNode.action === EnumInputAction.CREATE) {
        // editing node is CREATE
        // console.log('editing node is CREATE');
        // add editing node to root
        root.splice(editingNode.order - 1, 0, editingNode);
      }
      root = root.sort((a, b) => a.order - b.order);
      return root;
    }
    nodes.forEach(node => {
      // console.log('current node', node);
      if (node.id === editingNode.id) {
        // editing node is current node
        // console.log('editing node is current node', node);
        if (editingNode.action === EnumInputAction.UPDATE) {
          // editing node is UPDATE
          // console.log('editing node is UPDATE');
          // set current node as UPDATE
          nodesPreview.push({
            ...node,
            ...editingNode,
            action: EnumInputAction.UPDATE,
          });
        } else {
          // editing node is DELETE
          // console.log('editing node is DELETE');
          // set current node as DELETE
          nodesPreview.push({
            ...node,
            action: EnumInputAction.DELETE,
            children: deleteChildren(node),
          });
        }
      } else if (node.id === editingNode.parentId) {
        // current node is parent of editing node
        // console.log('editing node is parent of current node', node);
        if (!node.children || node.children.length === 0) {
          // parent has no children
          // console.log('parent has no children');
          // add editing node to parent children
          nodesPreview.push({
            ...node,
            children: [editingNode],
            action: EnumInputAction.UPDATE,
          });
        } else {
          // parent has children
          // console.log('parent has children');
          // reordering children
          let children = reorder(node.children);
          if (editingNode.action === EnumInputAction.CREATE) {
            // editing node is CREATE
            // console.log('editing node is CREATE');
            // add editing node to parent children
            children.splice(editingNode.order - 1, 0, editingNode);
          }
          children = children.sort((a, b) => a.order - b.order);
          // set parent as UPDATE
          nodesPreview.push({ ...node, children, action: EnumInputAction.UPDATE });
        }
      } else {
        // current node is not parent of editing node
        // console.log('current node is not parent of editing node', node);
        // eslint-disable-next-line no-lonely-if
        if (node.children?.length > 0) {
          // current node has children
          // console.log('current node has children', node);
          // add current node to preview
          const children = preview(node.children, editingNode);
          if (JSON.stringify(children) !== JSON.stringify(node.children)) {
            nodesPreview.push({ ...node, children, action: EnumInputAction.UPDATE });
          } else {
            // children has no changes
            // console.log('children has no changes');
            // add current node to preview
            nodesPreview.push(node);
          }
        } else {
          // current node has no children
          // console.log('current node has no children');
          // add current node to preview
          nodesPreview.push(node);
        }
      }
    });
    // console.log('nodes preview', nodesPreview);
    return nodesPreview;
  }, []);

  if (loading) return <Loading />;

  if (error)
    return (
      <DefaultErrorPage
        title={t('error.failedToLoadResource.title', {
          resource: t('common.the', {
            context: 'male',
            count: 1,
            field: t('menu.title', { count: 1 }),
          }).toLowerCase(),
        })}
        description={t('error.failedToLoadResource.description')}
        button={{
          label: t('error.failedToLoadResource.button'),
          onClick: () => document.location.reload(),
        }}
      />
    );

  return (
    <Box sx={{ height: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* <Typography
          variant="h1"
          sx={{
            fontWeight: 700,
            fontSize: '3rem',
            lineHeight: '3rem',
            letterSpacing: '0.18px',
            mb: '2rem',
          }}
        >
          {data?.menu.name}
        </Typography> */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            {/* <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: '2rem',
                width: '100%',
              }}
            >
              <WidgetsIcon />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: '2rem',
                  lineHeight: '2rem',
                  letterSpacing: '0.18px',
                  ml: '0.5rem',
                  pb: '5px',
                }}
              >
                {t('menu.preview.root')}
              </Typography>
            </Box> */}
            <NodeTreeView
              nodes={nodes}
              editingNode={editingNode}
              expanded={expanded}
              setExpanded={setExpanded}
              selected={selected}
              setSelected={setSelected}
              preview={preview}
              emptyEditingNode={emptyEditingNode}
              setEditingNode={setEditingNode}
              handleUpdate={handleUpdate}
              data={data}
              setOperationScreen={setOperationScreen}
            />
          </Box>
          {operationScreen !== EnumInputActionScreen.NONE ? (
            <>
              <div
                style={{
                  width: '1px',
                  height: '100%',
                  border: '1px solid #eaeaec',
                  margin: '0 50px 0 0',
                }}
              />

              <OperationScreen
                id={id}
                data={data}
                nodes={nodes}
                emptyEditingNode={emptyEditingNode}
                editingNode={editingNode}
                setEditingNode={setEditingNode}
                findNodeById={findNodeById}
                operationScreen={operationScreen}
                setOperationScreen={setOperationScreen}
                handleUpdate={handleUpdate}
              />
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
