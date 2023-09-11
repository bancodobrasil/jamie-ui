import React from 'react';
import { Box } from '@mui/material';
import { TreeItem, TreeView } from '@mui/lab';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { EnumInputAction, IEditingNode, INode } from '../../../types';

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
    (nodes: INode[]) => {
      const baseSX = {
        border: '1px solid #eaeaec',
        margin: '3px 0px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '12px 0px 13px 25px',
      };

      return nodes.map(node => {
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
        if (node.children?.length > 0) {
          return (
            <TreeItem
              key={node.id}
              nodeId={node.id.toString()}
              label={node.label}
              sx={{
                '& > .MuiTreeItem-content': {
                  ...baseSX,
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
              '& .MuiTreeItem-content': {
                ...baseSX,
                color,
                fontWeight,
              },
            }}
          />
        );
      });
    },
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
