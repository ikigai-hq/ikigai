import {
  GetAnswersOfStructure,
  GetSpaceMembers_spaceGet_members as IMember,
  OrgRole,
  QuizType,
} from "graphql/types";
import { GET_ANSWERS_OF_STRUCTURE } from "graphql/query/QuizQuery";

import { useLazyQuery } from "@apollo/client";
import { Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/macro";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";

import Modal from "components/common/Modal";
import { Button } from "components/common/Button";
import Loading from "../../Loading";
import useDocumentStore from "context/ZustandDocumentStore";
import useQuizStore from "context/ZustandQuizStore";

export type AssignmentQuizzAnswersCSVProps = {
  children: ReactNode;
  structureAnswers: Map<string, GetAnswersOfStructure>;
  members: IMember[];
};

const AssignmentQuizzAnswers = ({
  children,
  structureAnswers,
  members,
}: AssignmentQuizzAnswersCSVProps) => {
  const documentTitle = useDocumentStore((state) => state.masterDocument.title);
  const masterDocumentId = useDocumentStore((state) => state.masterDocument.id);
  const quizzes = useQuizStore((state) =>
    state.mapQuizBlockData.get(masterDocumentId),
  );
  const documentQuizzes = useQuizStore((state) => state.quizzes);
  const students = members
    .filter((member) => member.user.orgMember.orgRole === OrgRole.STUDENT)
    .map((member) => member.user);

  // Build Headers
  const headers = [
    {
      label: "ID",
      key: "userId",
    },
    {
      label: "First name",
      key: "firstName",
    },
    {
      label: "Last name",
      key: "lastName",
    },
  ];

  quizzes
    ?.filter((quizz) => documentQuizzes.get(quizz.id))
    ?.forEach((quizz, index) => {
      const documentQuizz = documentQuizzes.get(quizz.id);
      headers.push({
        label: `Q.${index + 1} ${documentQuizz?.structure?.quizTitle}`,
        key: documentQuizz?.structure?.id,
      });
    });

  // Build data
  const data = students.map((student) => {
    const studentData = {
      userId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
    };

    quizzes
      ?.filter((quizz) => documentQuizzes.get(quizz.id))
      ?.forEach((quizz) => {
        const documentQuizz = documentQuizzes.get(quizz.id);
        const answers = structureAnswers.get(documentQuizz.structure.id);
        const userAnswer = answers?.quizGetAllStructureAnswers?.find(
          (answer) => answer.userId === student.id,
        );
        if (userAnswer) {
          if (documentQuizz.structure.quizType === QuizType.MULTIPLE_CHOICE) {
            studentData[documentQuizz.structure.id] = userAnswer.answer.answer
              .map(
                (optionIndex: number) =>
                  documentQuizz.structure.quizBody[optionIndex] || "",
              )
              .join(", ");
          } else {
            studentData[documentQuizz.structure.id] =
              userAnswer.answer.answer || "";
          }
        }
      });

    return studentData;
  });

  return (
    <CSVLink
      data={data}
      headers={headers}
      filename={`${documentTitle}-answers-${new Date().getTime()}`}
    >
      {children}
    </CSVLink>
  );
};

export type AssignmentQuizzAnswersDownloadProps = {
  members: IMember[];
  visible: boolean;
  onClose: () => void;
};

const AssignmentQuizAnswersDownload = (
  props: AssignmentQuizzAnswersDownloadProps,
) => {
  // TODO: Need to check later. I'm not sure that this logic will be correct after refactor quizzes
  const documentId = useDocumentStore((state) => state.masterDocumentId);
  const quizzes = useQuizStore((state) =>
    state.mapQuizBlockData.get(documentId),
  );
  const documentQuizzes = useQuizStore((state) => state.quizzes);
  const [getAnswersOfStructure] = useLazyQuery<GetAnswersOfStructure>(
    GET_ANSWERS_OF_STRUCTURE,
  );
  const [loading, setLoading] = useState(true);
  const structureAnswers = useRef<Map<string, GetAnswersOfStructure>>(
    new Map(),
  );

  const loadData = async () => {
    setLoading(true);
    for (const quizz of quizzes) {
      const documentQuizz = documentQuizzes.get(quizz.id);
      if (documentQuizz) {
        const quizStructureId = documentQuizz.structure.id;
        const { data } = await getAnswersOfStructure({
          variables: { quizStructureId: documentQuizz.structure.id },
        });
        structureAnswers.current.set(quizStructureId, data);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const isLoading = loading;
  return (
    <Modal {...props} width={280}>
      {isLoading && <Loading />}
      {!isLoading && (
        <AssignmentQuizzAnswers
          structureAnswers={structureAnswers.current}
          members={props.members}
        >
          <Button type="primary">
            <Space size={8}>
              <DownloadOutlined />
              <Trans>Download (.csv)</Trans>
            </Space>
          </Button>
        </AssignmentQuizzAnswers>
      )}
    </Modal>
  );
};

export default AssignmentQuizAnswersDownload;
