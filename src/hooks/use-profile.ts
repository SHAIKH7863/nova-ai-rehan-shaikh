import { useLocalStorage } from "./use-local-storage";

export type ExamKey =
  | "JEE"
  | "NEET"
  | "UPSC"
  | "SSC"
  | "CAT"
  | "GATE"
  | "CUET"
  | "NDA"
  | "CBSE"
  | "Other";

export const EXAMS: { key: ExamKey; label: string; emoji: string }[] = [
  { key: "JEE", label: "JEE Main / Advanced", emoji: "⚛️" },
  { key: "NEET", label: "NEET UG", emoji: "🩺" },
  { key: "UPSC", label: "UPSC CSE", emoji: "🏛️" },
  { key: "SSC", label: "SSC CGL/CHSL", emoji: "📋" },
  { key: "CAT", label: "CAT / MBA", emoji: "📊" },
  { key: "GATE", label: "GATE", emoji: "⚙️" },
  { key: "CUET", label: "CUET", emoji: "🎓" },
  { key: "NDA", label: "NDA / Defence", emoji: "🛡️" },
  { key: "CBSE", label: "Board Exams", emoji: "📚" },
  { key: "Other", label: "Other", emoji: "✨" },
];

export type Profile = {
  name: string;
  exam: ExamKey | null;
  examDate: string | null; // ISO yyyy-mm-dd
  onboarded: boolean;
};

const DEFAULT: Profile = {
  name: "",
  exam: null,
  examDate: null,
  onboarded: false,
};

export function useProfile() {
  return useLocalStorage<Profile>("nova:profile", DEFAULT);
}
