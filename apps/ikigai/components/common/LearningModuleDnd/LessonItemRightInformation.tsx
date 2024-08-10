import {
  LockClosedIcon,
  LockOpen2Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Badge, Separator, Text, Tooltip } from "@radix-ui/themes";
import { t, Trans } from "@lingui/macro";

import { LearningItemType } from "components/common/LearningModuleDnd/types";
import {
  DocumentType,
  DocumentVisibility,
  Role,
  SpaceActionPermission,
} from "graphql/types";
import usePermission from "hook/UsePermission";
import { useGetSpaceMembers } from "store/SpaceMembeStore";

export type LessonItemRightInformationProps = {
  item: LearningItemType;
};

const LessonItemRightInformation = (props: LessonItemRightInformationProps) => {
  const allow = usePermission();

  if (props.item.documentType === DocumentType.FOLDER) return <></>;

  if (allow(SpaceActionPermission.MANAGE_SPACE_CONTENT)) {
    return <TeacherLessonItemRightInformation {...props} />;
  }

  const totalAttempt = props.item?.assignment?.submissions?.length || 0;
  const lastSubmission = (props.item?.assignment?.submissions || []).sort(
    (a, b) => b.attemptNumber - a.attemptNumber,
  )[0];
  return (
    <div
      style={{
        paddingRight: 10,
        display: "flex",
        gap: 4,
        alignItems: "center",
      }}
    >
      {props.item.tags.map((tag) => (
        <Badge key={tag.tag} color="gold" style={{ marginRight: 4 }}>
          {tag.tag}
        </Badge>
      ))}
      {totalAttempt > 0 && (
        <Tooltip content={t`${totalAttempt} attempts`}>
          <Badge color="brown">
            <Text size="2" color="gray">
              {totalAttempt} 📄
            </Text>
          </Badge>
        </Tooltip>
      )}
      {totalAttempt === 0 && (
        <Badge color="gray">
          <Text size="2" color="gray">
            <Trans>Not attempted</Trans>
          </Text>
        </Badge>
      )}
      {lastSubmission && (
        <>
          <Separator orientation="vertical" />
          <Text color={"gray"}>
            <Trans>Score:</Trans>
          </Text>
          <Text weight="medium">{lastSubmission.finalGrade?.toFixed(2)}</Text>
        </>
      )}
    </div>
  );
};

const TeacherLessonItemRightInformation = ({
  item,
}: LessonItemRightInformationProps) => {
  const uniqueSubmissions = new Set(
    (item?.assignment?.submissions || []).map(
      (submission) => submission.userId,
    ),
  );
  const { members } = useGetSpaceMembers(Role.STUDENT);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        paddingRight: 10,
      }}
    >
      {item.tags.map((tag) => (
        <Badge key={tag.tag} color="gold">
          {tag.tag}
        </Badge>
      ))}
      <Tooltip content={t`${uniqueSubmissions.size} students do assignments`}>
        <Badge color="brown">
          <Text size="2" color="gray">
            {uniqueSubmissions.size} / {members.length} 📄
          </Text>
        </Badge>
      </Tooltip>
      <Separator orientation="vertical" />
      <Badge color="gray">
        <VisibilityIcon item={item} />
      </Badge>
    </div>
  );
};

export const VisibilityIcon = ({ item }: LessonItemRightInformationProps) => {
  switch (item.visibility) {
    case DocumentVisibility.PRIVATE:
      return (
        <Tooltip content={t`Private`}>
          <LockClosedIcon color="gray" width={18} height={18} />
        </Tooltip>
      );
    case DocumentVisibility.ASSIGNEES:
      return (
        <Tooltip content={t`Assignees only`}>
          <PersonIcon color="gray" width={18} height={18} />
        </Tooltip>
      );
    default:
      return (
        <Tooltip content={t`Public`}>
          <LockOpen2Icon color="gray" width={18} height={18} />
        </Tooltip>
      );
  }
};

export default LessonItemRightInformation;
