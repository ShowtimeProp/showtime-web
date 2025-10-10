import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import VisionHelp from "./sanity/components/VisionHelp";
import { AutoTranslateAction, withAutoSyncPublish } from "./sanity/components/actions/AutoTranslateAction";
import { PublishReminderBadge } from "./sanity/components/actions/PublishReminderBadge";

// NextStudio loads this config in the browser too, so we must read from NEXT_PUBLIC_* envs.
// Fallback to server-only vars if present during build.
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "showtimeprop",
  title: "Showtime Prop Studio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Vision helpers link
            S.listItem()
              .title("🔎 Vision Cheatsheet")
              .child(
                S.component(VisionHelp)
                  .title("Vision Cheatsheet")
              ),
            // Divider and default document lists
            S.divider(),
            ...S.documentTypeListItems(),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev) => {
      // Do not wrap publish for now; keep original to ensure reliability
      return [AutoTranslateAction, ...prev];
    },
    badges: (prev) => [PublishReminderBadge, ...prev],
  },
});
