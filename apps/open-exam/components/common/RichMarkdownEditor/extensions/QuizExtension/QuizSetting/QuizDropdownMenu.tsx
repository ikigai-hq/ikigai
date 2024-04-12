import {
  CreateQuizStructure,
  QuizType,
  GetDocumentDetail_documentGet_quizzes as IDocumentQuiz,
  CreateQuizStructure_quizCreateStructure as ICreateQuizStructure,
} from "graphql/types";
import { Dropdown, MenuProps, Modal, Typography } from "antd";

import { ConfirmPopup } from "util/ConfirmPopup";
import useDocumentPermission from "hook/UseDocumentPermission";
import { DocumentPermission } from "util/permission";
import { useMutation } from "@apollo/client";
import { CREATE_QUIZ_STRUCTURE } from "graphql/mutation";
import { handleError } from "graphql/ApolloClient";

import { QuizAttrs } from "../type";
import QuizSetting from "./index";
import { ReactNode } from "react";
import { Trans, t } from "@lingui/macro";
import ModalComponent from "components/common/Modal";

export type QuizDropdownMenu = {
  documentId: string;
  attrs: QuizAttrs;
  data: IDocumentQuiz;
  onChangeTitle: (quizTitle: string) => Promise<void>;
  handleDelete: () => void;
  quizStructureId: string;
  refetch?: (
    quizId: string,
    quizDataChange: ICreateQuizStructure,
    structureAnswer: any,
    structureExplanation: string
  ) => Promise<void>;
  openSetting: boolean;
  setOpenSetting: (openSetting: boolean) => void;
  onSelectAndCopy?: () => void;
  children: ReactNode;
};

const QuizDropdownMenu: React.FC<QuizDropdownMenu> = (props) => {
  const {
    documentId,
    children,
    handleDelete,
    onChangeTitle,
    data,
    attrs,
    quizStructureId,
    openSetting,
    setOpenSetting,
    onSelectAndCopy,
    refetch,
  } = props;
  const [modal, contextHolder] = Modal.useModal();

  const [createQuizStructure] = useMutation<CreateQuizStructure>(
    CREATE_QUIZ_STRUCTURE,
    {
      onError: handleError,
    }
  );

  const documentAllow = useDocumentPermission();

  const save = async (
    quizType: QuizType,
    quizTitle: string,
    quizBody: any,
    structureAnswer: any,
    structureExplanation: string
  ) => {
    if (!documentAllow(DocumentPermission.ManageDocument)) return;

    if (!documentId) return;

    if (quizTitle !== attrs.quizTitle) {
      await onChangeTitle(quizTitle);
    }

    if (attrs.quizId) {
      const res = await createQuizStructure({
        variables: {
          data: {
            id: quizStructureId,
            quizType,
            quizTitle,
            quizBody,
            quizAnswer: structureAnswer,
            explanation: structureExplanation,
          },
        },
      });

      refetch &&
        refetch(
          attrs.quizId,
          res.data.quizCreateStructure,
          structureAnswer,
          structureExplanation
        );
    }
  };

  const onDelete = () => {
    modal.confirm(
      ConfirmPopup({
        title: t`Do you want delete this quiz?`,
        onOk: handleDelete,
        content: "",
      }) as any
    );
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      onClick: onSelectAndCopy,
      label: (
        <Typography.Text>
          <Trans>Select and copy</Trans>
        </Typography.Text>
      ),
    },
    {
      key: "2",
      onClick: () => setOpenSetting(true),
      label: (
        <Typography.Text>
          <Trans>Open settings</Trans>
        </Typography.Text>
      ),
    },
    {
      key: "3",
      onClick: onDelete,
      label: (
        <Typography.Text type="danger">
          <Trans>Delete</Trans>
        </Typography.Text>
      ),
    },
  ];

  return (
    <>
      <Dropdown
        placement="bottom"
        trigger={["click"]}
        overlayStyle={{ width: "180px" }}
        menu={{ items: items }}
      >
        {children}
      </Dropdown>
      <ModalComponent
        centered
        title="Question"
        visible={openSetting}
        onClose={() => setOpenSetting(false)}
        width={865}
      >
        <QuizSetting
          onClose={() => setOpenSetting(false)}
          attrs={attrs}
          data={data}
          saveQuiz={save}
        />
      </ModalComponent>
      {contextHolder}
    </>
  );
};

export default QuizDropdownMenu;
