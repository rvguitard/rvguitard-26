import type { Metadata } from "next";
import { LoadingStateLab } from "@/components/loading-state-lab";

export const metadata: Metadata = {
  title: "Loading State Lab | Rock Vincent Guitard",
  description: "Replayable loading state prototypes for Rock Vincent Guitard's portfolio.",
};

export default function LoadingStatesPage() {
  return <LoadingStateLab />;
}
