import React from 'react';
import { Box } from '@mui/material';
import { TreeItem, TreeView } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { EnumAction, IEditingNode, INode } from '../../../types';

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
          case EnumAction.CREATE:
            color = 'green';
            break;
          case EnumAction.UPDATE:
            color = 'orange';
            break;
          case EnumAction.DELETE:
            color = 'red';
            break;
        }
        if (node.children?.length > 0) {
          return (
            <TreeItem
              key={node.id}
              nodeId={node.id.toString()}
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
            nodeId={node.id.toString()}
            label={node.label}
            sx={{
              '& .MuiTreeItem-content .MuiTreeItem-label': {
                color,
                fontWeight,
              },
            }}
          />
        );
      }),
    [editingNode.id],
  );

  return (
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
  );
};
