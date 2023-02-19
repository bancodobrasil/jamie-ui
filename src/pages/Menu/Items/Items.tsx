import { Box, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
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
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs';
import DefaultErrorPage from '../../../components/DefaultErrorPage';
import { NodeTreeView, OperationScreen } from '../../../components/Menu/Items';

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

export const ItemsPreview = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, data } = useQuery(MenuService.GET_MENU, {
    variables: { id: Number(id) },
  });

  const [updatedMenu, setUpdatedMenu] = useState<IMenu>();

  const [expanded, setExpanded] = useState<string[]>(['0']);
  const [selected, setSelected] = useState<string>('0');

  const nodes = useMemo<INode[]>(() => {
    const items: GraphQLData<IMenuItem>[] = updatedMenu?.items || data?.menu.items || [];
    const getChildren = (parent: IMenuItem): INode[] => {
      const children = items
        .filter(item => item.parentId === parent.id)
        .map(item => {
          const { __typename, ...rest } = item;
          return {
            ...rest,
            children: getChildren(item),
          };
        })
        .sort((a, b) => a.order - b.order);
      return children;
    };
    const root: INode[] =
      items
        .map(item => {
          const { __typename, ...rest } = item;
          return {
            ...rest,
            parentId: item.parentId || 0,
            children: getChildren(item),
          };
        })
        .filter(item => !item.parentId)
        .sort((a, b) => a.order - b.order) || [];
    return [
      {
        id: 0,
        label: t('menu.preview.root'),
        order: 1,
        enabled: true,
        children: root,
        meta: {},
      },
    ];
  }, [updatedMenu, data?.menu, t]);

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

  const preview = useCallback((nodes: INode[], editingNode: IEditingNode): INode[] => {
    if (!editingNode.id) return nodes;
    if (nodes[0].id === 0 && nodes[0].children?.length === 0)
      return [{ ...nodes[0], children: [editingNode] }];
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
          let children = node.children.map(child => {
            if (child.id === editingNode.id) {
              // child is editing node
              // console.log('child is editing node', child);
              if (child.order === editingNode.order) {
                // child is in same position
                // console.log('child is in same position');
                if (editingNode.action === EnumInputAction.DELETE) {
                  // editing node is DELETE
                  // console.log('editing node is DELETE');
                  // set child as DELETE
                  return {
                    ...child,
                    action: EnumInputAction.DELETE,
                    children: deleteChildren(child),
                  };
                }
                // editing node is UPDATE
                // console.log('editing node is UPDATE');
                // set child as UPDATE
                return {
                  ...child,
                  ...editingNode,
                  action: EnumInputAction.UPDATE,
                };
              }
              // child is in different position
              // console.log('child is in different position');
              // set child as UPDATE and set order as editing node order
              return {
                ...child,
                ...editingNode,
                action: EnumInputAction.UPDATE,
              };
            }
            // child is not editing node
            if (child.order === editingNode.order) {
              // child is in same position as editing node
              // console.log('child is in same position as editing node', child);
              // set order based on existing node order diff (moving up or down)
              const diff = editingNode.order - editingNode.original.order;
              let order = diff >= 0 ? child.order - 1 : child.order + 1;
              if (editingNode.action === EnumInputAction.DELETE) {
                // editing node is DELETE
                // console.log('editing node is DELETE');
                // decrease order
                order = child.order - 1;
              }
              // set child as UPDATE and decrease order
              return { ...child, action: EnumInputAction.UPDATE, order };
            }
            if (child.order > editingNode.order) {
              // child is after editing node
              // console.log('child is after editing node', child);
              // set child as UPDATE
              let action = EnumInputAction.UPDATE;
              let { order } = child;
              if (editingNode.action === EnumInputAction.UPDATE) {
                if (child.order < editingNode.original.order) {
                  // child order is less than editing node original order
                  // increase child order
                  order += 1;
                } else {
                  // child order is greater than editing node original order
                  // keep child order as is and set action as undefined
                  action = undefined;
                }
              } else if (editingNode.action === EnumInputAction.DELETE) {
                order -= 1;
              } else if (editingNode.action === EnumInputAction.CREATE) {
                order += 1;
              }
              return { ...child, order, action };
            }
            // child is before editing node
            // console.log('child is before editing node', child);
            if (
              editingNode.action === EnumInputAction.UPDATE &&
              child.order > editingNode.original.order
            ) {
              // child order is greater than editing node original order
              // decrease child order
              return { ...child, action: EnumInputAction.UPDATE, order: child.order - 1 };
            }
            return child;
          });
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

  const onBackClickHandler = () => {
    navigate('../');
  };

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
    <Box>
      <AppBreadcrumbs
        items={[
          { label: t('menu.title', { count: 2 }), navigateTo: '/' },
          { label: data?.menu.name, navigateTo: '../' },
          { label: t('menu.preview.title') },
        ]}
        onBack={onBackClickHandler}
      />
      <Box
        sx={{
          width: '100%',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
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
        </Typography>
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
            <Box
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
            </Box>
            <NodeTreeView
              nodes={nodes}
              editingNode={editingNode}
              expanded={expanded}
              setExpanded={setExpanded}
              selected={selected}
              setSelected={setSelected}
              preview={preview}
            />
          </Box>

          <div
            style={{ width: '1px', height: '100%', border: '1px solid black', margin: '0 50px' }}
          />

          <OperationScreen
            id={id}
            data={data}
            nodes={nodes}
            emptyEditingNode={emptyEditingNode}
            editingNode={editingNode}
            setEditingNode={setEditingNode}
            expanded={expanded}
            setExpanded={setExpanded}
            selected={selected}
            setSelected={setSelected}
            findNodeById={findNodeById}
            preview={preview}
            setUpdatedMenu={setUpdatedMenu}
          />
        </Box>
      </Box>
    </Box>
  );
};
