import { Progress, Typography } from "antd";
import { useQuery } from "@apollo/client";

import { GET_QUIZ_STATS } from "graphql/query/QuizQuery";
import { handleError } from "graphql/ApolloClient";
import { GetQuizStats } from "graphql/types";
import Loading from "components/Loading";

export type QuizReportProps = {
  quizId: string;
};

const QuizReport = ({ quizId }: QuizReportProps) => {
  const { data, loading } = useQuery<GetQuizStats>(GET_QUIZ_STATS, {
    onError: handleError,
    variables: { quizId },
  });

  if (loading || !data) return <Loading />;

  const total = data.quizGetStats.countAnswers.reduce(
    (partialSum, a) => partialSum + a,
    0
  );
  return (
    <div>
      {data.quizGetStats.options.map((option, index) => {
        let percent = 0;
        if (total) {
          percent =
            ((data.quizGetStats.countAnswers[index] || 0) / total) * 100;
        }

        return (
          <div key={option}>
            <div>
              <Typography.Text strong>
                {index + 1}. {option}
              </Typography.Text>
            </div>
            <div>
              <Progress
                style={{ width: "97%" }}
                status="active"
                percent={percent}
                format={(percent) => `${percent.toFixed(1)}%`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizReport;
