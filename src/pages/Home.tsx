import { TreeItem, TreeItemProps, TreeView } from '@mui/lab';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
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
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>('');

  const [operationScreen, setOperationScreen] = useState<EnumActionScreen>(
    EnumActionScreen.SELECTING_ACTION,
  );

  const [nodes, setNodes] = useState<INode[]>([]);

  const [editingNode, setEditingNode] = useState<INode>({
    id: '',
    label: '',
    order: 0,
  });

  const findNodeById = useCallback((nodes: INode[], id?: string): INode | undefined => {
    if (!id) {
      return undefined;
    }
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

  const preview = useCallback(
    (nodes: INode[], editingNode: INode): { nodes: INode[]; hasChange: boolean } => {
      if (nodes.length === 0) return { nodes: [editingNode], hasChange: true };
      const nodesPreview: INode[] = [];
      let hasChange = false;
      nodes.forEach(node => {
        if (editingNode.id === node.id) {
          // current node is the editing node
          // set current node as deleting
          nodesPreview.push({ ...node, modified: EnumModified.DELETING, children: [] });
          if (editingNode.order === node.order) {
            // current node order is equal to editing node order
            // add editing node with that order
            nodesPreview.push(editingNode);
          }
          return;
        }
        if (editingNode.parent !== node.parent) {
          // current node has different parent as editing node
          if (node.children?.length > 0) {
            // current node has children
            // call the function recursively to get the preview of the children
            const { nodes: childrenPreview, hasChange: childrenHasChange } = preview(
              node.children,
              editingNode,
            );
            nodesPreview.push({
              ...node,
              children: childrenPreview,
              modified: childrenHasChange ? EnumModified.UPDATING : undefined,
            });
            hasChange = childrenHasChange || hasChange;
          } else {
            nodesPreview.push(node);
          }
          return;
        }
        // current node has same parent as editing node
        if (node.order < editingNode.order) {
          // current node order is less than editing node order
          // add current node to preview
          nodesPreview.push(node);
        } else if (node.order === editingNode.order) {
          // current node order is equal to editing node order
          // deleting operation was already handled
          // add editing node with current node order
          nodesPreview.push(editingNode);
          // add current node to preview with order + 1
          nodesPreview.push({
            ...node,
            order: node.order + 1,
            modified: EnumModified.UPDATING,
          });
          hasChange = true;
        } else {
          // current node order is greater than editing node order
          // if deleting, decrease the order of the current node
          let operation = -1;
          if (
            editingNode.modified === EnumModified.INSERTING ||
            editingNode.modified === EnumModified.UPDATING
          ) {
            // creating or updating
            // increase the order of the current node
            operation = 1;
          }
          nodesPreview.push({
            ...node,
            order: node.order + operation,
            modified: EnumModified.UPDATING,
          });
          hasChange = true;
        }
      });
      return { nodes: nodesPreview, hasChange };
    },
    [],
  );

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
            id: '0',
            label: '',
            order: 1,
            modified: EnumModified.INSERTING,
            parent: selectedNode?.id || undefined,
          });
          break;
        case EnumActionScreen.UPDATE:
          if (!selectedNode) {
            setSelected('');
            return;
          }
          setEditingNode({
            ...selectedNode,
            modified: EnumModified.INSERTING,
          });
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
                '& .MuiTreeItem-content .MuiTreeItem-label': {
                  color,
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
    [],
  );

  const renderOperationScreen = useCallback(() => {
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
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: '2rem',
                lineHeight: '2rem',
                letterSpacing: '0.18px',
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
                value={findNodeById(nodes, editingNode.parent)?.label || 'Raíz'}
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
                onClick={() => setEditingNode({ ...editingNode, parent: selected })}
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
  }, [operationScreen, editingNode, nodes, findNodeById, selected, handleActionChange]);

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
              expanded={expanded}
              selected={selected}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
            >
              {renderNodes(preview(nodes, editingNode).nodes)}
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
