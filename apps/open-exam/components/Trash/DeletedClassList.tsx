import { Col, Row } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";

import DeletedItem from "./DeletedItem";
import { GET_DELETED_SPACES } from "graphql/query/ClassQuery";
import { handleError } from "graphql/ApolloClient";
import { GetDeletedSpaces } from "graphql/types";
import Loading from "../Loading";
import { DELETE_SPACE, RESTORE_SPACE } from "graphql/mutation/ClassMutation";

const DeletedClassList = () => {
  const { data, loading, refetch } = useQuery<GetDeletedSpaces>(GET_DELETED_SPACES, {
    onError: handleError,
    fetchPolicy: "network-only",
  });
  const [restoreClass] = useMutation(RESTORE_SPACE, {
    onError: handleError,
  });
  const [deleteClass] = useMutation(DELETE_SPACE, {
    onError: handleError,
  });
  
  const onRestore = async (classId: number) => {
    const { data } = await restoreClass({ variables: { classId }});
    if (data) toast.success(t`Restored!`);
    refetch();
  };
  
  const onDelete = async (classId: number) => {
    const { data } = await deleteClass({ variables: { classId }});
    if (data) toast.success(t`Deleted!`);
    refetch();
  };
  
  if (loading || !data) return <Loading />;
  
  const items = cloneDeep(data.spaceGetDeletedSpaces)
    .sort((a, b) => b.deletedAt - a.deletedAt);
  return (
    <Row>
      {
        items.map(classData => (
          <Col span={6} key={classData.id}>
            <DeletedItem
              classId={classData.id}
              title={classData.name}
              deletedAt={classData.deletedAt}
              onRestore={onRestore}
              onDelete={onDelete}
              imageSrc={classData.banner?.publicUrl || "/course-image.png"}
            />
          </Col>
        ))
      }
    </Row>
  );
};

export default DeletedClassList;
