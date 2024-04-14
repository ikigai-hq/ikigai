import { Badge, Divider, Dropdown, Popover, Space } from "antd";
import Icon, {
  CommentOutlined,
  FullscreenOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
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
import useSpaceStore from "context/ZustandClassStore";
import {
  CollapsedLeftIcon,
  ArrowDocument,
  MoreDocument,
  SettingIcon,
} from "components/common/IconSvg";
import { MenuProps } from "antd/lib";
import { GetDocuments_spaceGet_documents as IDocumentItemList } from "graphql/types";
import DocumentTypeIcon from "./DocumentTypeIcon";
import DocumentMoreSetting from "./DocumentMoreSetting";
import usePageBlockStore from "context/ZustandPageBlockStore";
import useHighlightStore from "context/ZustandHighlightStore";
import DocumentVersionHistory from "../DocumentVersionHistory";
import SaveHistoryManuallyModal from "../DocumentVersionHistory/SaveHistoryManuallyModal";
import { useKeyPress } from "ahooks";
import useSubmissionStatus from "hook/UseSubmissionStatus";

export type DocumentHeaderProps = {
  overrideClose?: () => Promise<void>;
  children?: React.ReactNode;
};

const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  overrideClose,
  children,
}) => {
  const router = useRouter();
  const theme = useTheme();

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

  const pageBlockMode = usePageBlockStore((state) => state.pageBlockMode);
  const updatePageBlockMode = usePageBlockStore(
    (state) => state.updatePageBlockMode,
  );
  const docs = useSpaceStore((state) => state.documents);
  
  const [openHistory, setOpenHistory] = useState(false);
  const [openSaveHistory, setOpenSaveHistory] = useState(false);
  const isPublic = masterDocument?.isPublic;
  const { isDoingSubmission } = useSubmissionStatus(masterDocument);
  
  useKeyPress("ctrl.shift.s", (e) => {
    // WARN: this is global catch
    e.preventDefault();
    setOpenSaveHistory(true);
  });

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
    if (overrideClose) {
      overrideClose();
      return;
    }

    if (pageBlockMode) {
      updatePageBlockMode(false);
      return;
    }

    return router.push("/");
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
      const listBreadcrumb = getFullPathFromNode(
        router.query.documentId as string,
        docs,
        true,
      );

      const isLastSubmission = (index: number): boolean => {
        return index === listBreadcrumb.length - 1;
      };

      return (
        <DocumentBreadcrumbContainer>
          <ButtonWithTooltip
            btnProps={{
              onClick: backToPreviousPage,
              icon: <ArrowDocument />,
              type: "text",
              style: { marginRight: "10px" },
            }}
            tooltipProps={{
              title: t`Back`,
            }}
          />
          {listBreadcrumb.map((breadcrumb, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                bottom: 1,
              }}
            >
              {breadcrumb.spaceId ? (
                <DocumentBreadcrumb
                  onClick={() => {
                    router.push(
                      formatDocumentRoute(breadcrumb.id),
                      undefined,
                      { shallow: true },
                    );
                  }}
                >
                  <Space size={8}>
                    <DocumentBreadcrumbTitle
                      color={
                        theme.colors.gray[isLastSubmission(index) ? 10 : 6]
                      }
                    >
                      {breadcrumb?.document?.title || DEFAULT_DOCUMENT_TITLE}
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
    return;
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
        isSelected={leftPanelHidden}
      />
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
          isSelected={rightPanelHidden}
        />
        <Popover
          content={<DocumentMoreSetting onClickOpenHistory={() => setOpenHistory(true)} />}
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
        {
          !isMobileView() && isDoingSubmission && (
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
          )
        }
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
            tooltipProps={{ title: documentConfig.showGradeSummary ? t`Grade` : t`Questions` }}
            isSelected={documentConfig.rightPanelTab === PanelContentType.Submission}
          />
        )}
        {children}
      </StyledActionContainer>
      {
        openHistory && masterDocument &&
        <DocumentVersionHistory
          visible={openHistory}
          onClose={() => setOpenHistory(false)}
          documentId={masterDocument.id}
        />
      }
      {
        openSaveHistory &&
        <SaveHistoryManuallyModal
          visible={openSaveHistory}
          onClose={() => setOpenSaveHistory(false)}
        />
      }
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

export default DocumentHeader;
