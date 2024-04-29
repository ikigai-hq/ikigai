import { Badge, Divider, Dropdown, Popover, Space } from "antd";
import Icon, {
  CommentOutlined,
  FullscreenOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import React from "react";
import { useRouter } from "next/router";
import styled, { useTheme } from "styled-components";
import { t, Trans } from "@lingui/macro";

import { Text, TextWeight } from "../common/Text";
import {
  DocumentPermission,
  DocumentType,
  getDocumentType,
} from "../../util/permission";
import { DEFAULT_DOCUMENT_TITLE, DocumentHeaderWrapper } from "./common";
import useDocumentStore, {
  PanelContentType,
} from "context/ZustandDocumentStore";
import DocumentSharing from "./DocumentSharing";
import { ButtonWithTooltip } from "../common/Button";
import useDocumentPermission from "hook/UseDocumentPermission";
import { isMobileView } from "hook/UseSupportMobile";
import { formatDocumentRoute } from "config/Routes";
import { getFullPathFromNode } from "components/common/SortableTree/utilities";
import useSpaceStore from "../../context/ZustandSpaceStore";
import {
  CollapsedLeftIcon,
  ArrowDocument,
  MoreDocument,
  SettingIcon,
} from "components/common/IconSvg";
import { MenuProps } from "antd/lib";
import { GetDocuments_spaceGet_documents as IDocumentItemList } from "graphql/types";
import DocumentTypeIcon from "./DocumentTypeIcon";
import useHighlightStore from "context/ZustandHighlightStore";
import useSubmissionStatus from "hook/UseSubmissionStatus";
import { isArray } from "lodash";

export type DocumentHeaderProps = {
  children?: React.ReactNode;
};

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const { back, replace } = useRouter();
  const documentAllow = useDocumentPermission();
  const masterDocument = useDocumentStore((state) => state.masterDocument);
  const changeRightPanel = useDocumentStore((state) => state.changeRightPanel);
  const documentConfig = useDocumentStore((state) => state.documentConfig);
  const leftPanelHidden = useDocumentStore((state) => state.leftPanelHidden);
  const setLeftPanelHidden = useDocumentStore(
    (state) => state.setLeftPanelHidden,
  );
  const rightPanelHidden = useDocumentStore((state) => state.rightPanelHidden);
  const setRightPanelHidden = useDocumentStore(
    (state) => state.setRightPanelHidden,
  );
  const isSaving = useDocumentStore((state) => state.isSaving);
  const setFocusMode = useDocumentStore((state) => state.setFocusMode);
  const docs = useSpaceStore((state) => state.documents);
  const isPublic = masterDocument?.isPublic;
  const { isDoingSubmission, isSubmissionDocument } =
    useSubmissionStatus(masterDocument);

  const getMenuList = (
    subBreadcrumb: IDocumentItemList[],
  ): MenuProps["items"] => {
    return subBreadcrumb.map((breadcrumb, index) => ({
      key: index,
      label: (
        <MenuItem
          onClick={() =>
            router.push(formatDocumentRoute(breadcrumb.id), undefined, {
              shallow: true,
            })
          }
        >
          <DocumentTypeIcon documentType={breadcrumb.documentType} />
          {breadcrumb.title}
        </MenuItem>
      ),
    }));
  };

  const backToPreviousPage = () => {
    if (history.length >= 1) {
      back();
    } else {
      replace("/");
    }
  };

  if (!masterDocument) {
    return (
      <DocumentHeaderWrapper>
        <StyledActionContainer />
      </DocumentHeaderWrapper>
    );
  }

  const renderBreadcrumb = () => {
    if (docs) {
      const listBreadcrumb = getFullPathFromNode(masterDocument.id, docs);

      const isLastSubmission = (index: number): boolean => {
        return index === listBreadcrumb.length - 1;
      };

      const finalBreadcrumb =
        listBreadcrumb.length > 3
          ? [
              listBreadcrumb[0],
              listBreadcrumb.slice(1, listBreadcrumb.length - 2),
              listBreadcrumb[listBreadcrumb.length - 2],
              listBreadcrumb[listBreadcrumb.length - 1],
            ]
          : listBreadcrumb;
      return (
        <DocumentBreadcrumbContainer>
          {finalBreadcrumb.map((breadcrumb, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                bottom: 1,
              }}
            >
              {!isArray(breadcrumb) ? (
                <DocumentBreadcrumb
                  onClick={() => {
                    router.push(formatDocumentRoute(breadcrumb.id), undefined, {
                      shallow: true,
                    });
                  }}
                >
                  <Space size={8}>
                    <DocumentBreadcrumbTitle
                      color={
                        theme.colors.gray[isLastSubmission(index) ? 10 : 6]
                      }
                    >
                      {breadcrumb?.title || DEFAULT_DOCUMENT_TITLE}
                    </DocumentBreadcrumbTitle>
                    {isSaving && isLastSubmission(index) && (
                      <Text
                        level={1}
                        weight={TextWeight.regular}
                        color={theme.colors.gray[6]}
                      >
                        <Trans>Saving</Trans>...
                      </Text>
                    )}
                  </Space>
                </DocumentBreadcrumb>
              ) : (
                <DocumentBreadcrumb>
                  <Dropdown
                    menu={{ items: getMenuList(breadcrumb) }}
                    trigger={["click"]}
                    getPopupContainer={(trigger: any) => trigger.parentNode}
                    overlayClassName="dropdown-breadcrumb"
                    onOpenChange={(e) => {
                      if (e) {
                        const changeStyle = setTimeout(() => {
                          const dropdownEl = document.getElementsByClassName(
                            "dropdown-breadcrumb",
                          );
                          dropdownEl[0]
                            .querySelectorAll("li")
                            .forEach((element, index) => {
                              element.style.marginLeft = `${25 * index}px`;
                            });
                        }, 50);
                        clearTimeout(changeStyle);
                      }
                    }}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <MoreDocument />
                    </a>
                  </Dropdown>
                </DocumentBreadcrumb>
              )}
              {isLastSubmission(index) ? null : (
                <ArrowDocument
                  style={{ width: 12, height: 12, transform: "rotate(180deg)" }}
                />
              )}
            </div>
          ))}
        </DocumentBreadcrumbContainer>
      );
    }
  };

  return (
    <DocumentHeaderWrapper>
      <ButtonWithTooltip
        btnProps={{
          type: "text",
          icon: <Icon component={CollapsedLeftIcon} />,
          onClick: () => setLeftPanelHidden(!leftPanelHidden),
        }}
        tooltipProps={{
          title: t`Collapse/Expand Left Side`,
          destroyTooltipOnHide: true,
        }}
        isSelected={!leftPanelHidden}
      />
      {isSubmissionDocument && !isDoingSubmission && (
        <BackBtn onClick={backToPreviousPage}>
          <LeftOutlined />
        </BackBtn>
      )}
      {renderBreadcrumb()}
      <StyledActionContainer>
        <ButtonWithTooltip
          btnProps={{
            type: "text",
            icon: <Icon component={CollapsedLeftIcon} />,
            onClick: () => setRightPanelHidden(!rightPanelHidden),
          }}
          tooltipProps={{
            title: t`Collapse/Expand Right Side`,
            destroyTooltipOnHide: true,
          }}
          isSelected={!rightPanelHidden}
        />
        <Popover
          placement="bottomRight"
          trigger="click"
          arrow={false}
          getPopupContainer={(trigger: any) => trigger.parentNode}
        >
          <>
            <ButtonWithTooltip
              btnProps={{
                type: "text",
                icon: <SettingIcon />,
                onClick: () => {},
              }}
              tooltipProps={{ title: t`Settings` }}
            />
          </>
        </Popover>
        {documentAllow(DocumentPermission.ManageDocument) && (
          <Popover
            content={<DocumentSharing />}
            placement="bottomRight"
            trigger="click"
            arrow={false}
          >
            <>
              <ButtonWithTooltip
                btnProps={{
                  type: "text",
                  icon: (
                    <Badge
                      status={isPublic ? "success" : "default"}
                      dot={isPublic}
                    >
                      <ShareAltOutlined />
                    </Badge>
                  ),
                  onClick: () => {},
                }}
                tooltipProps={{ title: t`Share` }}
              />
            </>
          </Popover>
        )}
        <Divider type="vertical" style={{ height: "22px" }} />
        {!isMobileView() && isDoingSubmission && (
          <ButtonWithTooltip
            btnProps={{
              type: "text",
              icon: <Icon component={FullscreenOutlined} />,
              onClick: () => setFocusMode(true),
            }}
            tooltipProps={{
              title: t`Focus Mode`,
              destroyTooltipOnHide: true,
            }}
          />
        )}
        {!isMobileView() && documentConfig.showFeedbackButton && (
          <ButtonWithTooltip
            btnProps={{
              type: "text",
              icon: <CommentOutlined />,
              onClick: () => {
                changeRightPanel(PanelContentType.Feedback);
                useHighlightStore.setState({ selectedHighlight: "" });
              },
            }}
            tooltipProps={{ title: t`Feedback` }}
            isSelected={
              documentConfig.rightPanelTab === PanelContentType.Feedback
            }
          />
        )}
        {documentConfig.showQuizSettingReview && (
          <ButtonWithTooltip
            btnProps={{
              type: "text",
              icon: <QuestionCircleOutlined />,
              onClick: () => {
                changeRightPanel(PanelContentType.SettingQuizzes);
              },
            }}
            tooltipProps={{ title: t`Review setting quizzes` }}
            isSelected={
              documentConfig.rightPanelTab === PanelContentType.SettingQuizzes
            }
          />
        )}
        {getDocumentType(masterDocument) === DocumentType.Submission && (
          <ButtonWithTooltip
            btnProps={{
              type: "text",
              icon: <SnippetsOutlined />,
              onClick: () => changeRightPanel(PanelContentType.Submission),
            }}
            tooltipProps={{
              title: documentConfig.showGradeSummary ? t`Grade` : t`Questions`,
            }}
            isSelected={
              documentConfig.rightPanelTab === PanelContentType.Submission
            }
          />
        )}
        {children}
      </StyledActionContainer>
    </DocumentHeaderWrapper>
  );
};

const StyledActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: row-reverse;
  min-height: 28px;
  gap: 4px;
`;

const DocumentBreadcrumbContainer = styled.ul`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const DocumentBreadcrumb = styled.li`
  display: inline-block;
  cursor: pointer;
  border-radius: 4px;
  padding: 0px 8px;

  .ant-space-item {
    &:first-child {
      display: flex;
    }
  }

  &:hover {
    background: var(--gray-3, #f4f5f7);
  }
`;

const DocumentBreadcrumbTitle = styled.div<{ color: string }>`
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: ${(props) => props.color};
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: -0.014px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${(props) => props.theme.colors.gray[8]};
  font-size: 14px;
`;

const BackBtn = styled.div`
  margin: 12px;
  cursor: pointer;
`;

export default DocumentHeader;
