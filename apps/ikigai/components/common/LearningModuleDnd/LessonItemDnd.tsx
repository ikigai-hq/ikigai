import React from "react";
import styled from "styled-components";

import {
  SimpleTreeItemWrapper,
  TreeItemComponentProps,
} from "components/common/SortableTree";
import { LearningModuleItemTypeWrapper } from "components/common/LearningModuleDnd/types";
import LessonItem from "./LessonItem";

const LessonItemDnd = React.forwardRef<
  HTMLDivElement,
  TreeItemComponentProps<LearningModuleItemTypeWrapper>
>((props, ref) => {
  return (
    <StyledTree
      ref={ref}
      {...props}
      indentationWidth={20}
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
