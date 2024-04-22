import { AuditOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";

import {
  GetDocumentDetail_documentGet as IDocument,
  OrgRole,
} from "graphql/types";
import AssignmentStudentList from "../AssignmentStudentList";
import { StyledRightMenu } from "../common";
import useDocumentStore from "context/ZustandDocumentStore";
import { t } from "@lingui/macro";
import { ButtonWithTooltip } from "components/common/Button";
import { useGetSpaceMembers } from "context/ZustandClassMembeStore";

export type AdminAssignmentDocumentProps = {
  document: IDocument;
};

const AssignmentHeader = ({ document }: AdminAssignmentDocumentProps) => {
  const setIsClose = useDocumentStore((state) => state.setIsClose);
  const [openStudentList, setOpenStudentList] = useState(false);
  const { members: students } = useGetSpaceMembers(
    document?.spaceId,
    OrgRole.STUDENT,
  );

  useEffect(() => {
    setIsClose(false);
  }, []);

  return (
    <>
      <StyledRightMenu style={{ gap: 4 }}>
        <ButtonWithTooltip
          btnProps={{
            type: "text",
            icon: <AuditOutlined />,
            onClick: () => setOpenStudentList(true),
          }}
          tooltipProps={{
            title: t`Submission List`,
            destroyTooltipOnHide: true,
          }}
        />
      </StyledRightMenu>
      <AssignmentStudentList
        open={openStudentList}
        onClose={() => setOpenStudentList(false)}
        members={students}
        submissions={document.assignment.submissions}
      />
    </>
  );
};

export default AssignmentHeader;
