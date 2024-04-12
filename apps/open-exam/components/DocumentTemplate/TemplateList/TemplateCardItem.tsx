import styled from "styled-components";
import { Typography } from "antd";
import React from "react";

import {
  GetCommunityTemplates_getCommunityDocumentTemplates as IDocumentTemplate,
} from "graphql/types";
import AvatarWithName from "../../AvatarWithName";

export type TemplateCardItemProps = {
  template: IDocumentTemplate;
  onClick: () => void;
};

const TemplateCardItem = ({ template, onClick }: TemplateCardItemProps) => {
  const name = template.creator ? `${template.creator.firstName} ${template.creator.lastName}` : "Unknown";
  return (
    <CardContainer onClick={onClick}>
      <CardImage $bannerUrl="/design.png" />
      <div>
        <div style={{ marginTop: "10px" }}>
          <AvatarWithName
            name={name}
            avtUrl={template.creator?.avatar?.publicUrl}
            color={template.creator?.randomColor}
          />
        </div>
        <Typography.Title
          style={{ marginTop: 12 }}
          level={4}
          ellipsis
        >
          {template.name}
        </Typography.Title>
      </div>
    </CardContainer>
  );
};

const CardContainer = styled.div`
    position: relative;
    box-sizing: border-box;
    border-radius: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    box-shadow: 0px 14px 42px 0px rgba(8, 15, 52, 0.06);
    min-height: 300px;

    &:hover {
        background: ${props => props.theme.colors.gray[3]};
        cursor: pointer;
    }
`;

export const CardImage = styled.div<{ $bannerUrl: string }>`
    border-radius: 12px;
    width: 100%;
    height: 203px;
    background: url("${(props) => props.$bannerUrl}") lightgray 50% / cover
    no-repeat;
`;

export default TemplateCardItem;
