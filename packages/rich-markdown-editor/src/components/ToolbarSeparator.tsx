import styled from "styled-components";

const Separator = styled.div`
  background: ${(props) => props.theme.toolbarItem};
  opacity: 0.3;
  border: 1px solid #888e9c;
  display: inline-block;
`;

export default Separator;
