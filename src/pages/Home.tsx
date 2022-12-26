/* eslint-disable no-console */
import { TreeItem, TreeItemProps, TreeView } from '@mui/lab';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

enum EnumModified {
  INSERTING,
  UPDATING,
  DELETING,
}

interface INode extends Omit<TreeItemProps, 'nodeId' | 'children'> {
  id: string;
  order: number;
  parent?: string;
  children?: INode[];
  modified?: EnumModified;
}

enum EnumActionScreen {
  SELECTING_ACTION,
  INSERT,
  UPDATE,
  DELETE,
}

export default function Home() {
  const [expanded, setExpanded] = useState<string[]>(['0']);
  const [selected, setSelected] = useState<string>('0');

  const [operationScreen, setOperationScreen] = useState<EnumActionScreen>(
    EnumActionScreen.SELECTING_ACTION,
  );

  const [nodes, setNodes] = useState<INode[]>([]);

  const [editingNode, setEditingNode] = useState<INode>({
    id: '',
    label: '',
    order: 0,
  });

  useEffect(() => {
    setNodes([
      {
        id: '0',
        label: 'Raíz',
        order: 1,
        children: [
          {
            id: '1',
            label: 'Transferir',
            order: 1,
            children: [
              { id: '1.1', label: 'TED', order: 1, parent: '1' },
              { id: '1.2', label: 'DOC', order: 2, parent: '1' },
            ],
            parent: '0',
          },
          { id: '2', label: 'Saldo', order: 2, parent: '0' },
        ],
      },
    ]);
  }, []);

  const findNodeById = useCallback((nodes: INode[], id: string): INode | undefined => {
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

  const preview = useCallback((nodes: INode[], editingNode: INode): INode[] => {
    if (!editingNode.id) return nodes;
    if (nodes[0].id === '0' && nodes[0].children?.length === 0)
      return [{ ...nodes[0], children: [editingNode] }];
    console.log('nodes', nodes);
    console.log('editing node', editingNode);
    const nodesPreview: INode[] = [];
    nodes.forEach(node => {
      console.log('current node', node);
      if (node.id === editingNode.id) {
        // editing node is current node
        console.log('editing node is current node', node);
        if (editingNode.modified === EnumModified.UPDATING) {
          // editing node is updating
          console.log('editing node is updating');
          // set current node as updating
          nodesPreview.push({ ...node, modified: EnumModified.UPDATING });
        } else {
          // editing node is deleting
          console.log('editing node is deleting');
          // set current node as deleting
          nodesPreview.push({ ...node, modified: EnumModified.DELETING });
        }
      } else if (node.id === editingNode.parent) {
        // current node is parent of editing node
        console.log('editing node is parent of current node', node);
        if (!node.children || node.children.length === 0) {
          // parent has no children
          console.log('parent has no children');
          // add editing node to parent children
          nodesPreview.push({
            ...node,
            children: [editingNode],
            modified: EnumModified.UPDATING,
          });
        } else {
          const children = node.children.map(child => {
            if (child.id === editingNode.id) {
              // child is editing node
              console.log('child is editing node', child);
              if (editingNode.modified === EnumModified.DELETING) {
                // editing node is deleting
                console.log('editing node is deleting');
                // set child as deleting
                return { ...child, modified: EnumModified.DELETING };
              }
              // editing node is updating
              console.log('editing node is updating');
              // set child as updating
              return { ...child, modified: EnumModified.UPDATING };
            }
            if (child.order >= editingNode.order) {
              // child is after editing node
              console.log('child is after editing node', child);
              // set child order + 1 and set as updating
              return { ...child, order: child.order + 1, modified: EnumModified.UPDATING };
            }
            // child is before editing node
            console.log('child is before editing node', child);
            return child;
          });
          if (editingNode.modified === EnumModified.INSERTING) {
            // editing node is inserting
            console.log('editing node is inserting');
            // add editing node to parent children
            children.splice(editingNode.order - 1, 0, editingNode);
          }
          // set parent as updating
          nodesPreview.push({ ...node, children, modified: EnumModified.UPDATING });
        }
      } else {
        // current node is not parent of editing node
        console.log('current node is not parent of editing node', node);
        if (node.children?.length > 0) {
          // current node has children
          console.log('current node has children', node);
          // add current node to preview
          const children = preview(node.children, editingNode);
          if (JSON.stringify(children) !== JSON.stringify(node.children)) {
            nodesPreview.push({ ...node, children, modified: EnumModified.UPDATING });
          } else {
            // children has no changes
            console.log('children has no changes');
            // add current node to preview
            nodesPreview.push(node);
          }
        } else {
          // current node has no children
          console.log('current node has no children');
          // add current node to preview
          nodesPreview.push(node);
        }
      }
    });
    console.log('nodes preview', nodesPreview);
    return nodesPreview;
  }, []);

  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelected(nodeId);
  };

  const handleActionChange = useCallback(
    (action: EnumActionScreen) => {
      const selectedNode = findNodeById(nodes, selected);

      switch (action) {
        case EnumActionScreen.SELECTING_ACTION:
          setEditingNode({
            id: '',
            label: '',
            order: 0,
          });
          break;
        case EnumActionScreen.INSERT:
          setEditingNode({
            id: '-1',
            label: `Novo Item ${
              selectedNode.children?.length ? selectedNode.children.length + 1 : nodes.length + 1
            }`,
            order: selectedNode.children?.length ? selectedNode.children.length + 1 : 1,
            modified: EnumModified.INSERTING,
            parent: selectedNode.id,
          });
          setSelected('-1');
          break;
        case EnumActionScreen.UPDATE:
          if (!selectedNode) {
            setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            modified: EnumModified.UPDATING,
          });
          setSelected(selectedNode.id);
          break;
        case EnumActionScreen.DELETE:
          if (!selectedNode) {
            setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            modified: EnumModified.DELETING,
          });
          break;
      }
      setOperationScreen(action);
    },
    [findNodeById, nodes, selected],
  );

  const renderNodes = useCallback(
    (nodes: INode[]) =>
      nodes.map(node => {
        let color = 'black';
        const fontWeight = node.id === editingNode.id ? 'bold' : 'normal';
        switch (node.modified) {
          case EnumModified.INSERTING:
            color = 'green';
            break;
          case EnumModified.UPDATING:
            color = 'orange';
            break;
          case EnumModified.DELETING:
            color = 'red';
            break;
        }
        if (node.children?.length > 0) {
          return (
            <TreeItem
              key={node.id}
              nodeId={node.id}
              label={node.label}
              sx={{
                '& > .MuiTreeItem-content  > .MuiTreeItem-label': {
                  color,
                  fontWeight,
                },
              }}
            >
              {renderNodes(node.children)}
            </TreeItem>
          );
        }
        return (
          <TreeItem
            key={node.id}
            nodeId={node.id}
            label={node.label}
            sx={{
              '& .MuiTreeItem-content .MuiTreeItem-label': {
                color,
              },
            }}
          />
        );
      }),
    [editingNode.id],
  );

  const renderOperationScreen = () => {
    switch (operationScreen) {
      case EnumActionScreen.SELECTING_ACTION:
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                mb: '1rem',
              }}
            >
              Ações
            </Typography>
            <Box
              sx={{
                my: '2rem',
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Button
                sx={{ color: 'green' }}
                variant="outlined"
                color="success"
                onClick={() => handleActionChange(EnumActionScreen.INSERT)}
              >
                <AddIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: 'green',
                    ml: '0.5rem',
                  }}
                >
                  Inserir
                </Typography>
              </Button>
              <Button
                sx={{ color: 'orange' }}
                variant="outlined"
                color="warning"
                disabled={!selected}
                onClick={() => handleActionChange(EnumActionScreen.UPDATE)}
              >
                <EditIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: selected ? 'orange' : 'grey',
                    ml: '0.5rem',
                  }}
                >
                  Editar
                </Typography>
              </Button>
              <Button
                sx={{ color: 'red' }}
                variant="outlined"
                color="error"
                disabled={!selected}
                onClick={() => handleActionChange(EnumActionScreen.DELETE)}
              >
                <DeleteIcon />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    lineHeight: '0.75rem',
                    letterSpacing: '0.18px',
                    color: selected ? 'red' : 'grey',
                    ml: '0.5rem',
                  }}
                >
                  Deletar
                </Typography>
              </Button>
            </Box>
          </Box>
        );
      case EnumActionScreen.INSERT:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              Inserir
            </Typography>
            <Box
              sx={{
                mt: '2rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextField
                type="text"
                label="Parente"
                value={findNodeById(nodes, editingNode.parent).label}
                sx={{
                  width: '100%',
                }}
                contentEditable={false}
              />
              <Button
                variant="outlined"
                color="primary"
                sx={{ ml: '0.5rem' }}
                disabled={nodes.length === 0}
                onClick={() => {
                  const parent = findNodeById(nodes, selected);
                  const order = parent.children ? parent.children.length + 1 : 1;
                  setEditingNode({
                    ...editingNode,
                    parent: selected,
                    order,
                    label: `Novo Item ${order}`,
                  });
                }}
              >
                Selecionar Parente
              </Button>
            </Box>
            <TextField
              type="text"
              label="Nome"
              InputLabelProps={{ shrink: true }}
              value={editingNode.label}
              onChange={e => setEditingNode({ ...editingNode, label: e.target.value })}
              placeholder="Digite o nome do item de menu..."
              sx={{
                mt: '2rem',
                width: '100%',
              }}
            />
            <TextField
              type="number"
              label="Ordem"
              InputLabelProps={{ shrink: true }}
              value={editingNode.order}
              onChange={e => {
                const parent = findNodeById(nodes, editingNode.parent);
                console.log('parent', parent);
                const order = Math.min(
                  Math.max(Number(e.target.value), 1),
                  parent.children?.length ? parent.children.length + 1 : 1,
                );
                console.log('order', order);
                if (order === editingNode.order) return;
                setEditingNode({
                  ...editingNode,
                  order,
                });
              }}
              placeholder="Digite a ordem do item de menu..."
              sx={{
                mt: '2rem',
                width: '6rem',
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <Button variant="contained" color="success" sx={{ mt: '2rem', mr: '1rem' }}>
                Salvar
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mt: '2rem' }}
                onClick={() => handleActionChange(EnumActionScreen.SELECTING_ACTION)}
              >
                Descartar
              </Button>
            </Box>
          </Box>
        );
      case EnumActionScreen.UPDATE:
      case EnumActionScreen.DELETE:
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '80vh',
        paddingTop: '1rem',
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
          mt: '1rem',
        }}
      >
        Menu
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
              Raíz
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: '100%', border: '1px solid black', p: '1rem' }}>
            <TreeView
              defaultExpandIcon={<ExpandMoreIcon />}
              defaultCollapseIcon={<ExpandLessIcon />}
              defaultExpanded={['0']}
              expanded={expanded}
              selected={selected}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
            >
              {renderNodes(preview(nodes, editingNode))}
            </TreeView>
          </Box>
        </Box>

        <div
          style={{ width: '1px', height: '100%', border: '1px solid black', margin: '0 50px' }}
        />
        {renderOperationScreen()}
      </Box>
    </Box>
  );
}
