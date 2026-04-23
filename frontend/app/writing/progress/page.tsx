import type { Metadata } from "next";
import ProgressClient from "./ProgressClient";

export const metadata: Metadata = {
  title: "Tiến độ Writing · Lingona",
  description:
    "Theo dõi xu hướng band Writing, trung bình tháng trước vs tháng này, và pattern lỗi lặp lại để biết mình cần luyện gì tiếp theo.",
};

export default function WritingProgressPage() {
  return <ProgressClient />;
}
