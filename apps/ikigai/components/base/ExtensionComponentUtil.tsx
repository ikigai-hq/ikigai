import styled from "styled-components";

export const BlockExtensionWrapper = styled.div<{ $selected: boolean }>`
  border: 1px solid var(--gray-4);
  border-radius: 4px;
  padding: 10px;
  background-color: ${(props) =>
    props.$selected ? "var(--indigo-3)" : "unset"};

  &:hover {
    background-color: var(--gray-2);
    cursor: pointer;
  }
`;
