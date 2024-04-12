import styled from "styled-components";
import { Button } from "antd";
import {t, Trans} from "@lingui/macro";
import React, { useState } from "react";
import {useQuery} from "@apollo/client";

import {GetMyClasses} from "graphql/types";
import { ClassCard } from "./ClassCard";
import {GET_MY_CLASSES} from "graphql/query/ClassQuery";
import {handleError} from "graphql/ApolloClient";
import Loading from "../Loading";
import CreateClassModal from "./CreateClassModal";
import PageTitle from "../common/PageTitle";

const ClassList = () => {
  const [openCreateClass, setOpenCreateClass] = useState(false);
  const { data, loading, refetch } = useQuery<GetMyClasses>(GET_MY_CLASSES, {
    onError: handleError,
    fetchPolicy: "network-only",
  });
  
  if (loading || !data) return <Loading />;

  const classes = data.classGetMyClasses.filter(c => c);
  console.log("Hello", classes);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex" }}>
        <PageTitle readOnly={true} title={t`Classes`} isBack={false} />
        <Button
          type="primary"
          size="large"
          onClick={() => setOpenCreateClass(true)}
        >
          <Trans>
            Create Class
          </Trans>
        </Button>
      </div>
      <ClassContainer>
        {classes.map((classData) => {
          return <ClassCard
            key={classData.id}
            classItem={classData}
            refetch={() => refetch()}
          />;
        })}
      </ClassContainer>
      <CreateClassModal
        visible={openCreateClass}
        onClose={() => setOpenCreateClass(false)}
      />
    </div>
  );
};

const ClassContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(304px, 1fr));
  gap: 30px;
`;

export default ClassList;
