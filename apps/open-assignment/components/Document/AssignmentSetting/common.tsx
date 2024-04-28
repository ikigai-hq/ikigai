import styled from "styled-components";

export const TitleSettingSection = styled.div`
  font-family: "Inter", sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 22px;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray[6]};
  margin-bottom: 10px;
`;
