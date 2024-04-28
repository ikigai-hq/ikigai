import { EmbedDescriptor } from "@ikigai/editor/dist/types";
import { YoutubeIcon } from "./YoutubeIcon";
import { CommonEmbedBlock } from "../extensions/CommonEmbedExtension/CommonEmbedBlock";

export const embedList: EmbedDescriptor[] = [
  {
    title: "YouTube",
    keywords: "youtube video tube google",
    defaultHidden: true,
    // @ts-ignore
    icon: YoutubeIcon,
    matcher: (url) => {
      return url.match(
        /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([a-zA-Z0-9_-]{11})/,
      );
    },
    component: CommonEmbedBlock,
  },
];
