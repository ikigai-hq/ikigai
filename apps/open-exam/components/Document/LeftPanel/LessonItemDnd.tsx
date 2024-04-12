import { LearningModuleItemTypeWrapper } from "../../common/LearningModuleDnd/types";
import React from "react";
import {
  SimpleTreeItemWrapper,
  TreeItemComponentProps,
} from "../../common/SortableTree";
import styled from "styled-components";
import LessonItem from "./LessonItem";

const LessonItemDnd = React.forwardRef<
  HTMLDivElement,
  TreeItemComponentProps<LearningModuleItemTypeWrapper>
>((props, ref) => {
  return (
    <StyledTree
      ref={ref}
      {...props}
      indentationWidth={25}
      hideCollapseButton
      collapsed={props.collapsed}
      disableCollapseOnItemClick
      manualDrag={false}
      showDragHandle={false}
      indicator
    >
      <LessonItem
        item={props.item.data}
        collapsed={props.collapsed}
        onChangeCollapsed={props.onCollapse}
        dragging={props.clone || props.ghost}
        hasChildren={!!props.childCount}
      />
    </StyledTree>
  );
});

const StyledTree = styled(SimpleTreeItemWrapper)`
  .dnd-sortable-tree_simple_tree-item {
    border: none;
    padding: unset;
  }
`;

export default LessonItemDnd;
