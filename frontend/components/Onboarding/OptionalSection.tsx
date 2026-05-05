"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PresetButtonGroup, { type PresetOption } from "./PresetButtonGroup";

/**
 * OptionalSection — collapsible block at the end of Step 2 (target
 * band) holding 3 personalisation fields:
 *   1. Exam date bucket
 *   2. Weekly study time bucket
 *   3. IELTS exam type (Academic / General Training)
 *
 * Sprint 4D scope — UI only. Backend persistence ships in Sprint 4E.1
 * via migration 0057 + extended POST /onboarding/complete body. Until
 * then the controller's manual destructure validator silently drops
 * unknown fields (audited 4A) so the frontend can send these values
 * today without 400-ing.
 *
 * Per .claude/skills/lingona-design:
 * - 06-motion/framer-variants.md: AnimatePresence height 0 → auto
 *   pattern with overflow-hidden parent (height-auto without overflow
 *   flashes content during measure phase).
 * - 03-components/primary-button.md: trigger uses link-style chevron
 *   (no fill, navy text on cream, rotates on toggle).
 *
 * Step indicator stays "2 / 2" — this section does NOT add a third
 * step (Q2b lock). It's an inline expansion of Step 2.
 */

export type ExamDateBucket = "1m" | "2-3m" | "4-6m" | "no_plan";
export type StudyHoursBucket = "3-5h" | "6-10h" | "10h+";
export type ExamType = "academic" | "general";

const EXAM_DATE_OPTIONS: PresetOption<ExamDateBucket>[] = [
  { value: "1m", label: "1 tháng nữa" },
  { value: "2-3m", label: "2-3 tháng nữa" },
  { value: "4-6m", label: "4-6 tháng nữa" },
  { value: "no_plan", label: "Chưa lên kế hoạch" },
];

const STUDY_HOURS_OPTIONS: PresetOption<StudyHoursBucket>[] = [
  { value: "3-5h", label: "3-5 giờ" },
  { value: "6-10h", label: "6-10 giờ" },
  { value: "10h+", label: "Trên 10 giờ" },
];

const EXAM_TYPE_OPTIONS: PresetOption<ExamType>[] = [
  { value: "academic", label: "Academic" },
  { value: "general", label: "General Training" },
];

export interface OptionalSectionProps {
  expanded: boolean;
  onToggle: () => void;
  examDate: ExamDateBucket | null;
  studyHours: StudyHoursBucket | null;
  examType: ExamType;
  onExamDateChange: (v: ExamDateBucket) => void;
  onStudyHoursChange: (v: StudyHoursBucket) => void;
  onExamTypeChange: (v: ExamType) => void;
}

export default function OptionalSection({
  expanded,
  onToggle,
  examDate,
  studyHours,
  examType,
  onExamDateChange,
  onStudyHoursChange,
  onExamTypeChange,
}: OptionalSectionProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls="optional-section-content"
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-navy/60 hover:text-teal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-3 py-2"
      >
        <span>{expanded ? "Thu gọn" : "Thêm thông tin để cá nhân hóa"}</span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="optional-section-content"
            key="optional-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-6 text-left bg-cream-warm border border-gray-200 rounded-lg p-6">
              <PresetButtonGroup<ExamDateBucket>
                label="Khi nào bạn dự định thi?"
                options={EXAM_DATE_OPTIONS}
                value={examDate}
                onChange={onExamDateChange}
              />
              <PresetButtonGroup<StudyHoursBucket>
                label="Bạn học bao nhiêu giờ mỗi tuần?"
                options={STUDY_HOURS_OPTIONS}
                value={studyHours}
                onChange={onStudyHoursChange}
              />
              <PresetButtonGroup<ExamType>
                label="Loại đề"
                options={EXAM_TYPE_OPTIONS}
                value={examType}
                onChange={onExamTypeChange}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
