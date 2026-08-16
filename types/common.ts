export type Status =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "submitted"
  | "draft"
  | "available"
  | "unavailable";

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
