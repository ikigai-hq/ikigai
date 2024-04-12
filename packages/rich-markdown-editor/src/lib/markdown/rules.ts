import markdownit, { PluginSimple } from "markdown-it";
import { zenklassBlockRule } from "../../rules/zenklassBlockRule";
import fillInBlank from "../../rules/fillInBlank";
import feedbackText from "../../rules/feedbackText";

export const FILE_BLOCK_NAME = "file_block";
export const RECORD_AUDIO_BLOCK_NAME = "record_audio_block";
export const RECORD_VIDEO_BLOCK_NAME = "record_video_block";
export const QUIZ_BLOCK_NAME = "quiz_block";
export const COMMON_EMBED_BLOCK_NAME = "common_embed_block";
export const PAGE_BLOCK_NAME = "page_block";
export const COMMON_ZENBLOCK_NAME = "common_zenblock";

export default function rules({
  rules = {},
  plugins = [],
}: {
  rules?: Record<string, any>;
  plugins?: PluginSimple[];
}) {
  const markdownIt = markdownit("default", {
    breaks: false,
    html: false,
    linkify: false,
    ...rules,
  })
    .use(zenklassBlockRule(37, FILE_BLOCK_NAME)) // %%%
    .use(zenklassBlockRule(123, RECORD_AUDIO_BLOCK_NAME)) // {{{
    .use(zenklassBlockRule(125, RECORD_VIDEO_BLOCK_NAME)) //  }}}
    .use(zenklassBlockRule(38, QUIZ_BLOCK_NAME)) // &&&
    .use(zenklassBlockRule(91, COMMON_EMBED_BLOCK_NAME, true)) // [[[
    .use(zenklassBlockRule(40, PAGE_BLOCK_NAME)) // (((
    .use(zenklassBlockRule(93, COMMON_ZENBLOCK_NAME)) // ]]]
    .use(fillInBlank)
    .use(feedbackText);

  plugins.forEach((plugin) => markdownIt.use(plugin));

  // Temporary disable these rules to investigate bugs.
  markdownIt.disable(["code", "fence"]);

  return markdownIt;
}
